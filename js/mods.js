// ===========================
// BASE DE DONNÉES DES MODS
// ===========================

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
// CHARGEMENT ET AFFICHAGE DES MODS
// ===========================

async function loadMods() {
  try {
    const modsLoader = document.getElementById("mods-loader");
    const modsContainer = document.getElementById("mods-list");
    
    if (!modsContainer) {
      console.log("Container des mods non trouvé");
      return;
    }

    // Masquer le loader et afficher le contenu
    if (modsLoader) modsLoader.style.display = "none";
    modsContainer.style.display = "block";
    modsContainer.innerHTML = "";

    // Créer le header avec les statistiques
    createModsHeader(modsContainer);
    
    // Créer la grille des mods
    createModsGrid(modsContainer);
    
    // Animer l'apparition des cartes
    animateModCards();
    
    console.log("Mods chargés avec succès");
  } catch (err) {
    console.error("Erreur lors du chargement des mods:", err);
    handleModsError();
  }
}

function createModsHeader(container) {
  const specialMods = ATLANTARK_MODS.filter(mod => mod.special).length;
  
  const statsHeader = document.createElement("div");
  statsHeader.className = "mods-stats-header";
  statsHeader.style.cssText = `
    display: flex; 
    gap: 2rem; 
    justify-content: center; 
    margin-bottom: 3rem; 
    flex-wrap: wrap;
  `;
  
  statsHeader.innerHTML = `
    <div class="card" style="text-align: center; padding: 1.5rem; min-width: 180px;">
      <div class="card-number">${ATLANTARK_MODS.length}</div>
      <div class="card-label">Mods Installés</div>
    </div>
    <div class="card special" style="text-align: center; padding: 1.5rem; min-width: 180px; border-color: var(--neon-green); background: rgba(0, 255, 65, 0.05);">
      <div class="card-number">${specialMods}</div>
      <div class="card-label">Mod${specialMods > 1 ? 's' : ''} Exclusif${specialMods > 1 ? 's' : ''}</div>
    </div>
  `;
  
  container.appendChild(statsHeader);
}

function createModsGrid(container) {
  const modsGrid = document.createElement("div");
  modsGrid.className = "mods-grid";
  
  ATLANTARK_MODS.forEach((mod, index) => {
    const modElement = createModCard(mod, index);
    modsGrid.appendChild(modElement);
  });
  
  container.appendChild(modsGrid);
}

function createModCard(mod, index) {
  const modElement = document.createElement("div");
  modElement.className = `mod-card card ${mod.special ? 'special' : ''}`;
  modElement.style.position = 'relative';
  modElement.dataset.index = index;
  
  modElement.innerHTML = `
    <div class="mod-header">
      <div class="mod-icon-container">
        <img src="assets/images/mod-icons/${mod.icon}" 
             alt="${mod.name}" 
             class="mod-icon" 
             loading="lazy"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="mod-emoji" style="display:none;">${mod.emoji}</div>
      </div>
      <div class="mod-info">
        <h3 class="mod-name">${mod.name}</h3>
        <div class="mod-id">ID: ${mod.id}</div>
      </div>
      ${mod.special ? '<div class="exclusive-badge">🌋 Exclusif</div>' : ''}
    </div>
    <p class="mod-description">${mod.description}</p>
    <div class="mod-actions">
      <a href="${mod.url}" target="_blank" class="mod-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
        </svg>
        Voir sur CurseForge
      </a>
      <button class="copy-id-btn" onclick="copyModId(${mod.id})" title="Copier l'ID du mod">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
      </button>
    </div>
  `;
  
  return modElement;
}

// ===========================
// ANIMATIONS ET INTERACTIONS
// ===========================

function animateModCards() {
  const cards = document.querySelectorAll('.mod-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 100);
  });
}

function copyModId(modId) {
  navigator.clipboard.writeText(modId.toString()).then(() => {
    if (typeof showNotification === 'function') {
      showNotification(`ID du mod ${modId} copié !`);
    }
  }).catch(err => {
    console.error('Erreur lors de la copie:', err);
  });
}

// ===========================
// FILTRAGE ET RECHERCHE
// ===========================

function filterMods(searchTerm) {
  const modCards = document.querySelectorAll('.mod-card');
  const searchLower = searchTerm.toLowerCase();
  
  modCards.forEach(card => {
    const modName = card.querySelector('.mod-name').textContent.toLowerCase();
    const modDescription = card.querySelector('.mod-description').textContent.toLowerCase();
    
    if (modName.includes(searchLower) || modDescription.includes(searchLower)) {
      card.style.display = '';
      card.style.opacity = '1';
    } else {
      card.style.display = 'none';
      card.style.opacity = '0';
    }
  });
}

function showOnlySpecialMods() {
  const modCards = document.querySelectorAll('.mod-card');
  
  modCards.forEach(card => {
    if (card.classList.contains('special')) {
      card.style.display = '';
      card.style.opacity = '1';
    } else {
      card.style.display = 'none';
      card.style.opacity = '0';
    }
  });
}

function showAllMods() {
  const modCards = document.querySelectorAll('.mod-card');
  
  modCards.forEach(card => {
    card.style.display = '';
    card.style.opacity = '1';
  });
}

// ===========================
// GESTION DES ERREURS
// ===========================

function handleModsError() {
  const modsLoader = document.getElementById("mods-loader");
  const modsContainer = document.getElementById("mods-list");
  
  if (modsLoader) modsLoader.style.display = "none";
  if (modsContainer) {
    modsContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <p style="color: #ff4444; font-size: 1.2rem; margin-bottom: 1rem;">
          ⚠️ Impossible de charger la liste des mods
        </p>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Une erreur est survenue lors du chargement. Veuillez réessayer.
        </p>
        <button onclick="loadMods()" class="btn-primary">
          Réessayer
        </button>
      </div>
    `;
    modsContainer.style.display = "block";
  }
}

// ===========================
// UTILITAIRES
// ===========================

function getModById(modId) {
  return ATLANTARK_MODS.find(mod => mod.id === modId);
}

function getSpecialMods() {
  return ATLANTARK_MODS.filter(mod => mod.special);
}

function getTotalModsCount() {
  return ATLANTARK_MODS.length;
}

// ===========================
// INITIALISATION
// ===========================

// Chargement initial des mods si on est sur la page mods
if (window.location.pathname.includes('mods.html') || 
    document.getElementById('mods-list')) {
  
  document.addEventListener('DOMContentLoaded', () => {
    loadMods();
  });
}

// Exposer les fonctions globalement pour l'utilisation dans d'autres scripts
window.copyModId = copyModId;
window.filterMods = filterMods;
window.showOnlySpecialMods = showOnlySpecialMods;
window.showAllMods = showAllMods;
window.loadMods = loadMods;
