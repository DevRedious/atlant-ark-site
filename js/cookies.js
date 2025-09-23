// =============================================
// GESTIONNAIRE BANNER COOKIES RGPD
// =============================================

// Configuration
const COOKIE_CONSENT_KEY = 'atlant_ark_cookie_consent';
const COOKIE_BANNER_DELAY = 2000; // Délai avant affichage (2 secondes)

// Variables globales
let cookieBanner = null;
let consentGiven = false;

// =============================================
// INITIALISATION
// =============================================

document.addEventListener('DOMContentLoaded', function() {
  initCookieBanner();
});

function initCookieBanner() {
  // Vérifier si l'utilisateur a déjà donné son consentement
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  
  if (consent === 'accepted') {
    consentGiven = true;
    // console.log('🍪 Consentement cookies déjà accordé'); // Commenté pour éviter le spam console
    return;
  }
  
  // Initialiser le banner
  cookieBanner = document.getElementById('cookie-banner');
  
  if (!cookieBanner) {
    console.warn('Banner de cookies non trouvé');
    return;
  }
  
  // Attacher les événements
  setupCookieEvents();
  
  // Afficher le banner après un délai
  setTimeout(() => {
    showCookieBanner();
  }, COOKIE_BANNER_DELAY);
}

// =============================================
// ÉVÉNEMENTS
// =============================================

function setupCookieEvents() {
  // Bouton Accepter
  const acceptBtn = document.getElementById('accept-cookies');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', acceptCookies);
  }
  
  // Bouton En savoir plus
  const learnMoreBtn = document.getElementById('learn-more-cookies');
  if (learnMoreBtn) {
    learnMoreBtn.addEventListener('click', showCookiePolicy);
  }
  
  // Fermer si on clique en dehors
  cookieBanner.addEventListener('click', function(e) {
    if (e.target === cookieBanner) {
      // Ne pas fermer automatiquement - l'utilisateur doit choisir
    }
  });
}

// =============================================
// ACTIONS
// =============================================

function showCookieBanner() {
  if (cookieBanner && !consentGiven) {
    cookieBanner.style.display = 'block';
    setTimeout(() => {
      cookieBanner.classList.add('show');
    }, 100);
    
    console.log('🍪 Banner de cookies affiché');
  }
}

function hideCookieBanner() {
  if (cookieBanner) {
    cookieBanner.classList.remove('show');
    setTimeout(() => {
      cookieBanner.style.display = 'none';
    }, 400);
    
    console.log('🍪 Banner de cookies masqué');
  }
}

function acceptCookies() {
  // Enregistrer le consentement
  localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
  localStorage.setItem(COOKIE_CONSENT_KEY + '_date', new Date().toISOString());
  
  consentGiven = true;
  
  // Masquer le banner avec animation
  hideCookieBanner();
  
  // Notification de confirmation
  showCookieNotification('✅ Merci ! Vos préférences ont été enregistrées.', 'success');
  
  console.log('🍪 Consentement cookies accordé');
  
  // Émettre un événement personnalisé pour les autres scripts
  document.dispatchEvent(new CustomEvent('cookieConsentGiven'));
}

function showCookiePolicy() {
  // Créer une modal d'information
  const modal = document.createElement('div');
  modal.className = 'cookie-policy-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeCookiePolicy()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>🍪 Politique des Cookies</h2>
        <button class="modal-close" onclick="closeCookiePolicy()">✕</button>
      </div>
      <div class="modal-body">
        <h3>🔒 Cookies de Sécurité</h3>
        <p>Nous utilisons des cookies <strong>essentiels et sécurisés</strong> pour :</p>
        <ul>
          <li><strong>Authentification Discord</strong> - Maintenir votre session de connexion</li>
          <li><strong>Sécurité CSRF</strong> - Protection contre les attaques de falsification</li>
          <li><strong>Tokens d'accès</strong> - Gestion sécurisée de vos permissions</li>
        </ul>
        
        <h3>🛡️ Sécurité CIA-Level</h3>
        <p>Nos cookies utilisent la technologie <strong>HttpOnly</strong> :</p>
        <ul>
          <li>Impossibles à lire via JavaScript malveillant</li>
          <li>Transmission sécurisée uniquement (HTTPS)</li>
          <li>Protection SameSite contre les attaques CSRF</li>
          <li>Expiration automatique pour votre sécurité</li>
        </ul>
        
        <h3>📊 Pas de Tracking</h3>
        <p><strong>Nous ne collectons PAS :</strong></p>
        <ul>
          <li>Données de navigation publicitaire</li>
          <li>Informations de tracking tiers</li>
          <li>Données analytiques intrusives</li>
        </ul>
        
        <div class="policy-highlight">
          <strong>🎯 Ces cookies sont strictement nécessaires</strong> au fonctionnement de nos services d'authentification et de sécurité.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeCookiePolicy()">Fermer</button>
        <button class="btn-primary" onclick="acceptCookies(); closeCookiePolicy();">
          ✅ J'accepte ces cookies
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeCookiePolicy() {
  const modal = document.querySelector('.cookie-policy-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => document.body.removeChild(modal), 300);
  }
}

// =============================================
// NOTIFICATIONS
// =============================================

function showCookieNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `cookie-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-secondary);
    border: 1px solid var(--neon-green);
    border-radius: var(--border-radius);
    padding: var(--spacing-sm) var(--spacing-md);
    color: var(--text-primary);
    z-index: 10001;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Suppression automatique après 4 secondes
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentElement) {
          document.body.removeChild(notification);
        }
      }, 300);
    }
  }, 4000);
}

// =============================================
// UTILITAIRES
// =============================================

function isCookieConsentGiven() {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}

function resetCookieConsent() {
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  localStorage.removeItem(COOKIE_CONSENT_KEY + '_date');
  console.log('🍪 Consentement cookies réinitialisé');
}

// Exposer les fonctions utiles globalement
window.isCookieConsentGiven = isCookieConsentGiven;
window.resetCookieConsent = resetCookieConsent;
window.closeCookiePolicy = closeCookiePolicy;
window.acceptCookies = acceptCookies;

// Style pour la modal de politique
const modalStyles = `
<style>
.cookie-policy-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.cookie-policy-modal.show {
  opacity: 1;
  pointer-events: auto;
}

.cookie-policy-modal .modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.cookie-policy-modal .modal-content {
  background: var(--bg-secondary);
  border: 2px solid var(--neon-green);
  border-radius: var(--border-radius-lg);
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  margin: 20px;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.cookie-policy-modal .modal-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cookie-policy-modal .modal-header h2 {
  margin: 0;
  color: var(--neon-green);
}

.cookie-policy-modal .modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition);
}

.cookie-policy-modal .modal-close:hover {
  color: var(--neon-green);
  background: rgba(0, 255, 65, 0.1);
}

.cookie-policy-modal .modal-body {
  padding: var(--spacing-lg);
}

.cookie-policy-modal .modal-body h3 {
  color: var(--neon-green);
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
}

.cookie-policy-modal .modal-body h3:first-child {
  margin-top: 0;
}

.cookie-policy-modal .modal-body ul {
  margin: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
}

.cookie-policy-modal .modal-body li {
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
}

.policy-highlight {
  background: rgba(0, 255, 65, 0.1);
  border: 1px solid var(--neon-green-dim);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  color: var(--neon-green);
  text-align: center;
}

.cookie-policy-modal .modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .cookie-policy-modal .modal-footer {
    flex-direction: column;
  }
}
</style>
`;

// Injecter les styles de la modal
document.head.insertAdjacentHTML('beforeend', modalStyles);