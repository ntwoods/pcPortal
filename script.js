const crmList = ["Km Kalpana", "Priyam Dixit", "Akansha Jain", "Mahima Agarwal"];
const levels = [
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
  { text: "Owner Approval Pending", url: "https://script.google.com/macros/s/AKfycbzg5k4acAaEEmWfIklLzd52NW4xPb1yK4JTp_7m3GegNkDE1fPnqXCYwrVwnA6UzoLg4g/exec", fileName: "OwnerApprovalSOview.html" },
  { text: "Order Pending CRM Assign", url: "https://script.google.com/macros/s/AKfycbwWKHlGOSpQ5Jcof9bqCDQp-Tnl8J4lCZZT7DnGIEg75DjXYjVrvRbbjefyjdKDDPpi/exec", fileName: "L0.html" },
  { text: "Dispatch Team", url: "https://script.google.com/macros/s/AKfycbzuX9IvIK3aEoXA3TfzBvcAWcav_QhnuenbaYahJdeFL52Mu3KwkMpvIsVJZ7ni23M9Gg/exec", fileName: "DispatchTeam.html" }
];

const baseUrl = "https://ntwoods.github.io/ordertodispatch"; // Base URL for tile hrefs

const globalTilesContainer = document.getElementById("global-tiles-grid");
const crmSectionsContainer = document.getElementById("crm-sections");

// Function to create and append a tile
function createAndAppendTile(container, tileInfo, crmName = null, levelIndex = null) {
  const tile = document.createElement("a");
  tile.className = "tile";

  let hrefUrl = `${baseUrl}/${tileInfo.fileName}`;
  let apiUrl = tileInfo.url;

  if (crmName) { // If it's a CRM-specific tile
    const crmParam = encodeURIComponent(crmName);
    // Add CRM param to href for the specific CRM's page
    hrefUrl += `?crm=${crmParam}&mode=view`;
    // Add CRM param to API call
    apiUrl += `?crm=${crmParam}`;
  }

  tile.href = hrefUrl;
  tile.textContent = tileInfo.text;

  const count = document.createElement("div");
  count.className = "tile-count";
  count.textContent = "..."; // Placeholder
  tile.appendChild(count);

  container.appendChild(tile);

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

      if (count) {
        count.textContent = pendingCount > 0 ? `${pendingCount}` : '✓';
      }

      if (tile) {
        if (pendingCount > 0) {
          tile.classList.add('has-pending');
        } else {
          tile.classList.remove('has-pending');
          // No 'all-clear' class for green background as per request
        }
      }
    })
    .catch(err => {
      console.error(`Error fetching data for ${tileInfo.text} (${crmName || 'Global'}):`, err);
      if (count) {
        count.textContent = '-';
      }
      if (tile) {
        tile.classList.remove('has-pending'); // Ensure no highlighting on error
      }
    });
}

// Populate Global Tiles
globalTilesData.forEach(tileInfo => {
  createAndAppendTile(globalTilesContainer, tileInfo);
});


// Populate CRM Sections
crmList.forEach(crm => {
  const section = document.createElement("div");
  section.className = "crm-section";

  const heading = document.createElement("div");
  heading.className = "crm-title";
  heading.textContent = crm;
  section.appendChild(heading);

  const tileGrid = document.createElement("div");
  tileGrid.className = "tile-grid"; // Reusing tile-grid for CRM tiles as well

  crmLevels.forEach((levelData, index) => {
    createAndAppendTile(tileGrid, levelData, crm, index);
  });

  section.appendChild(tileGrid);
  crmSectionsContainer.appendChild(section);
});
