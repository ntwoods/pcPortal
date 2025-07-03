const crmList = ["Km Kalpana", "Priyam Dixit", "Akansha Jain", "Mahima Agarwal"];
const crmLevels = [
  { text: "CRM Approval", url: "https://script.google.com/macros/s/AKfycby7o8IwfJ1vgI-_2Ad-epHZHmOdVqTbNVWnncuv4BnDIiIcWNmuzrEspA9jIvgy9G84eQ/exec" },
  { text: "Inform Owner then Call Dealer", url: "https://script.google.com/macros/s/AKfycbwuVRnAkiEKnTNy6yPBiPxA6BHIim4OlHjx1B3duF0Qt81itDZzgESH_g6pGWDkKhTs/exec" },
  { text: "Get Dispatch Date", url: "https://script.google.com/macros/s/AKfycbxkduAfhEpEtxKXA_HuIm-lZQj62ZPZwXeZ_Fol-v6VrzfhoXY2lffR64pjPahKV2o/exec" },
  { text: "Reminder to Dispatch Team", url: "https://script.google.com/macros/s/AKfycbxMxIzOQmHv3LPTh6ca6i5uuguyH615cnjA5emEGNT0rmWpJlnrcg-KWNVP1DORkkcX/exec" },
  { text: "Share Dispatch Details with Dealer", url: "https://script.google.com/macros/s/AKfycbwUr0UhENK6RGtdvYMC6-V0Khwb3kibKP4SLXC4nzL6Hm4idr6P-Olx4XTWvgZ_e2xk-Q/exec" },
  { text: "Delivery Confirmation", url: "https://script.google.com/macros/s/AKfycbyo5HTKVwD2L5ORxrYKRzdJYK3trFJ5FOHkmPC00TsKQQ3iLJ6aXkboKQgzZJpuf6jNqQ/exec" },
  { text: "Hold Orders", url: "https://script.google.com/macros/s/AKfycbx8Ourjem3diO9CTDl_wdGuJXSksFUImwIvq2gB1tFjeOUdNkLDdUso8he0-6CTlSJc/exec" }    
];
// Global tiles (no CRM parameter needed)
const globalTilesData = [
  { text: "Owner Approval Pending", url: "https://script.google.com/macros/s/AKfycbzg5k4acAaEEmWfIklLzd52NW4xPb1yK4JTp_7m3GegNkDE1fPnqXCYwrVwnA6UzoLg4g/exec", fileName: "OwnerApprovalSOview.html", icon: "👑" },
  { text: "Order Pending CRM Assign", url: "https://script.google.com/macros/s/AKfycbwWKHlGOSpQ5Jcof9bqCDQp-Tnl8J4lCZZT7DnGIEg75DjXYjVrvRbbjefyjdKDDPpi/exec", fileName: "L0.html", icon: "➕" },
  { text: "Dispatch Team", url: "https://script.google.com/macros/s/AKfycbzuX9IvIK3aEoXA3TfzBvcAWcav_QhnuenbaYahJdeFL52Mu3KwkMpvIsVJZ7ni23M9Gg/exec", fileName: "DispatchTeam.html", icon: "🚚" }
];

const baseUrl = "https://ntwoods.github.io/ordertodispatch"; // Base URL for tile hrefs

const globalTilesGrid = document.getElementById("global-tiles-grid");
const crmSectionsContainer = document.getElementById("crm-sections");

// --- Theme Toggle Functionality ---
function toggleDarkMode() {
  const body = document.body;
  if (body.getAttribute('data-theme') === 'dark') {
    body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Default to system preference if no theme saved
    document.body.setAttribute('data-theme', 'dark');
  }
});


// --- CRM Section Collapse/Expand Functionality ---
function setupCrmToggle() {
    // Delegate event listener to the parent container
    crmSectionsContainer.addEventListener('click', (event) => {
        const header = event.target.closest('.crm-section .section-header');
        if (header) {
            const section = header.parentElement;
            if (section) {
                section.classList.toggle('collapsed');
            }
        }
    });
}


// --- Tile Creation and Data Fetching ---
// Function to create and append a card tile
function createAndAppendCard(container, cardInfo, crmName = null) {
  const card = document.createElement("div");
  card.className = "card loading"; // Start with loading class

  let hrefUrl = `${baseUrl}/${cardInfo.fileName}`;
  let apiUrl = cardInfo.url;

  if (crmName) { // If it's a CRM-specific card
    const crmParam = encodeURIComponent(crmName);
    // Add CRM param to href for the specific CRM's page
    hrefUrl += `?crm=${crmParam}&mode=view`;
    // Add CRM param to API call
    apiUrl += `?crm=${crmParam}`;
  }

  // Set onclick to navigate, mimicking the dashboard (1).html approach
  card.onclick = () => {
    location.href = hrefUrl;
  };

  const cardIcon = document.createElement("div");
  cardIcon.className = "card-icon";
  cardIcon.textContent = cardInfo.icon || '🔗'; // Use provided icon or default
  card.appendChild(cardIcon);

  const cardTitle = document.createElement("h3");
  cardTitle.className = "card-title";
  cardTitle.textContent = cardInfo.text;
  card.appendChild(cardTitle);

  const cardCount = document.createElement("div");
  cardCount.className = "card-count";
  cardCount.textContent = "..."; // Placeholder
  card.appendChild(cardCount);

  container.appendChild(card);

  // Fetch pending count
  fetch(apiUrl)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      let pendingCount = 0;
      if (data.success && typeof data.count === 'number') {
        pendingCount = data.count;
      } else if (Array.isArray(data.data)) {
        pendingCount = data.data.length;
      } else if (data.stats && typeof data.stats.pendingOrders === 'number') {
        pendingCount = data.stats.pendingOrders;
      }

      if (cardCount) {
        cardCount.textContent = pendingCount > 0 ? `${pendingCount}` : '✓';
      }

      if (card) {
        card.classList.remove('loading'); // Remove loading state
        if (pendingCount > 0) {
          card.classList.add('has-pending');
        } else {
          card.classList.remove('has-pending');
          // No 'all-clear' class for green background as per request
        }
      }
    })
    .catch(err => {
      console.error(`Error fetching data for ${cardInfo.text} (${crmName || 'Global'}):`, err);
      if (cardCount) {
        cardCount.textContent = '-';
      }
      if (card) {
        card.classList.remove('loading'); // Remove loading state
        card.classList.remove('has-pending'); // Ensure no highlighting on error
      }
    });
}

// Function to refresh all counts (clears and repopulates)
function refreshAllCounts() {
    // Clear existing global tiles
    globalTilesGrid.innerHTML = '';
    // Populate Global Tiles
    globalTilesData.forEach(cardInfo => {
        createAndAppendCard(globalTilesGrid, cardInfo);
    });

    // Clear existing CRM sections
    crmSectionsContainer.innerHTML = '';
    // Populate CRM Sections
    crmList.forEach(crm => {
        const crmSectionDiv = document.createElement("div");
        crmSectionDiv.className = "crm-section-item section"; // Apply section class too
        crmSectionDiv.id = `crm-section-${crm.replace(/\s/g, '')}`; // Unique ID for toggle

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "section-header";
        // Do not add toggle-icon here; it's added by CSS ::after if collapsed is applied
        const sectionTitle = document.createElement("h3");
        sectionTitle.className = "section-title";
        sectionTitle.textContent = crm;
        sectionHeader.appendChild(sectionTitle);

        // Add a visible toggle icon within the header
        const toggleIcon = document.createElement("span");
        toggleIcon.className = "toggle-icon";
        toggleIcon.textContent = "▼"; // Down arrow
        sectionHeader.appendChild(toggleIcon);


        crmSectionDiv.appendChild(sectionHeader);

        const cardGridContainer = document.createElement("div");
        cardGridContainer.className = "card-grid-container"; // For collapse/expand animation

        const crmTileGrid = document.createElement("div");
        crmTileGrid.className = "crm-grid"; // Use crm-grid for CRM tiles

        crmLevels.forEach(levelData => {
            createAndAppendCard(crmTileGrid, levelData, crm);
        });

        cardGridContainer.appendChild(crmTileGrid);
        crmSectionDiv.appendChild(cardGridContainer);
        crmSectionsContainer.appendChild(crmSectionDiv);
    });
}


// --- Initial Load and Periodic Refresh ---
document.addEventListener('DOMContentLoaded', () => {
  refreshAllCounts(); // Initial load of all data
  setupCrmToggle(); // Set up toggle listeners
});

// Auto refresh every 30 seconds
setInterval(refreshAllCounts, 30000);
