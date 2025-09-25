// =============================================
//   AUTH.JS - SYSTÈME D'AUTHENTIFICATION v2.1
//   Atlant'ARK - Compatible avec API corrigée
// =============================================

// Configuration API
const API_BASE_URL = 'https://atlantark-token.up.railway.app';

// Export global pour partage avec d'autres scripts
window.API_BASE_URL = API_BASE_URL;

// Variables globales
let currentUser = null;
let userMenuVisible = false;
let authInitialized = false;

// Export global de currentUser pour accès depuis d'autres scripts
function syncCurrentUser() {
    window.currentUser = currentUser;
}

// Initialisation
syncCurrentUser();

// =============================================
//   GESTION D'ERREURS AMÉLIORÉE
// =============================================

class AuthError extends Error {
    constructor(message, code = 'AUTH_ERROR') {
        super(message);
        this.name = 'AuthError';
        this.code = code;
    }
}

class APIError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}

// =============================================
//   GESTION CSRF ET SÉCURITÉ
// =============================================

function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf_token') {
            return value;
        }
    }
    return null;
}

function isSecureCookieMode() {
    return getCsrfToken() !== null;
}

async function secureApiCall(endpoint, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    // Ajouter token CSRF si disponible
    const csrfToken = getCsrfToken();
    if (csrfToken && ['POST', 'PUT', 'DELETE'].includes(options.method?.toUpperCase())) {
        defaultOptions.headers['X-CSRF-Token'] = csrfToken;
        console.log('🔒 Requête sécurisée avec CSRF token');
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            ...defaultOptions,
            headers: { ...defaultOptions.headers, ...options.headers }
        });
        
        // Gestion des erreurs HTTP
        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { error: errorText };
            }
            
            if (response.status === 401) {
                throw new AuthError(errorData.detail || 'Authentication required', 'AUTH_REQUIRED');
            } else if (response.status === 403) {
                throw new AuthError(errorData.detail || 'Permission denied', 'PERMISSION_DENIED');
            } else if (response.status === 429) {
                throw new APIError(errorData.detail || 'Too many requests', 429);
            } else {
                throw new APIError(errorData.detail || `HTTP ${response.status}`, response.status);
            }
        }
        
        return response;
    } catch (error) {
        if (error instanceof AuthError || error instanceof APIError) {
            throw error;
        }
        throw new APIError(`Network error: ${error.message}`);
    }
}

// =============================================
//   INITIALISATION AMÉLIORÉE
// =============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔐 Système d\'authentification v2.1 initialisé');
    
    try {
        // Initialisation séquentielle pour éviter les conflits
        await initializeAuthentication();
        authInitialized = true;
        console.log('✅ Authentication système initialisé');
    } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
        showLoginButton(); // Fallback sécurisé
    }
});

async function initializeAuthentication() {
    // Vérifier l'état d'authentification
    await checkAuthenticationStatus();
    
    // Vérifier les messages de redirection
    checkForRedirectMessage();
    
    // Charger les stats du serveur (non-bloquant)
    loadServerStats().catch(error => console.warn('Stats loading failed:', error));
    
    // Initialiser les événements
    initializeEventListeners();
    
    // Charger les Aqualis si connecté (non-bloquant)
    if (currentUser) {
        updateUserAqualis().catch(error => console.warn('Aqualis update failed:', error));
    }
}

// =============================================
//   GESTION DE L'AUTHENTIFICATION AMÉLIORÉE
// =============================================

async function refreshAccessToken() {
    try {
        // Mode sécurisé: refresh automatique via cookies
        if (isSecureCookieMode()) {
            console.log('🔒 Rafraîchissement sécurisé du token...');
            const response = await secureApiCall('/auth/refresh', {
                method: 'POST'
            });
            
            console.log('✅ Token rafraîchi avec succès (mode sécurisé)');
            return true;
        }
        
        // Mode compatibilité: localStorage
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) {
            console.log('🚫 Aucun refresh token disponible');
            return false;
        }
        
        console.log('⚠️ Rafraîchissement mode compatibilité...');
        const response = await secureApiCall('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.access_token && data.refresh_token) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            console.log('✅ Token rafraîchi avec succès');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Erreur rafraîchissement token:', error);
        
        if (error instanceof AuthError && error.code === 'AUTH_REQUIRED') {
            // Token de refresh invalide/expiré
            return false;
        }
        
        // Autres erreurs (réseau, etc) - peut-être temporaire
        throw error;
    }
}

async function checkAuthenticationStatus() {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    const old_token = localStorage.getItem('auth_token'); // Compatibilité
    
    if (!access_token && !old_token) {
        showLoginButton();
        return;
    }
    
    try {
        const token_to_use = access_token || old_token;
        const body_data = access_token ? 
            { access_token: token_to_use } : 
            { token: token_to_use };
        
        const response = await secureApiCall('/auth/verify', {
            method: 'POST',
            body: JSON.stringify(body_data)
        });
        
        const data = await response.json();
        console.log('🔍 Données utilisateur reçues:', data);
        
        currentUser = data.user;
        syncCurrentUser();
        await showUserProfile();
        
    } catch (error) {
        console.log('🔄 Erreur vérification token:', error);
        
        if (error instanceof AuthError && refresh_token) {
            // Token expiré, essayer de le rafraîchir
            console.log('🔄 Token expiré, tentative de rafraîchissement...');
            try {
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Réessayer avec le nouveau token
                    await checkAuthenticationStatus();
                    return;
                }
            } catch (refreshError) {
                console.error('Erreur lors du refresh:', refreshError);
            }
        }
        
        // Échec du refresh ou pas de refresh token, déconnecter
        clearAuthData();
        showLoginButton();
    }
}

function clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    currentUser = null;
    syncCurrentUser();
}

function loginWithDiscord() {
    window.location.href = `${API_BASE_URL}/auth/discord`;
}

async function logout() {
    try {
        if (isSecureCookieMode()) {
            console.log('🔒 Déconnexion sécurisée...');
            await secureApiCall('/auth/logout', {
                method: 'POST'
            });
        } else {
            const refresh_token = localStorage.getItem('refresh_token');
            if (refresh_token) {
                console.log('⚠️ Déconnexion mode compatibilité...');
                await secureApiCall('/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refresh_token })
                });
            }
        }
    } catch (error) {
        console.warn('Erreur lors de la révocation du token:', error);
    }
    
    clearAuthData();
    showLoginButton();
    hideUserMenu();
    
    // Rediriger vers l'accueil si sur page protégée
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
    
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
}

async function showUserProfile() {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) {
        userProfile.style.display = 'flex';
        await updateUserProfileDisplay();
    }
}

async function updateUserProfileDisplay() {
    if (!currentUser) {
        console.warn('⚠️ currentUser est null dans updateUserProfileDisplay');
        return;
    }
    
    syncCurrentUser();
    
    // Mettre à jour l'avatar
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && currentUser.avatar) {
        userAvatar.src = `https://cdn.discordapp.com/avatars/${currentUser.discord_id}/${currentUser.avatar}.png`;
        userAvatar.alt = `Avatar de ${currentUser.username}`;
    }
    
    // Mettre à jour le nom
    const userName = document.getElementById('user-name');
    if (userName) {
        userName.textContent = currentUser.username || 'Utilisateur inconnu';
    }
    
    // Mettre à jour le solde et les Aqualis
    await Promise.all([
        updateUserBalance().catch(err => console.warn('Balance update failed:', err)),
        updateUserAqualis().catch(err => console.warn('Aqualis update failed:', err))
    ]);
}

async function updateUserBalance() {
    const userBalance = document.getElementById('user-balance');
    if (!userBalance) return;

    try {
        const data = await apiCall('/user/profile');
        const balanceText = document.getElementById('balance-value');
        if (balanceText) {
            balanceText.textContent = data.balance || 0;
        }
    } catch (error) {
        console.error('Erreur chargement solde:', error);
    }
}

async function updateUserAqualis() {
    const userBalance = document.getElementById('user-balance');
    if (!userBalance || !isLoggedIn() || !currentUser?.discord_id) {
        return;
    }

    try {
        const aqualisData = await apiCall('/api/user/aqualis');
        console.log('✅ Données Aqualis reçues:', aqualisData);
        
        // Mettre à jour l'affichage des Aqualis
        const aqualisIcon = userBalance.querySelector('img[alt="Aqualis"]');
        if (aqualisIcon) {
            let balanceText = aqualisIcon.nextSibling;
            if (balanceText && balanceText.nodeType === Node.TEXT_NODE) {
                balanceText.textContent = ` ${aqualisData.balance || 0}`;
            } else {
                const balanceSpan = aqualisIcon.parentElement.querySelector('.balance-value, [id$="balance"]');
                if (balanceSpan) {
                    balanceSpan.textContent = aqualisData.balance || 0;
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur récupération Aqualis:', error);
        
        // Fallback: afficher 0
        const aqualisIcon = userBalance?.querySelector('img[alt="Aqualis"]');
        if (aqualisIcon) {
            let balanceText = aqualisIcon.nextSibling;
            if (balanceText && balanceText.nodeType === Node.TEXT_NODE) {
                balanceText.textContent = ` 0`;
            } else {
                const balanceSpan = aqualisIcon.parentElement.querySelector('.balance-value, [id$="balance"]');
                if (balanceSpan) {
                    balanceSpan.textContent = '0';
                }
            }
        }
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
        showNotification('Erreur: Utilisateur non connecté', 'error');
        return;
    }
    
    showProfileModal();
}

function showHistory() {
    hideUserMenu();
    
    if (!currentUser) {
        showNotification('Erreur: Utilisateur non connecté', 'error');
        return;
    }
    
    goToEconomy();
}

function showProfileModal() {
    const existingModal = document.getElementById('profile-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
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
    
    const avatarUrl = currentUser.avatar ? 
        `https://cdn.discordapp.com/avatars/${currentUser.discord_id}/${currentUser.avatar}.png` : 
        'https://cdn.discordapp.com/embed/avatars/0.png';
    
    modalContent.innerHTML = `
        <h2 style="color: var(--neon-green); margin-bottom: var(--spacing-lg);">Mon Profil</h2>
        <img src="${avatarUrl}" alt="Avatar" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: var(--spacing-md);">
        <h3 style="color: var(--text-primary); margin-bottom: var(--spacing-sm);">${currentUser.username}</h3>
        <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">Membre d'Atlant'ARK</p>
        <button onclick="closeProfileModal()" class="btn-primary" style="margin-top: var(--spacing-md);">
            Fermer
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Fermer avec Escape
    const closeOnEscape = (e) => {
        if (e.key === 'Escape') {
            closeProfileModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    };
    document.addEventListener('keydown', closeOnEscape);
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
    if (!currentUser) {
        if (confirm('Vous devez être connecté pour accéder à votre solde. Se connecter maintenant ?')) {
            loginWithDiscord();
        }
        return;
    }
    
    window.location.href = 'economie.html';
}

async function refreshUserBalance() {
    if (!authInitialized || !currentUser) return;
    
    await Promise.all([
        updateUserBalance().catch(err => console.warn('Balance refresh failed:', err)),
        updateUserAqualis().catch(err => console.warn('Aqualis refresh failed:', err))
    ]);
}

async function refreshUserAqualis() {
    if (!authInitialized || !currentUser) return;
    await updateUserAqualis().catch(err => console.warn('Aqualis refresh failed:', err));
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
    }
}

function updateServerStats(stats) {
    const elements = {
        'quick-players': stats.players_online,
        'player-count': stats.players_online,
        'uptime': stats.uptime,
        'auctions': stats.active_auctions,
        'registered-players': stats.registered_players
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element && value !== undefined) {
            element.textContent = value;
        }
    });
}

// =============================================
//   NOTIFICATIONS AMÉLIORÉES
// =============================================

function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    const colors = {
        success: '#00ff41',
        error: '#ff4444', 
        warning: '#ffaa00',
        info: '#0099ff'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 10000;
        max-width: 350px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function checkForRedirectMessage() {
    const message = sessionStorage.getItem('balance_redirect_message') || 
                   sessionStorage.getItem('economy_redirect_message');
    
    if (message) {
        sessionStorage.removeItem('balance_redirect_message');
        sessionStorage.removeItem('economy_redirect_message');
        showNotification(message, 'warning');
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
    console.log('🔍 DEBUG - URL complète:', window.location.href);
    const urlParams = new URLSearchParams(window.location.search);
    const auth_success = urlParams.get('auth');
    const access_token = urlParams.get('access_token');
    const refresh_token = urlParams.get('refresh_token');
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    console.log('🔍 DEBUG - Params extraits:', { auth_success, access_token, refresh_token, token, error });
    
    if (auth_success === 'success') {
        console.log('🔒 Connexion réussie avec cookies sécurisés');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => checkAuthenticationStatus(), 100);
        
    } else if (access_token && refresh_token) {
        console.log('⚠️ Migration vers système sécurisé...');
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => checkAuthenticationStatus(), 100);
        
    } else if (token) {
        localStorage.setItem('auth_token', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => checkAuthenticationStatus(), 100);
        
    } else if (error) {
        console.error('Erreur auth:', error);
        showNotification('Erreur de connexion avec Discord', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// =============================================
//   FONCTIONS UTILITAIRES AMÉLIORÉES
// =============================================

function isLoggedIn() {
    const hasTokens = localStorage.getItem('access_token') || localStorage.getItem('auth_token');
    return currentUser !== null && hasTokens !== null;
}

function getCurrentUser() {
    return currentUser;
}

function getAuthToken() {
    return localStorage.getItem('access_token') || localStorage.getItem('auth_token');
}

// Fonction apiCall améliorée avec retry automatique et gestion d'erreurs
async function apiCall(endpoint, options = {}, retries = 1) {
    let token = getAuthToken();
    if (!token) {
        throw new AuthError('Non authentifié', 'NO_TOKEN');
    }
    
    const makeRequest = async (authToken) => {
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        return await secureApiCall(endpoint, {
            ...options,
            headers: defaultOptions.headers
        });
    };
    
    try {
        let response = await makeRequest(token);
        return await response.json();
        
    } catch (error) {
        if (error instanceof AuthError && error.code === 'AUTH_REQUIRED' && retries > 0) {
            // Token expiré, essayer de le rafraîchir
            console.log('🔄 Token expiré dans apiCall, tentative de rafraîchissement...');
            
            const refreshed = await refreshAccessToken().catch(() => false);
            if (refreshed) {
                // Réessayer avec le nouveau token
                return await apiCall(endpoint, options, retries - 1);
            }
        }
        
        if (error instanceof AuthError && error.code === 'AUTH_REQUIRED') {
            // Token expiré définitivement, déconnecter
            logout();
            throw new AuthError('Session expirée', 'SESSION_EXPIRED');
        }
        
        throw error;
    }
}

// =============================================
//   EXPORTS POUR UTILISATION GLOBALE
// =============================================

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
    apiCall,
    showNotification
};

// Exposer les fonctions principales directement sur window
window.loginWithDiscord = loginWithDiscord;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.showProfile = showProfile;
window.showHistory = showHistory;
window.closeProfileModal = closeProfileModal;
window.showNotification = showNotification;

// Actualisation périodique améliorée
let periodicUpdateInterval;

function startPeriodicUpdates() {
    if (periodicUpdateInterval) {
        clearInterval(periodicUpdateInterval);
    }
    
    periodicUpdateInterval = setInterval(() => {
        if (authInitialized) {
            loadServerStats().catch(err => console.warn('Periodic stats update failed:', err));
            
            if (isLoggedIn()) {
                refreshUserBalance().catch(err => console.warn('Periodic balance update failed:', err));
            }
        }
    }, 30000); // 30 secondes
}

// Démarrer les mises à jour périodiques
startPeriodicUpdates();

// Nettoyer lors du déchargement de la page
window.addEventListener('beforeunload', () => {
    if (periodicUpdateInterval) {
        clearInterval(periodicUpdateInterval);
    }
});

console.log('✅ Module d\'authentification v2.1 chargé');