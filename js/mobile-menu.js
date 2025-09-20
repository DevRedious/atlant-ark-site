// ===========================================
// MENU MOBILE - FONCTIONNALITÉ BURGER
// À ajouter dans vos fichiers HTML ou dans un JS séparé
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const navMenu = document.querySelector('.nav-menu');
  const body = document.body;

  // Créer l'overlay
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  body.appendChild(overlay);

  // Fonction pour toggler le menu
  function toggleMenu() {
    const isActive = navMenu.classList.contains('active');
    
    if (isActive) {
      // Fermer le menu
      navMenu.classList.remove('active');
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      body.style.overflow = '';
    } else {
      // Ouvrir le menu
      navMenu.classList.add('active');
      mobileMenu.classList.add('active');
      overlay.classList.add('active');
      body.style.overflow = 'hidden'; // Empêche le scroll
    }
  }

  // Event listeners
  if (mobileMenu) {
    mobileMenu.addEventListener('click', toggleMenu);
  }

  // Fermer le menu en cliquant sur l'overlay
  overlay.addEventListener('click', toggleMenu);

  // Fermer le menu en cliquant sur un lien
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleMenu();
      }
    });
  });

  // Fermer le menu si on redimensionne vers desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navMenu.classList.remove('active');
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      body.style.overflow = '';
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
});

// ===========================================
// AMÉLIORATION DE L'ACCESSIBILITÉ MOBILE
// ===========================================

// Ajout d'attributs ARIA pour l'accessibilité
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenu = document.querySelector('.mobile-menu');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileMenu && navMenu) {
    // Attributs ARIA
    mobileMenu.setAttribute('aria-label', 'Menu principal');
    mobileMenu.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('role', 'button');
    mobileMenu.setAttribute('tabindex', '0');

    navMenu.setAttribute('aria-hidden', 'true');

    // Mise à jour des attributs lors du toggle
    const originalToggle = toggleMenu;
    toggleMenu = function() {
      originalToggle();
      const isActive = navMenu.classList.contains('active');
      mobileMenu.setAttribute('aria-expanded', isActive.toString());
      navMenu.setAttribute('aria-hidden', (!isActive).toString());
    };

    // Support du clavier
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });
  }
});

// ===========================================
// OPTIMISATION DES PERFORMANCES MOBILE
// ===========================================

// Détection mobile pour optimisations
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  // Désactive certaines animations coûteuses sur mobile
  document.documentElement.style.setProperty('--transition', 'all 0.2s ease');
  
  // Lazy loading plus agressif sur mobile
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.loading = 'lazy';
  });
}

// ===========================================
// GESTION DE L'ORIENTATION
// ===========================================

window.addEventListener('orientationchange', () => {
  // Force la fermeture du menu lors du changement d'orientation
  setTimeout(() => {
    const navMenu = document.querySelector('.nav-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (navMenu && navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }, 100);
});

// ===========================================
// TOUCHES TACTILES AMÉLIORÉES
// ===========================================

// Ajoute des effets tactiles aux boutons
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

// ===========================================
// VIEWPORT DYNAMIQUE POUR MOBILE
// ===========================================

// Corrige les problèmes de viewport sur mobile
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
  setTimeout(setViewportHeight, 100);
});
