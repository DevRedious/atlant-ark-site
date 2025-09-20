// ===========================
// CONFIGURATION
// ===========================

const API_URL = "https://atlantark-token.up.railway.app";
let currentUser = null;

// ===========================
// AUTHENTIFICATION DISCORD
// ===========================

function loginWithDiscord() {
  window.location.href = `${API_URL}/auth/discord`;
}

function toggleUserMenu() {
  const menu = document.getElementById('user-menu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

function logout() {
  localStorage.removeItem('auth_token');
  currentUser = null;
  
  const loginBtn = document.getElementById('login-btn');
  const userProfile = document.getElementById('user-profile');
  
  if (loginBtn) loginBtn.style.display = 'flex';
  if (userProfile) userProfile.style.display = 'none';
  
  // Masquer le dashboard si on est sur la page serveur
  const dashboard = document.getElementById('user-dashboard');
  if (dashboard) {
    dashboard.style.display = 'none';
  }
  
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
  const loginBtn = document.getElementById('login-btn');
  const userProfile = document.getElementById('user-profile');
  
  if (loginBtn) loginBtn.style.display = 'none';
  if (userProfile) userProfile.style.display = 'block';
  
  // Afficher le dashboard si on est sur la page serveur
  const dashboard = document.getElementById('user-dashboard');
  if (dashboard) {
    dashboard.style.display = 'block';
  }
}

async function loadUserProfile() {
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const profile = await response.json();
      
      // Mise à jour des éléments de profil
      const userName = document.getElementById('user-name');
      const userBalance = document.getElementById('user-balance');
      const userAvatar = document.getElementById('user-avatar');
      
      if (userName) userName.textContent = profile.username;
      if (userBalance) {
        userBalance.innerHTML = `<img src="assets/images/aqualis.png" class="currency-icon" alt="Aqualis"> ${profile.balance}`;
      }
      if (userAvatar && profile.avatar_url) {
        userAvatar.src = profile.avatar_url;
      }

      // Mise à jour du dashboard si présent
      const myBalance = document.getElementById('my-balance');
      const myWins = document.getElementById('my-wins');
      const myRank = document.getElementById('my-rank');
      const myAuctions = document.getElementById('my-auctions');
      
      if (myBalance) myBalance.textContent = profile.balance.toLocaleString();
      if (myWins) myWins.textContent = profile.auction_wins || 0;
      if (myRank) myRank.textContent = profile.rank || '#-';
      if (myAuctions) myAuctions.textContent = profile.total_auctions || 0;
    }
  } catch (err) {
    console.error('Erreur profil:', err);
  }
}

// ===========================
// CHARGEMENT RAPIDE DES STATS
// ===========================

async function loadQuickStats() {
  try {
    const res = await fetch(`${API_URL}/stats`);
    const data = await res.json();
    
    // Mise à jour du badge dans la navigation
    const quickPlayers = document.getElementById('quick-players');
    if (quickPlayers) {
      quickPlayers.innerText = data.players_online || 0;
    }
  } catch (err) {
    console.error("Erreur stats rapides:", err);
    const quickPlayers = document.getElementById('quick-players');
    if (quickPlayers) {
      quickPlayers.innerText = "0";
    }
  }
}

// ===========================
// SYSTÈME DE NOTIFICATIONS
// ===========================

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
    font-family: 'Inter', sans-serif;
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
// ÉVÉNEMENTS ET INITIALISATION
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

  // Chargement des stats rapides pour le badge
  loadQuickStats();
});

// Auto-refresh du profil utilisateur toutes les 2 minutes
setInterval(() => {
  if (currentUser) {
    loadUserProfile();
  }
}, 120000);

// Auto-refresh des stats rapides toutes les 30 secondes
setInterval(loadQuickStats, 30000);
