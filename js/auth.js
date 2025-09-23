// =============================================
//   AUTH.JS - SYSTÈME D'AUTHENTIFICATION
//   Atlant'ARK - Gestion complète de l'auth Discord
// =============================================

// Configuration API
const API_BASE_URL = 'https://atlantark-token.up.railway.app';

// Variables globales
let currentUser = null;
let userMenuVisible = false;

// =============================================
//   INITIALISATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Système d\'authentification initialisé');
    
    // Vérifier l'état d'authentification
    checkAuthenticationStatus();
    
    // Vérifier les messages de redirection
    checkForRedirectMessage();
    
    // Charger les stats du serveur
    loadServerStats();
    
    // Charger les Aqualis si connecté
    updateUserAqualis();
    
    // Initialiser les événements
    initializeEventListeners();
});

// =============================================
//   GESTION DE L'AUTHENTIFICATION
// =============================================

async function checkAuthenticationStatus() {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
        showLoginButton();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            await showUserProfile();
        } else {
            // Token invalide
            localStorage.removeItem('auth_token');
            showLoginButton();
        }
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        showLoginButton();
    }
}

function loginWithDiscord() {
    window.location.href = `${API_BASE_URL}/auth/discord`;
}

function logout() {
    localStorage.removeItem('auth_token');
    currentUser = null;
    showLoginButton();
    
    // Fermer le menu s'il est ouvert
    hideUserMenu();
    
    // Rediriger vers l'accueil si on est sur une page protégée
    if (window.location.pathname.includes('economie.html')) {
        window.location.href = 'index.html';
    }
}

// =============================================
//   GESTION DE L'INTERFACE UTILISATEUR
// =============================================

function showLoginButton() {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    
    if (loginBtn) {
        loginBtn.style.display = 'flex';
    }
    if (userProfile) {
        userProfile.style.display = 'none';
    }
}

async function showUserProfile() {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    
    if (loginBtn) {
        loginBtn.style.display = 'none';
    }
    if (userProfile) {
        userProfile.style.display = 'flex';
        await updateUserProfileDisplay();
    }
}

async function updateUserProfileDisplay() {
    if (!currentUser) return;
    
    // Mettre à jour l'avatar
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && currentUser.avatar) {
        userAvatar.src = `https://cdn.discordapp.com/avatars/${currentUser.discord_id}/${currentUser.avatar}.png`;
        userAvatar.alt = `Avatar de ${currentUser.username}`;
    }
    
    // Mettre à jour le nom
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.textContent = currentUser.username;
    }
    
    // Mettre à jour le solde
    await updateUserBalance();
    
    // Mettre à jour les Aqualis
    await updateUserAqualis();
}

// Fonction corrigée pour récupérer le profil utilisateur
async function updateUserBalance() {
    const userBalance = document.getElementById('user-balance');
    if (!userBalance) return;

    try {
        const token = localStorage.getItem('auth_token');
        // ROUTE CORRIGÉE : /user/profile au lieu de /economy/balance
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const balanceText = document.getElementById('balance-value');
            if (balanceText) {
                balanceText.textContent = data.balance || 0;
            }

        }
    } catch (error) {
        console.error('Erreur chargement solde:', error);
        // Garder l'affichage par défaut en cas d'erreur
    }
}

// Fonction pour mettre à jour les Aqualis
async function updateUserAqualis() {
    const userBalance = document.getElementById('user-balance');
    if (!userBalance || !isLoggedIn() || !currentUser || !currentUser.discord_id) {
        console.log('🔍 updateUserAqualis: conditions non remplies', {
            userBalance: !!userBalance,
            isLoggedIn: isLoggedIn(),
            currentUser: !!currentUser,
            discord_id: currentUser?.discord_id
        });
        return;
    }

    try {
        console.log(`🔄 Récupération Aqualis pour user_id: ${currentUser.discord_id}`);
        const aqualisResponse = await fetch(`${API_BASE_URL}/api/user/aqualis?user_id=${currentUser.discord_id}`);
        
        if (aqualisResponse.ok) {
            const aqualisData = await aqualisResponse.json();
            console.log('✅ Données Aqualis reçues:', aqualisData);
            
            // Trouver l'élément du solde Aqualis dans le widget utilisateur
            const aqualisIcon = userBalance.querySelector('img[alt="Aqualis"]');
            if (aqualisIcon) {
                // Le texte se trouve généralement après l'icône
                let balanceText = aqualisIcon.nextSibling;
                if (balanceText && balanceText.nodeType === Node.TEXT_NODE) {
                    balanceText.textContent = ` ${aqualisData.total}`;
                } else {
                    // Si pas de nœud texte, chercher un span ou autre élément
                    const balanceSpan = aqualisIcon.parentElement.querySelector('.balance-value, [id$="balance"]');
                    if (balanceSpan) {
                        balanceSpan.textContent = aqualisData.total;
                    }
                }
            }
        } else {
            console.warn(`⚠️ Échec récupération Aqualis: ${aqualisResponse.status} ${aqualisResponse.statusText}`);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des Aqualis:', error);
    }
}

// =============================================
//   GESTION DU MENU UTILISATEUR
// =============================================

function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (!userMenu) return;
    
    if (userMenuVisible) {
        hideUserMenu();
    } else {
        showUserMenu();
    }
}

function showUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.add('active');
        userMenuVisible = true;
        
        // Fermer le menu si on clique ailleurs
        setTimeout(() => {
            document.addEventListener('click', closeMenuOnClickOutside);
        }, 100);
    }
}

function hideUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.remove('active');
        userMenuVisible = false;
        document.removeEventListener('click', closeMenuOnClickOutside);
    }
}

function closeMenuOnClickOutside(event) {
    const userProfile = document.getElementById('user-profile');
    if (userProfile && !userProfile.contains(event.target)) {
        hideUserMenu();
    }
}

// =============================================
//   ACTIONS DU MENU UTILISATEUR
// =============================================

function showProfile() {
    hideUserMenu();
    
    if (!currentUser) {
        alert('Erreur: Utilisateur non connecté');
        return;
    }
    
    // Créer et afficher un modal de profil
    showProfileModal();
}

function showHistory() {
    hideUserMenu();
    
    if (!currentUser) {
        alert('Erreur: Utilisateur non connecté');
        return;
    }
    
    // Rediriger vers la page économie
    goToEconomy();
}

function showProfileModal() {
    // Supprimer le modal existant s'il y en a un
    const existingModal = document.getElementById('profile-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Créer le modal
    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius-lg);
        padding: var(--spacing-2xl);
        max-width: 400px;
        width: 90%;
        text-align: center;
    `;
    
    modalContent.innerHTML = `
        <h2 style="color: var(--neon-green); margin-bottom: var(--spacing-lg);">Mon Profil</h2>
        <img src="https://cdn.discordapp.com/avatars/${currentUser.discord_id}/${currentUser.avatar}.png" 
             alt="Avatar" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: var(--spacing-md);">
        <h3 style="color: var(--text-primary); margin-bottom: var(--spacing-sm);">${currentUser.username}</h3>
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">Membre d'Atlant'ARK</p>
        <button onclick="closeProfileModal()" class="btn-primary" style="margin-top: var(--spacing-md);">
            Fermer
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Fermer avec Escape
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeProfileModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.remove();
    }
}

// =============================================
//   GESTION DE L'ÉCONOMIE
// =============================================

function goToEconomy() {
    const token = localStorage.getItem('auth_token');
    
    if (!token || !currentUser) {
        // Pas connecté - proposer la connexion
        if (confirm('Vous devez être connecté pour accéder à votre solde. Se connecter maintenant ?')) {
            loginWithDiscord();
        }
        return;
    }
    
    // Connecté - aller à la page économie
    window.location.href = 'economie.html';
}

// Actualiser le solde (appelable depuis d'autres pages)
async function refreshUserBalance() {
    await updateUserBalance();
    await updateUserAqualis();
}

// Actualiser seulement les Aqualis
async function refreshUserAqualis() {
    await updateUserAqualis();
}

// =============================================
//   GESTION DES REDIRECTIONS
// =============================================

function checkForRedirectMessage() {
    const message = sessionStorage.getItem('balance_redirect_message') || 
                   sessionStorage.getItem('economy_redirect_message');
    
    if (message) {
        // Supprimer le message pour qu'il ne s'affiche qu'une fois
        sessionStorage.removeItem('balance_redirect_message');
        sessionStorage.removeItem('economy_redirect_message');
        
        // Afficher le message à l'utilisateur
        showRedirectNotification(message);
    }
}

function showRedirectNotification(message) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 193, 7, 0.95);
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        border-left: 4px solid #ffc107;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        max-width: 350px;
        font-weight: 500;
        backdrop-filter: blur(10px);
        animation: slideInFromRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>⚠️</span>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                margin-left: auto;
                color: #000;
                font-weight: bold;
            ">×</button>
        </div>
    `;
    
    // Ajouter les styles CSS pour l'animation
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInFromRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInFromRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// =============================================
//   GESTION DES STATS DU SERVEUR
// =============================================

async function loadServerStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (response.ok) {
            const data = await response.json();
            updateServerStats(data);
        }
    } catch (error) {
        console.error('Erreur chargement stats:', error);
        // Garder les valeurs par défaut
    }
}

function updateServerStats(stats) {
    // Mettre à jour le compteur de joueurs en ligne
    const quickPlayers = document.getElementById('quick-players');
    if (quickPlayers && stats.players_online) {
        quickPlayers.textContent = stats.players_online;
    }
    
    // Mettre à jour d'autres stats si nécessaire
    const playerCount = document.getElementById('player-count');
    if (playerCount && stats.players_online) {
        playerCount.textContent = stats.players_online;
    }
    
    const uptime = document.getElementById('uptime');
    if (uptime && stats.uptime) {
        uptime.textContent = stats.uptime;
    }
    
    const auctions = document.getElementById('auctions');
    if (auctions && stats.active_auctions !== undefined) {
        auctions.textContent = stats.active_auctions;
    }
    
    const registeredPlayers = document.getElementById('registered-players');
    if (registeredPlayers && stats.registered_players) {
        registeredPlayers.textContent = stats.registered_players;
    }
}

// =============================================
//   GESTION DES ÉVÉNEMENTS
// =============================================

function initializeEventListeners() {
    // Fermer le menu utilisateur avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && userMenuVisible) {
            hideUserMenu();
        }
    });
    
    // Gestion de l'URL pour l'auth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (token) {
        // Sauvegarder le token et nettoyer l'URL
        localStorage.setItem('auth_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Recharger l'état d'authentification
        setTimeout(() => {
            checkAuthenticationStatus();
        }, 100);
    } else if (error) {
        // Gérer les erreurs d'authentification
        console.error('Erreur auth:', error);
        showRedirectNotification('Erreur de connexion avec Discord');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// =============================================
//   FONCTIONS UTILITAIRES
// =============================================

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return currentUser !== null && localStorage.getItem('auth_token') !== null;
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    return currentUser;
}

// Obtenir le token d'authentification
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// Faire un appel API authentifié
async function apiCall(endpoint, options = {}) {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Non authentifié');
    }
    
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: defaultOptions.headers
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            // Token expiré
            logout();
            throw new Error('Session expirée');
        }
        throw new Error(`Erreur API: ${response.status}`);
    }
    
    return response.json();
}

// =============================================
//   EXPORTS POUR UTILISATION GLOBALE
// =============================================

// Rendre les fonctions disponibles globalement
window.AuthModule = {
    loginWithDiscord,
    logout,
    toggleUserMenu,
    showProfile,
    showHistory,
    goToEconomy,
    refreshUserBalance,
    refreshUserAqualis,
    isLoggedIn,
    getCurrentUser,
    getAuthToken,
    apiCall
};

// Actualisation périodique des stats (toutes les 30 secondes)
setInterval(() => {
    loadServerStats();
    if (isLoggedIn()) {
        updateUserBalance();
        updateUserAqualis();
    }
}, 30000);

console.log('✅ Module d\'authentification chargé');
