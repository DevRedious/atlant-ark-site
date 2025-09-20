// ===========================================
// MENU MOBILE - VERSION CORRIGÉE
// ===========================================

// Variables globales
let mobileMenu, navMenu, overlay;

// Fonction toggleMenu exposée globalement
function toggleMenu() {
  const isActive = navMenu.classList.contains('active');

  if (isActive) {
    closeMenu();
  } else {
    openMenu();
  }
}

// Fonction pour ouvrir le menu
function openMenu() {
  navMenu.classList.add('active');
  mobileMenu.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // 🔹 Mise à jour ARIA
  mobileMenu.setAttribute('aria-expanded', 'true');
  navMenu.setAttribute('aria-hidden', 'false');
}

// Fonction pour fermer le menu
function closeMenu() {
  navMenu.classList.remove('active');
  mobileMenu.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';

  // 🔹 Mise à jour ARIA
  mobileMenu.setAttribute('aria-expanded', 'false');
  navMenu.setAttribute('aria-hidden', 'true');
}


// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  mobileMenu = document.querySelector('.mobile-menu');
  navMenu = document.querySelector('.nav-menu');
  
  // Créer l'overlay s'il n'existe pas
  overlay = document.querySelector('.mobile-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    document.body.appendChild(overlay);
  }

  // Vérifier que les éléments existent
  if (!mobileMenu || !navMenu) {
    console.warn('Éléments de navigation mobile non trouvés');
    return;
  }

  // Event listeners
  mobileMenu.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Fermer le menu en cliquant sur un lien
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768 && navMenu.classList.contains('active')) {
        toggleMenu();
      }
    });
  });

  // Fermer le menu si on redimensionne vers desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Gestion du swipe pour fermer le menu
  let startX = 0;
  navMenu.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  navMenu.addEventListener('touchmove', (e) => {
    const currentX = e.touches[0].clientX;
    const diffX = startX - currentX;
    
    if (diffX > 50) { // Swipe vers la gauche
      toggleMenu();
    }
  });

  // Attributs ARIA pour l'accessibilité
  mobileMenu.setAttribute('aria-label', 'Menu principal');
  mobileMenu.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('role', 'button');
  mobileMenu.setAttribute('tabindex', '0');
  navMenu.setAttribute('aria-hidden', 'true');

  // Support du clavier
  mobileMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });
});

// Gestion de l'orientation
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }, 100);
});

// Effets tactiles pour les boutons
document.addEventListener('DOMContentLoaded', function() {
  const touchButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-link, .card');
  
  touchButtons.forEach(button => {
    button.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.98)';
    });
    
    button.addEventListener('touchend', function() {
      this.style.transform = '';
    });
  });
});

// Viewport dynamique pour mobile
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  setTimeout(setViewportHeight, 100);
});

// Exposer la fonction globalement
window.toggleMenu = toggleMenu;
