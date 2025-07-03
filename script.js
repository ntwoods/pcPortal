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
const baseUrl = "https://ntwoods.github.io/ordertodispatch";

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
    
    const levelNumber = index + 1; 
    tile.href = `${baseUrl}/L${levelNumber}.html?crm=${crmParam}&mode=view`;
    tile.textContent = levelData.text; // Use the new shorter descriptive text

    const count = document.createElement("div");
    count.className = "tile-count";
    count.textContent = "..."; // Placeholder while fetching
    tile.appendChild(count);

    tileGrid.appendChild(tile);

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
            // When pending, remove all-clear if it was previously set
            tile.classList.remove('all-clear'); 
          } else {
            // When all clear, remove has-pending
            tile.classList.remove('has-pending');
            // DO NOT ADD 'all-clear' class or remove its styling in CSS
            // The tile will revert to its default look defined by .tile class
          }
        }
      })
      .catch(err => {
        console.error(`Error fetching data for ${crm} - ${levelData.text}:`, err);
        if (count) {
          count.textContent = '-';
        }
        if (tile) {
          tile.classList.remove('has-pending');
          tile.classList.remove('all-clear'); // Ensure no specific styling remains on error
        }
      });
  });

  section.appendChild(tileGrid);
  container.appendChild(section);
});
