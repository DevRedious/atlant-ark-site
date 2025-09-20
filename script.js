const API_URL = "https://atlantark-token.up.railway.app";
let currentUser = null;

// Base de données des mods
const ATLANTARK_MODS = [
  {
    id: 933099,
    name: "Super Cryo Storage",
    emoji: "🧊",
    description: "Stockage de vos créatures en cryopods, sans timer ni restrictions.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/super-cryo-storage",
    icon: "super-cryo-storage.png"
  },
  {
    id: 1007416,
    name: "Amissa Additions",
    emoji: "⭐",
    description: "Permet le transfert complet des dinosaures depuis la carte Amissa vers vos autres maps.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/amissa-additions",
    icon: "amissa-additions.png"
  },
  {
    id: 976409,
    name: "Amissa Structures",
    emoji: "🏗️",
    description: "Ajoute les structures de la carte Amissa.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/amissa-structures",
    icon: "amissa-structures.png"
  },
  {
    id: 912815,
    name: "S+ Dino Variants",
    emoji: "🐉",
    description: "Variants colorés et améliorés des dinosaures classiques.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/s-dino-variants",
    icon: "s-dino-variants.png"
  },
  {
    id: 1177331,
    name: "S+ Dino Variants: Fantastic Tames",
    emoji: "✨",
    description: "Variants colorés et améliorés des dinosaures fantastiques.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/s-dino-variants-fantastic-tames",
    icon: "s-dino-variants-fantastic-tame.png"
  },
  {
    id: 959521,
    name: "Breeding Stopper",
    emoji: "🛑",
    description: "Arrête automatiquement les reproductions quand vous vous déconnectez du serveur ou changez de maps.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/breeding-stopper",
    icon: "breeding-stopper.png"
  },
  {
    id: 942339,
    name: "JVH Pickup Tool",
    emoji: "🔧",
    description: "Outil de ramassage avancé pour vos structures.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/jvh-pickup-tool",
    icon: "jvh-pickup-tool.png"
  },
  {
    id: 944162,
    name: "Shoko Decoration",
    emoji: "🎨",
    description: "Ajoute de nombreux éléments décoratifs et mobiliers pour personnaliser vos bases.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/shoko-decoration",
    icon: "shoko-decoration.png"
  },
  {
    id: 933447,
    name: "Alfa Oceanic Platforms",
    emoji: "🌊",
    description: "Plateformes océaniques pour construire sur l'eau.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/alfaoceanicplataforms",
    icon: "alfa-oceanic-platforms.png"
  },
  {
    id: 1019389,
    name: "Net Pro",
    emoji: "🕸️",
    description: "Permet de capturer les créatures pour faciliter l'apprivoisement.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/net-pro",
    icon: "net-pro.png"
  },
  {
    id: 950265,
    name: "Euthanasia Gun",
    emoji: "💊",
    description: "Permet de tuer vos dinos.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/euthanasia-gun",
    icon: "euthanasia-gun.png"
  },
  {
    id: 929420,
    name: "Super Spyglass Plus",
    emoji: "🔍",
    description: "Longue-vue améliorée avec informations détaillées sur les créatures.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/super-spyglass-plus",
    icon: "super-spyglass-plus.png"
  },
  {
    id: 1265191,
    name: "Server Mod Atlantark",
    emoji: "🌋",
    description: "Mod serveur exclusif Atlant-Ark.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/server-mod-atlantark",
    icon: "server-mod-atlantark.png",
    special: true
  },
  {
    id: 929868,
    name: "Admin Panel",
    emoji: "⚙️",
    description: "Panneau d'administration avancé pour la gestion serveur.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/admin-panel",
    icon: "admin-panel.png"
  },
  {
    id: 928708,
    name: "Custom Dino Levels",
    emoji: "📈",
    description: "Permet de générer des dinosaures de niveaux plus élevés.",
    url: "https://www.curseforge.com/ark-survival-ascended/mods/custom-dino-levels",
    icon: "custom-dino-levels.png"
  }
];

// ===========================
// NAVIGATION PAR SECTIONS
// ===========================

function showSection(sectionId) {
  // Masquer toutes les sections
  const sections = document.querySelectorAll('.section, .hero');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  
  // Afficher la section demandée
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
  }
  
  // Mettre à jour la navigation active
  setActiveNav(sectionId);
  
  // Charger les données si nécessaire
  if (sectionId === 'stats') {
    loadStats();
  } else if (sectionId === 'mods') {
    loadMods();
  }
}

function setActiveNav(targetId) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const targetLink = document.querySelector(`[href="#${targetId}"]`);
  if (targetLink) {
    targetLink.classList.add('active');
  }
}

// Navigation par sections au lieu de smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    showSection(targetId);
  });
});

// ===========================
// AUTHENTIFICATION DISCORD
// ===========================

function loginWithDiscord() {
  window.location.href = `${API_URL}/auth/discord`;
}

function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  menu.classList.toggle('active');
}

function logout() {
  localStorage.removeItem('auth_token');
  currentUser = null;
  
  document.getElementById('login-btn').style.display = 'flex';
  document.getElementById('user-profile').style.display = 'none';
  
  showNotification('Déconnecté avec succès');
}

function showProfile() {
  showNotification('Page profil - En développement');
}

function showHistory() {
  showNotification('Historique des enchères - En développement');
}

async function verifyAndLoadUser(token) {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.valid) {
        currentUser = data.user;
        showUserInterface();
        await loadUserProfile();
      }
    } else {
      localStorage.removeItem('auth_token');
    }
  } catch (err) {
    console.error('Erreur vérification token:', err);
    localStorage.removeItem('auth_token');
  }
}

function showUserInterface() {
  document.getElementById('login-btn').style.display = 'none';
  document.getElementById('user-profile').style.display = 'block';
}

async function loadUserProfile() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const profile = await response.json();
      
      document.getElementById('user-name').textContent = profile.username;
      document.getElementById('user-balance').innerHTML = `<img src="assets/images/aqualis.png" class="currency-icon" alt="Aqualis"> ${profile.balance}`;
      
      if (profile.avatar_url) {
        document.getElementById('user-avatar').src = profile.avatar_url;
      }
    }
  } catch (err) {
    console.error('Erreur profil:', err);
  }
}

// ===========================
// CHARGEMENT DES DONNÉES
// ===========================

// Chargement des statistiques
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/stats`);
    const data = await res.json();

    document.getElementById("stats-loader").style.display = "none";
    document.getElementById("stats-content").style.display = "grid";

    // Mise à jour des stats principales
    document.getElementById("player-count").innerText = data.players_online;
    document.getElementById("uptime").innerText = data.uptime;
    document.getElementById("auctions").innerText = data.active_auctions;
    document.getElementById("registered-players").innerText = data.registered_players;
    
    // Mise à jour du badge dans la nav
    document.getElementById("quick-players").innerText = data.players_online;
  } catch (err) {
    console.error("Erreur stats:", err);
    document.getElementById("stats-loader").style.display = "none";
    document.getElementById("stats-content").innerHTML = '<p style="color: #ff4444; text-align: center;">⚠️ Impossible de charger les statistiques</p>';
    document.getElementById("stats-content").style.display = "block";
    
    // Fallback pour le badge
    document.getElementById("quick-players").innerText = "0";
  }
}

// Chargement des mods
async function loadMods() {
  try {
    document.getElementById("mods-loader").style.display = "none";
    const container = document.getElementById("mods-list");
    container.style.display = "block";
    container.innerHTML = "";

    // Header avec statistiques
    const statsHeader = document.createElement("div");
    statsHeader.style.cssText = "display: flex; gap: 2rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap;";
    statsHeader.innerHTML = `
      <div class="card" style="text-align: center; padding: 1.5rem; min-width: 150px;">
        <div class="card-number">${ATLANTARK_MODS.length}</div>
        <div class="card-label">Mods Installés</div>
      </div>
      <div class="card" style="text-align: center; padding: 1.5rem; min-width: 150px;">
        <div class="card-number">1</div>
        <div class="card-label">Mod Exclusif</div>
      </div>
    `;
    container.appendChild(statsHeader);

    // Grid des mods
    const modsGrid = document.createElement("div");
    modsGrid.className = "mods-grid";
    
    ATLANTARK_MODS.forEach(mod => {
      const modElement = document.createElement("div");
      modElement.className = `mod-card card ${mod.special ? 'special' : ''}`;
      modElement.style.position = 'relative';
      
      modElement.innerHTML = `
        <div class="mod-header">
          <div class="mod-icon-container">
            <img src="assets/images/mod-icons/${mod.icon}" 
                 alt="${mod.name}" 
                 class="mod-icon" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="mod-emoji" style="display:none;">${mod.emoji}</div>
          </div>
          <div>
            <h3 class="mod-name">${mod.name}</h3>
            <div class="mod-id">ID: ${mod.id}</div>
          </div>
          ${mod.special ? '<div class="exclusive-badge">🌋 Exclusif</div>' : ''}
        </div>
        <p class="mod-description">${mod.description}</p>
        <a href="${mod.url}" target="_blank" class="mod-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
          Voir sur CurseForge
        </a>
      `;
      
      modsGrid.appendChild(modElement);
    });
    
    container.appendChild(modsGrid);

  } catch (err) {
    console.error("Erreur mods:", err);
    document.getElementById("mods-loader").style.display = "none";
    document.getElementById("mods-list").innerHTML = '<p style="color: #ff4444; text-align: center;">⚠️ Impossible de charger la liste des mods</p>';
    document.getElementById("mods-list").style.display = "block";
  }
}

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

// Fonction de partage
function shareServer() {
  if (navigator.share) {
    navigator.share({
      title: "Atlant'ARK - Serveur ARK ASA FR",
      text: 'Rejoignez le meilleur serveur ARK communautaire !',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    showNotification('Lien copié dans le presse-papiers !');
  }
}

// Système de notifications
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--card-bg);
    border: 1px solid var(--neon-green);
    color: var(--neon-green);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    z-index: 10000;
    transform: translateX(100%);
    transition: var(--transition);
    box-shadow: var(--shadow-neon);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// ===========================
// ÉVÉNEMENTS
// ===========================

// Fermer les dropdowns en cliquant ailleurs
document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-profile')) {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
      userMenu.classList.remove('active');
    }
  }
});

// ===========================
// INITIALISATION
// ===========================

// Initialisation au chargement
window.addEventListener('load', async () => {
  // Gestion de l'authentification
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const error = urlParams.get('error');

  if (error) {
    console.error('Erreur auth:', error);
    showNotification('Erreur de connexion: ' + error, 'error');
    return;
  }

  if (token) {
    localStorage.setItem('auth_token', token);
    window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
    showNotification('Connexion réussie !');
  }

  const savedToken = localStorage.getItem('auth_token');
  if (savedToken) {
    await verifyAndLoadUser(savedToken);
  }

  // Afficher uniquement la section hero au démarrage
  showSection('hero');
});

// Auto-refresh des statistiques toutes les 30 secondes
setInterval(loadStats, 30000);

// Auto-refresh du profil utilisateur toutes les 2 minutes
setInterval(() => {
  if (currentUser) {
    loadUserProfile();
  }
}, 120000);
