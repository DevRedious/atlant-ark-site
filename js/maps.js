// ===========================
// BASE DE DONNÉES DES CARTES
// ===========================

const ATLANTARK_MAPS = [
  {
    id: "the_island",
    name: "The Island",
    description: "La carte originale d'ARK, parfaite pour débuter votre aventure.",
    image: "the_island.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Carte idéale pour débuter",
      "Toutes les ressources disponibles",
      "Grottes variées et donjons"
    ]
  },
  {
    id: "the_island_event",
    name: "The Island Event",
    description: "Version événementielle de The Island avec des créatures spéciales et des récompenses exclusives.",
    image: "the_island_event.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Événements saisonniers actifs",
      "Créatures colorées spéciales",
      "Récompenses événementielles"
    ],
    special: true,
    eventType: "Carte Événementielle"
  },
  {
    id: "the_center",
    name: "The Center",
    description: "Une carte massive avec des biomes variés et des structures impressionnantes.",
    image: "the_center.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Île flottante centrale",
      "Ponts naturels spectaculaires",
      "Biomes extrêmement variés"
    ]
  },
  {
    id: "ragnarok",
    name: "Ragnarok",
    description: "Une carte nordique épique avec des paysages à couper le souffle.",
    image: "ragnarok.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Paysages nordiques épiques",
      "Châteaux et ruines vikings",
      "Wyverns et leurs œufs"
    ]
  },
  {
    id: "valguero",
    name: "Valguero",
    description: "Disponible à sa sortie ! Une carte communautaire avec des biomes uniques.",
    image: "valguero.png",
    status: "coming_soon",
    players: 0,
    maxPlayers: 70,
    features: [
      "Disponible à sa sortie !",
      "Zone aberrante intégrée",
      "Grottes de cristal uniques"
    ],
    comingSoon: true
  },
  {
    id: "extinction",
    name: "Extinction",
    description: "Une Terre post-apocalyptique avec des titans colossaux.",
    image: "extinction.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Mechs pilotables",
      "Titans géants",
      "Technologie avancée"
    ]
  },
  {
    id: "lost_city",
    name: "Lost City",
    description: "Une cité perdue mystérieuse avec des secrets anciens à découvrir.",
    image: "lost_city.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Architecture ancienne mystérieuse",
      "Artefacts rares cachés",
      "Créatures légendaires"
    ]
  },
  {
    id: "amissa",
    name: "Amissa",
    description: "Une carte tropicale luxuriante avec des îles paradisiaques.",
    image: "amissa.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Îles interconnectées",
      "Créatures marines uniques",
      "Ressources aquatiques rares"
    ]
  },
  {
    id: "astraeos",
    name: "Astraeos",
    description: "Une carte spatiale futuriste avec des technologies avancées.",
    image: "astraeos.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Gravité réduite",
      "Technologies futuristes",
      "Ressources cosmiques"
    ]
  },
  {
    id: "insaluna",
    name: "Insaluna",
    description: "Une île lunaire mystique avec des créatures nocturnes uniques.",
    image: "insaluna.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Cycle jour/nuit unique",
      "Créatures nocturnes spéciales",
      "Pouvoir de la lune"
    ]
  }
];

// Carte séparée - pas dans le cluster
const STANDALONE_MAPS = [
  {
    id: "ragnarok_primal_nemesis",
    name: "Ragnarok Primal Nemesis",
    description: "Version modifiée de Ragnarok avec des créatures primordiales et des défis uniques. Serveur indépendant.",
    image: "ragnarok_primal_nemesis.png",
    status: "online",
    players: 0,
    maxPlayers: 70,
    features: [
      "Créatures primordiales",
      "Boss modifiés et renforcés",
      "Serveur indépendant"
    ],
    special: true,
    eventType: "Serveur Indépendant",
    standalone: true
  }
];

// ===========================
// GESTION DES ÉTATS DES CARTES
// ===========================

const MAP_STATUS = {
  online: {
    color: "#00ff41",
    text: "En ligne",
    icon: "🟢"
  },
  maintenance: {
    color: "#ffaa00",
    text: "Maintenance",
    icon: "🟡"
  },
  offline: {
    color: "#ff4444",
    text: "Hors ligne",
    icon: "🔴"
  },
  restarting: {
    color: "#00aaff",
    text: "Redémarrage",
    icon: "🔄"
  },
  coming_soon: {
    color: "#8b5cf6",
    text: "Bientôt disponible",
    icon: "🚀"
  }
};

// ===========================
// CHARGEMENT ET AFFICHAGE DES CARTES
// ===========================

async function loadMaps() {
  try {
    const mapsLoader = document.getElementById("maps-loader");
    const mapsGrid = document.getElementById("maps-grid");
    
    if (!mapsGrid) {
      console.log("Container des cartes non trouvé");
      return;
    }

    // Masquer le loader et afficher le contenu
    if (mapsLoader) mapsLoader.style.display = "none";
    mapsGrid.style.display = "block";
    mapsGrid.innerHTML = "";

    // PAS D'APPEL API - Mode statique uniquement
    console.log("Mode statique - API désactivée pour les cartes");
    
    // Créer le header avec les statistiques du cluster
    createClusterHeader(mapsGrid);
    
    // Créer la grille des cartes du cluster
    createClusterMapsGrid(mapsGrid);
    
    // Créer la section des serveurs indépendants
    createStandaloneMapsSection(mapsGrid);
    
    // Mettre à jour les statistiques du cluster
    updateClusterStats();
    
    // Animer l'apparition des cartes
    animateMapCards();

    // ✅ Gérer l'apparition progressive des images après création
    const images = mapsGrid.querySelectorAll(".map-image[loading='lazy']");
    images.forEach(img => {
      if (img.complete) {
        img.classList.add("loaded");
      } else {
        img.addEventListener("load", () => {
          img.classList.add("loaded");
        });
      }
    });

    console.log("Cartes chargées avec succès (mode statique)");
  } catch (err) {
    console.error("Erreur lors du chargement des cartes:", err);
    handleMapsError();
  }
}


function createClusterHeader(container) {
  const clusterMaps = ATLANTARK_MAPS.filter(map => !map.standalone);
  const specialMaps = clusterMaps.filter(map => map.special).length;
  const onlineMaps = clusterMaps.filter(map => map.status === 'online').length;
  
  const statsHeader = document.createElement("div");
  statsHeader.className = "cluster-stats-header";
  statsHeader.innerHTML = `
    <h2 class="cluster-title">🌐 Cluster Atlant'ARK</h2>
    <p class="cluster-subtitle">Toutes les cartes avec transferts libres entre elles</p>
    <div class="cluster-stats-grid">
      <div class="cluster-stat">
        <div class="stat-number">${clusterMaps.length}</div>
        <div class="stat-label">Cartes du Cluster</div>
      </div>
      <div class="cluster-stat">
        <div class="stat-number">${onlineMaps}</div>
        <div class="stat-label">Cartes En Ligne</div>
      </div>
      <div class="cluster-stat special">
        <div class="stat-number">${specialMaps}</div>
        <div class="stat-label">Cartes Spéciales</div>
      </div>
    </div>
  `;
  
  container.appendChild(statsHeader);
}

function createClusterMapsGrid(container) {
  const clusterSection = document.createElement("div");
  clusterSection.className = "cluster-section";
  
  const mapsGrid = document.createElement("div");
  mapsGrid.className = "maps-grid";
  
  ATLANTARK_MAPS.forEach((map, index) => {
    const mapElement = createMapCard(map, index);
    mapsGrid.appendChild(mapElement);
  });
  
  clusterSection.appendChild(mapsGrid);
  container.appendChild(clusterSection);
}

function createStandaloneMapsSection(container) {
  if (STANDALONE_MAPS.length === 0) return;
  
  const standaloneSection = document.createElement("div");
  standaloneSection.className = "standalone-section";
  standaloneSection.innerHTML = `
    <div class="section-divider">
      <h2 class="standalone-title">⚡ Serveurs Indépendants</h2>
      <p class="standalone-subtitle">Serveurs séparés sans transferts avec le cluster principal</p>
    </div>
  `;
  
  const standaloneMapsGrid = document.createElement("div");
  standaloneMapsGrid.className = "maps-grid standalone-grid";
  
  STANDALONE_MAPS.forEach((map, index) => {
    const mapElement = createMapCard(map, index + ATLANTARK_MAPS.length);
    standaloneMapsGrid.appendChild(mapElement);
  });
  
  standaloneSection.appendChild(standaloneMapsGrid);
  container.appendChild(standaloneSection);
}

// FONCTION DÉSACTIVÉE - Plus d'appels API
async function loadRealTimeMapData() {
  // API COMPLÈTEMENT DÉSACTIVÉE
  console.log("API désactivée - aucun appel réseau effectué");
  return Promise.resolve();
}

function createMapCard(map, index) {
  const mapElement = document.createElement("div");
  mapElement.className = `map-card card ${map.special ? 'special' : ''} ${map.comingSoon ? 'coming-soon' : ''} ${map.standalone ? 'standalone' : ''}`;
  mapElement.dataset.index = index;
  mapElement.dataset.status = map.status;
  
  const statusInfo = MAP_STATUS[map.status] || MAP_STATUS.online;
  
  mapElement.innerHTML = `
    <div class="map-image-container">
      <img src="assets/images/maps/${map.image}" 
           alt="${map.name}" 
           class="map-image" 
           loading="lazy"
           onload="this.classList.add('loaded')"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="map-placeholder" style="display:none;">
        <span class="map-icon">🗺️</span>
      </div>
      <div class="map-status-badge" style="background-color: ${statusInfo.color};">
        ${statusInfo.icon} ${statusInfo.text}
      </div>
      ${map.special ? `
        <div class="special-badge">
          ⭐ ${map.eventType || 'Spécial'}
        </div>
      ` : ''}
      ${map.comingSoon ? `
        <div class="coming-soon-ribbon">
          🚀 Bientôt !
        </div>
      ` : ''}
    </div>
    
    <div class="map-content">
      <div class="map-header">
        <h3 class="map-name">${map.name}</h3>
      </div>
      
      <p class="map-description">${map.description}</p>
      
      <div class="map-features">
        <h4>Caractéristiques :</h4>
        <ul>
          ${map.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  return mapElement;
}


// ===========================
// INTERACTIONS ET ACTIONS
// ===========================

function joinMap(mapId, launchCommand) {
  const map = ATLANTARK_MAPS.find(m => m.id === mapId);
  if (!map) return;
  
  // Tentative de lancement via Steam
  try {
    window.location.href = launchCommand;
    showNotification(`Lancement de ${map.name}...`);
  } catch (error) {
    // Fallback : copier l'IP dans le presse-papiers
    const serverIP = launchCommand.replace('steam://connect/', '');
    navigator.clipboard.writeText(serverIP).then(() => {
      showNotification(`IP du serveur ${map.name} copiée : ${serverIP}`);
    }).catch(() => {
      showNotification(`Connectez-vous à : ${serverIP}`, 'info');
    });
  }
}

function showMapDetails(mapId) {
  const map = ATLANTARK_MAPS.find(m => m.id === mapId);
  if (!map) return;
  
  // Créer une modal avec les détails de la carte
  const modal = document.createElement('div');
  modal.className = 'map-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeMapModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h2>${map.name}</h2>
        <button class="modal-close" onclick="closeMapModal()">✕</button>
      </div>
      <div class="modal-body">
        <img src="assets/images/maps/${map.image}" alt="${map.name}" class="modal-map-image">
        
        <div class="modal-sections">
          <div class="modal-section">
            <h3>✨ Caractéristiques</h3>
            <ul class="features-list">
              ${map.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeMapModal()">Fermer</button>
        ${map.status === 'online' ? `
          <button class="btn-primary" onclick="joinMap('${map.id}', '${map.launchCommand}'); closeMapModal();">
            🚀 Rejoindre ${map.name}
          </button>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeMapModal() {
  const modal = document.querySelector('.map-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => document.body.removeChild(modal), 300);
  }
}

// ===========================
// STATISTIQUES DU CLUSTER
// ===========================

function updateClusterStats() {
  // Mode statique - pas de mise à jour des stats
  console.log("Mode statique - statistiques fixes affichées");
}

// ===========================
// ANIMATIONS ET EFFETS
// ===========================

function animateMapCards() {
  const cards = document.querySelectorAll('.map-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 150);
  });
}

// ===========================
// FILTRAGE ET RECHERCHE
// ===========================

function filterMapsByStatus(status) {
  const mapCards = document.querySelectorAll('.map-card');
  
  mapCards.forEach(card => {
    if (status === 'all' || card.dataset.status === status) {
      card.style.display = '';
      card.style.opacity = '1';
    } else {
      card.style.display = 'none';
      card.style.opacity = '0';
    }
  });
}

function filterMapsByDifficulty(difficulty) {
  const mapCards = document.querySelectorAll('.map-card');
  
  mapCards.forEach(card => {
    const mapDifficulty = card.querySelector('.map-difficulty')?.textContent.toLowerCase() || '';
    
    if (difficulty === 'all' || mapDifficulty.includes(difficulty.toLowerCase())) {
      card.style.display = '';
      card.style.opacity = '1';
    } else {
      card.style.display = 'none';
      card.style.opacity = '0';
    }
  });
}

// ===========================
// GESTION DES ERREURS
// ===========================

function handleMapsError() {
  const mapsLoader = document.getElementById("maps-loader");
  const mapsGrid = document.getElementById("maps-grid");
  
  if (mapsLoader) mapsLoader.style.display = "none";
  if (mapsGrid) {
    mapsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <p style="color: #ff4444; font-size: 1.2rem; margin-bottom: 1rem;">
          ⚠️ Impossible de charger les cartes
        </p>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">
          Une erreur est survenue lors du chargement. Veuillez réessayer.
        </p>
        <button onclick="loadMaps()" class="btn-primary">
          Réessayer
        </button>
      </div>
    `;
    mapsGrid.style.display = "grid";
  }
}

// ===========================
// AUTO-REFRESH DÉSACTIVÉ
// ===========================

// Chargement initial des cartes si on est sur la page maps
if (window.location.pathname.includes('maps.html') || 
    document.getElementById('maps-grid')) {
  
  document.addEventListener('DOMContentLoaded', () => {
    loadMaps();
  });
  
  // AUTO-REFRESH COMPLÈTEMENT DÉSACTIVÉ
  console.log("Auto-refresh désactivé - mode statique uniquement");
}

// ===========================
// UTILITAIRES
// ===========================

function refreshMaps() {
  console.log("Actualisation manuelle des cartes (mode statique)...");
  loadMaps();
}

function getMapById(mapId) {
  return ATLANTARK_MAPS.find(map => map.id === mapId);
}

function getOnlineMaps() {
  return ATLANTARK_MAPS.filter(map => map.status === 'online');
}

function getTotalPlayers() {
  // Retourne 0 en mode statique
  return 0;
}

// Fonction utilitaire pour afficher une notification
function showNotification(message, type = 'info') {
  console.log(`Notification (${type}): ${message}`);
  // Vous pouvez implémenter un système de notification visuel ici
}

// Exposer les fonctions globalement pour l'utilisation dans d'autres scripts
window.joinMap = joinMap;
window.showMapDetails = showMapDetails;
window.closeMapModal = closeMapModal;
window.filterMapsByStatus = filterMapsByStatus;
window.filterMapsByDifficulty = filterMapsByDifficulty;
window.refreshMaps = refreshMaps;
