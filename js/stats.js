// ===========================
// CONFIGURATION
// ===========================
// Utilisation de la configuration partagée depuis auth.js
const API_URL = window.API_BASE_URL || 'https://atlantark-token.up.railway.app';

// ===========================
// CHARGEMENT DES STATISTIQUES
// ===========================

async function loadStats() {
  try {
    console.log("🔄 Chargement des statistiques depuis:", `${API_URL}/stats`);
    
    // 🔒 Utilisation de l'API sécurisée si disponible
    let data;
    if (typeof secureApiCall === 'function') {
      console.log("🛡️ Utilisation de l'API sécurisée");
      data = await secureApiCall('/stats', 'GET');
    } else {
      // Fallback vers fetch classique si auth.js non chargé
      console.log("⚠️ Fallback vers fetch standard");
      const res = await fetch(`${API_URL}/stats`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      data = await res.json();
    }
    
    console.log("✅ Données reçues:", data);

    // Masquer le loader et afficher le contenu
    const statsLoader = document.getElementById("stats-loader");
    const statsContent = document.getElementById("stats-content");
    
    if (statsLoader) statsLoader.style.display = "none";
    if (statsContent) statsContent.style.display = "grid";

    // Mise à jour des statistiques principales
    updateStatElement("player-count", data.players_online);
    updateStatElement("uptime", data.uptime);
    updateStatElement("auctions", data.active_auctions);
    updateStatElement("registered-players", data.registered_players);
    
    // Mise à jour du badge dans la navigation
    updateStatElement("quick-players", data.players_online);
    
    console.log("✅ Statistiques chargées avec succès");
  } catch (err) {
    console.error("❌ Erreur lors du chargement des statistiques:", err);
    handleStatsError();
  }
}

function updateStatElement(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = value || "0";
  }
}

function handleStatsError() {
  const statsLoader = document.getElementById("stats-loader");
  const statsContent = document.getElementById("stats-content");
  
  if (statsLoader) statsLoader.style.display = "none";
  if (statsContent) {
    statsContent.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
        <p style="color: #ff4444; font-size: 1.1rem; margin-bottom: 1rem;">
          ⚠️ Impossible de charger les statistiques
        </p>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">
          Le serveur API pourrait être temporairement indisponible. 
          <a href="javascript:loadStats()" style="color: var(--neon-green); text-decoration: underline;">
            Réessayer
          </a>
        </p>
      </div>
    `;
    statsContent.style.display = "block";
  }
  
  // Fallback pour le badge de navigation
  updateStatElement("quick-players", "0");
}

// ===========================
// FORMATAGE DES DONNÉES
// ===========================

function formatUptime(uptimeString) {
  // Si l'API retourne déjà un format lisible, on l'utilise
  // Sinon on peut implémenter une logique de formatage
  return uptimeString || "N/A";
}

function formatPlayerCount(count) {
  return parseInt(count) || 0;
}

function formatAuctions(auctions) {
  return parseInt(auctions) || 0;
}

function formatRegisteredPlayers(players) {
  const count = parseInt(players) || 0;
  // Format avec séparateurs de milliers si > 999
  return count > 999 ? count.toLocaleString('fr-FR') : count.toString();
}

// ===========================
// ANIMATIONS ET EFFETS
// ===========================

function animateStatCards() {
  const cards = document.querySelectorAll('.stats-grid .card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.5s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }, index * 100);
  });
}

function updateStatWithAnimation(elementId, newValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const currentValue = element.innerText;
  if (currentValue !== newValue.toString()) {
    element.style.transform = 'scale(1.1)';
    element.style.color = 'var(--neon-green-bright)';
    
    setTimeout(() => {
      element.innerText = newValue;
      element.style.transform = 'scale(1)';
      element.style.color = 'var(--neon-green)';
    }, 150);
  }
}

// ===========================
// GESTION DES ERREURS ET RETRY
// ===========================

let retryCount = 0;
const MAX_RETRIES = 3;

async function loadStatsWithRetry() {
  try {
    await loadStats();
    retryCount = 0; // Reset du compteur en cas de succès
  } catch (err) {
    console.error(`Tentative ${retryCount + 1} échouée:`, err);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Nouvelle tentative dans 5 secondes...`);
      setTimeout(loadStatsWithRetry, 5000);
    } else {
      console.error("Échec définitif du chargement des statistiques");
      handleStatsError();
    }
  }
}

// ===========================
// INITIALISATION ET AUTO-REFRESH
// ===========================

// Chargement initial des statistiques si on est sur la page serveur
if (window.location.pathname.includes('serveur.html') || 
    document.getElementById('stats-content')) {
  
  document.addEventListener('DOMContentLoaded', () => {
    loadStatsWithRetry();
  });
  
  // Auto-refresh des statistiques toutes les 30 secondes
  setInterval(() => {
    console.log("Actualisation automatique des statistiques...");
    loadStats();
  }, 30000);
}

// ===========================
// UTILITAIRES
// ===========================

function refreshStats() {
  console.log("Actualisation manuelle des statistiques...");
  loadStatsWithRetry();
}

// Exposer la fonction globalement pour les boutons de refresh
window.refreshStats = refreshStats;
