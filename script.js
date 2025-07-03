const crmList = ["Km Kalpana", "Priyam Dixit", "Akansha Jain", "Mahima Agarwal"];
const levels = [
  { text: "CRM Approval", url: "https://script.google.com/macros/s/AKfycby7o8IwfJ1vgI-_2Ad-epHZHmOdVqTbNVWnncuv4BnDIiIcWNmuzrEspA9jIvgy9G84eQ/exec" },
  { text: "Inform Owner then Call Dealer", url: "https://script.google.com/macros/s/AKfycbwuVRnAkiEKnTNy6yPBiPxA6BHIim4OlHjx1B3duF0Qt81itDZzgESH_g6pGWDkKhTs/exec" },
  { text: "Get Dispatch Date", url: "https://script.google.com/macros/s/AKfycbxkduAfhEpEtxKXA_HuIm-lZQj62ZPZwXeZ_Fol-v6VrzfhoXY2lffR64pjPahKV2o/exec" },
  { text: "Reminder to Dispatch Team", url: "https://script.google.com/macros/s/AKfycbxMxIzOQmHv3LPTh6ca6i5uuguyH615cnjA5emEGNT0rmWpJlnrcg-KWNVP1DORkkcX/exec" },
  { text: "Share Dispatch Details with Dealer", url: "https://script.google.com/macros/s/AKfycbwUr0UhENK6RGtdvYMC6-V0Khwb3kibKP4SLXC4nzL6Hm4idr6P-Olx4XTWvgZ_e2xk-Q/exec" }
];
const baseUrl = "https://ntwoods.github.io/ordertodispatch"; // Base URL for tile hrefs

const container = document.getElementById("crm-sections");

crmList.forEach(crm => {
  const section = document.createElement("div");
  section.className = "crm-section";

  const heading = document.createElement("div");
  heading.className = "crm-title";
  heading.textContent = crm;
  section.appendChild(heading);

  const tileGrid = document.createElement("div");
  tileGrid.className = "tile-grid";

  levels.forEach((levelData, index) => {
    const tile = document.createElement("a");
    tile.className = "tile";
    const crmParam = encodeURIComponent(crm);
    
    // Determine the level number for the href (L1.html, L2.html, etc.)
    const levelNumber = index + 1; 
    tile.href = `${baseUrl}/L${levelNumber}.html?crm=${crmParam}&mode=view`;
    tile.textContent = levelData.text; // Use the new descriptive text for the card

    const count = document.createElement("div");
    count.className = "tile-count";
    count.textContent = "..."; // Placeholder while fetching
    tile.appendChild(count);

    tileGrid.appendChild(tile);

    // Fetch pending count from the specific API for this level and CRM
    const apiUrl = `${levelData.url}?crm=${crmParam}`;

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        let pendingCount = 0;
        // Logic to extract count based on different API response structures
        if (data.success && typeof data.count === 'number') {
          pendingCount = data.count;
        } else if (Array.isArray(data.data)) {
          pendingCount = data.data.length;
        } else if (data.stats && typeof data.stats.pendingOrders === 'number') {
          pendingCount = data.stats.pendingOrders;
        }

        if (count) {
          count.textContent = pendingCount > 0 ? `${pendingCount}` : '✓'; // Display count or a checkmark
        }

        // Apply classes for styling based on pending count
        if (tile) {
          if (pendingCount > 0) {
            tile.classList.add('has-pending');
            tile.classList.remove('all-clear');
          } else {
            tile.classList.remove('has-pending');
            tile.classList.add('all-clear');
          }
        }
      })
      .catch(err => {
        console.error(`Error fetching data for ${crm} - ${levelData.text}:`, err);
        if (count) {
          count.textContent = '-'; // Indicate error
        }
        // Remove pending/all-clear classes on error
        if (tile) {
          tile.classList.remove('has-pending');
          tile.classList.remove('all-clear');
        }
      });
  });

  section.appendChild(tileGrid);
  container.appendChild(section);
});

// Optional: Add the DOMContentLoaded listener and setInterval for periodic refresh
// (as seen in Sonakshi Jain PC14691995 (1).html for full functionality,
// but the above loop already fetches data on load for each tile.)
// If you want a full periodic refresh of *all* counts, you'd wrap the crmList.forEach
// in a function and call it periodically. For now, each tile fetches its own data once.
