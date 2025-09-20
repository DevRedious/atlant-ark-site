// ===========================
// BASE DE DONNÉES DES CARTES
// ===========================

const ATLANTARK_MAPS = [
  {
    id: "the_island",
    name: "The Island",
    description: "La carte originale d'ARK, parfaite pour débuter votre aventure.",
    image: "the_island.jpg",
    status: "online",
    players: 0,
    maxPlayers: 70,
    difficulty: "Facile",
    size: "Grande",
    biomes: ["Forêt", "Plage", "Montagne", "Volcan", "Marais"],
    bosses: ["Broodmother", "Megapithecus", "Dragon", "Overseer"],
    features: [
      "Carte idéale pour débuter",
      "Toutes les ressources disponibles",
      "Grottes variées et donjons",
      "Arènes de boss classiques"
    ],
    launchCommand: "steam://connect/your-server-ip:7777"
  },
  {
    id: "scorched_earth",
    name: "Scorched Earth",
    description: "Un désert impitoyable avec des créatures uniques et des défis extrêmes.",
    image: "scorched_earth.jpg",
    status: "online",
    players: 0,
    maxPlayers: 70,
    difficulty: "Difficile",
    size: "Grande",
    biomes: ["Désert", "Oasis", "Dunes", "Badlands", "Canyons"],
    bosses: ["Manticore"],
    features: [
      "Tempêtes de sable mortelles",
      "Système de températures extrêmes",
      "Créatures du désert uniques",
      "Ressources spécialisées (pétrole, soufre)"
    ],
    launchCommand: "steam://connect/your-server-ip:7779"
  },
  {
    id: "aberration",
    name: "Aberration",
    description: "Un monde souterrain radioactif rempli de créatures mutantes.",
    image: "aberration.jpg",
    status: "online",
    players: 0,
    maxPlayers: 70,
    difficulty: "Très Difficile",
    size: "Grande",
    biomes: ["Zone Fertile", "Zone Bleue", "Zone Rouge", "Surface"],
    bosses: ["Rockwell"],
    features: [
      "Aucune créature volante",
      "Système de radiations",
      "Escalade et ziplines",
      "Créatures luminescentes"
    ],
    launchCommand: "steam://connect/your-server-ip:7781"
  },
  {
    id: "extinction",
    name: "Extinction",
    description: "Une Terre post-apocalyptique avec des titans colossaux.",
    image: "extinction.jpg",
    status: "online",
    players: 0,
    maxPlayers: 70,
    difficulty: "Extrême",
    size: "Grande",
    biomes: ["Ville en Ruines", "Wasteland", "Desert Dome", "Snow Dome", "Forest"],
    bosses: ["Desert Titan", "Forest Titan", "Ice Titan", "King Titan"],
    features: [
      "Mechs pilotables",
      "Titans géants",
      "Vagues d'extinction",
      "Technologie avancée"
    ],
    launchCommand: "steam://connect/your-server-ip:7783"
  },
  {
    id: "genesis",
    name: "Genesis Part 1",
    description: "Simulation de biomes avec missions et défis guidés par HLN-A.",
    image: "genesis.jpg",
    status: "online",
    players: 0,
    maxPlayers: 70,
    difficulty: "Modéré",
    size: "Grande",
    biomes: ["Bog", "Arctic", "Volcanic", "Ocean", "Lunar"],
    bosses: ["Moeder"],
    features: [
      "Système de missions",
      "Biomes séparés",
      "Téléportation entre zones",
      "Récompenses de missions"
    ],
    launchCommand: "steam://connect/your-server-ip:7785"
  },
  {
    id: "genesis2",
    name: "Genesis Part 2",
    description: "Un vaisseau spatial massif avec des biomes artificiels.",
    image: "genesis2.jpg",
    status: "maintenance",
    players: 0,
    maxPlayers: 70,
    difficulty: "Très Difficile",
    size: "Énorme",
    biomes: ["Rockwell's Garden", "Innards", "Space"],
    bosses: ["Rockwell Prime"],
    features: [
      "Vaisseau spatial",
      "Striders géants",
      "Technologie de pointe",
      "Combat spatial"
    ],
    launchCommand: "steam://connect/your-server-ip:7787"
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
    mapsGrid.style.display = "grid";
    mapsGrid.innerHTML = "";

    // Charger les données en temps réel depuis l'API
    await loadRealTimeMapData();
    
    // Créer les cartes
    ATLANTARK_MAPS.forEach((map, index) => {
      const mapElement = createMapCard(map, index);
      mapsGrid.appendChild(mapElement);
    });
    
    // Mettre à jour les statistiques du cluster
    updateClusterStats();
    
    // Animer l'apparition des cartes
    animateMapCards();
    
    console.log("Cartes chargées avec succès");
  } catch (err) {
    console.error("Erreur lors du chargement des cartes:", err);
    handleMapsError();
  }
}

async function loadRealTimeMapData() {
  try {
    // Appel API pour récupérer les données en temps réel
    const response = await fetch(`${API_URL}/maps/status`);
    if (response.ok) {
      const data = await response.json();
      
      // Mettre à jour les données des cartes
      data.maps?.forEach(apiMap => {
        const map = ATLANTARK_MAPS.find(m => m.id === apiMap.id);
        if (map) {
          map.players = apiMap.players || 0;
          map.status = apiMap.status || 'online';
        }
      });
    }
  } catch (error) {
    console.log("Mode hors ligne - utilisation des données statiques");
  }
}

function createMapCard(map, index) {
  const mapElement = document.createElement("div");
  mapElement.className = "map-card card";
  mapElement.dataset.index = index;
  mapElement.dataset.status = map.status;
  
  const statusInfo = MAP_STATUS[map.status] || MAP_STATUS.online;
  const playerPercentage = Math.round((map.players / map.maxPlayers) * 100);
  
  mapElement.innerHTML = `
    <div class="map-image-container">
      <img src="assets/images/maps/${map.image}" 
           alt="${map.name}" 
           class="map-image" 
           loading="lazy"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="map-placeholder" style="display:none;">
        <span class="map-icon">🗺️</span>
      </div>
      <div class="map-status-badge" style="background-color: ${statusInfo.color};">
        ${statusInfo.icon} ${statusInfo.text}
      </div>
      <div class="map-players-badge">
        👥 ${map.players}/${map.maxPlayers}
      </div>
    </div>
    
    <div class="map-content">
      <div class="map-header">
        <h3 class="map-name">${map.name}</h3>
        <div class="map-difficulty difficulty-${map.difficulty.toLowerCase().replace(' ', '-')}">${map.difficulty}</div>
      </div>
      
      <p class="map-description">${map.description}</p>
      
      <div class="map-details">
        <div class="map-detail">
          <span class="detail-icon">📏</span>
          <span>Taille: ${map.size}</span>
        </div>
        <div class="map-detail">
          <span class="detail-icon">🌍</span>
          <span>${map.biomes.length} biomes</span>
        </div>
        <div class="map-detail">
          <span class="detail-icon">👹</span>
          <span>${map.bosses.length} boss${map.bosses.length > 1 ? 'es' : ''}</span>
        </div>
      </div>
      
      <div class="map-features">
        <h4>Caractéristiques :</h4>
        <ul>
          ${map.features.slice(0, 3).map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
      
      <div class="map-actions">
        ${map.status === 'online' ? `
          <button class="btn-primary map-join-btn" onclick="joinMap('${map.id}', '${map.launchCommand}')">
            🚀 Rejoindre
          </button>
          <button class="btn-secondary map-info-btn" onclick="showMapDetails('${map.id}')">
            ℹ️ Détails
          </button>
        ` : `
          <button class="btn-secondary map-join-btn disabled" disabled>
            ${statusInfo.icon} ${statusInfo.text}
          </button>
          <button class="btn-secondary map-info-btn" onclick="showMapDetails('${map.id}')">
            ℹ️ Détails
          </button>
        `}
      </div>
      
      ${map.players > 0 ? `
        <div class="player-activity">
          <div class="activity-bar">
            <div class="activity-fill" style="width: ${playerPercentage}%;"></div>
          </div>
          <span class="activity-text">${playerPercentage}% de capacité</span>
        </div>
      ` : ''}
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
            <h3>🌍 Biomes</h3>
            <div class="biomes-list">
              ${map.biomes.map(biome => `<span class="biome-tag">${biome}</span>`).join('')}
            </div>
          </div>
          
          <div class="modal-section">
            <h3>👹 Boss</h3>
            <div class="bosses-list">
              ${map.bosses.map(boss => `<span class="boss-tag">${boss}</span>`).join('')}
            </div>
          </div>
          
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
  const totalPlayers = ATLANTARK_MAPS.reduce((sum, map) => sum + map.players, 0);
  const onlineMaps = ATLANTARK_MAPS.filter(map => map.status === 'online').length;
  
  const totalMapsElement = document.getElementById('total-maps');
  const clusterPlayersElement = document.getElementById('cluster-players');
  
  if (totalMapsElement) {
    totalMapsElement.textContent = onlineMaps;
  }
  
  if (clusterPlayersElement) {
    clusterPlayersElement.textContent = totalPlayers;
  }
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
    const mapDifficulty = card.querySelector('.map-difficulty').textContent.toLowerCase();
    
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
// AUTO-REFRESH ET INITIALISATION
// ===========================

// Chargement initial des cartes si on est sur la page maps
if (window.location.pathname.includes('maps.html') || 
    document.getElementById('maps-grid')) {
  
  document.addEventListener('DOMContentLoaded', () => {
    loadMaps();
  });
  
  // Auto-refresh des données des cartes toutes les 30 secondes
  setInterval(() => {
    console.log("Actualisation automatique des cartes...");
    loadRealTimeMapData().then(() => {
      updateClusterStats();
      // Réactualiser l'affichage des cartes
      const mapsGrid = document.getElementById('maps-grid');
      if (mapsGrid && mapsGrid.style.display !== 'none') {
        mapsGrid.innerHTML = '';
        ATLANTARK_MAPS.forEach((map, index) => {
          const mapElement = createMapCard(map, index);
          mapsGrid.appendChild(mapElement);
        });
      }
    });
  }, 30000);
}

// ===========================
// UTILITAIRES
// ===========================

function refreshMaps() {
  console.log("Actualisation manuelle des cartes...");
  loadMaps();
}

function getMapById(mapId) {
  return ATLANTARK_MAPS.find(map => map.id === mapId);
}

function getOnlineMaps() {
  return ATLANTARK_MAPS.filter(map => map.status === 'online');
}

function getTotalPlayers() {
  return ATLANTARK_MAPS.reduce((sum, map) => sum + map.players, 0);
}

// Exposer les fonctions globalement pour l'utilisation dans d'autres scripts
window.joinMap = joinMap;
window.showMapDetails = showMapDetails;
window.closeMapModal = closeMapModal;
window.filterMapsByStatus = filterMapsByStatus;
window.filterMapsByDifficulty = filterMapsByDifficulty;
window.refreshMaps = refreshMaps;
