const crmList = ["Km Kalpana", "Priyam Dixit", "Akansha Jain", "Mahima Agarwal"];
const levels = [
  { text: "CRM Approval", url: "https://script.google.com/macros/s/AKfycby7o8IwfJ1vgI-_2Ad-epHZHmOdVqTbNVWnncuv4BnDIiIcWNmuzrEspA9jIvgy9G84eQ/exec" },
  { text: "Inform Owner then Call Dealer", url: "https://script.google.com/macros/s/AKfycbwuVRnAkiEKnTNy6yPBiPxA6BHIim4OlHjx1B3duF0Qt81itDZzgESH_g6pGWDkKhTs/exec" },
  { text: "Get Dispatch Date", url: "https://script.google.com/macros/s/AKfycbxkduAfhEpEtxKXA_HuIm-lZQj62ZPZwXeZ_Fol-v6VrzfhoXY2lffR64pjPahKV2o/exec" },
  { text: "Reminder to Dispatch Team", url: "https://script.google.com/macros/s/AKfycbxMxIzOQmHv3LPTh6ca6i5uuguyH615cnjA5emEGNT0rmWpJlnrcg-KWNVP1DORkkcX/exec" },
  { text: "Share Dispatch Details with Dealer", url: "https://script.google.com/macros/s/AKfycbwUr0UhENK6RGtdvYMC6-V0Khwb3kibKP4SLXC4nzL6Hm4idr6P-Olx4XTWvgZ_e2xk-Q/exec" }
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

  levels.forEach(level => {
    const tile = document.createElement("a");
    tile.className = "tile";
    const crmParam = encodeURIComponent(crm);
    // The L{level} in href is no longer directly tied to the level number,
    // so we can use a more descriptive parameter if needed, or keep it
    // generic if the target pages still follow L1.html, L2.html etc.
    // For this example, assuming the base URL structure for links remains L1.html, etc.
    const levelNumber = levels.indexOf(level) + 1; // Get the original level number (1-5) for the href
    tile.href = `${baseUrl}/L${levelNumber}.html?crm=${crmParam}&mode=view`;
    tile.textContent = level.text; // Use the new descriptive text

    const count = document.createElement("div");
    count.className = "tile-count";
    count.textContent = "..."; // placeholder
    tile.appendChild(count);

    tileGrid.appendChild(tile);

    // Fetch pending count from API
    fetch(`${level.url}?action=getStatsFiltered&crm=${crmParam}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && data.stats?.pendingOrders != null) {
          count.textContent = data.stats.pendingOrders;
        } else {
          count.textContent = "0";
        }
      })
      .catch(err => {
        console.error("Error loading count:", err);
        count.textContent = "-";
      });
  });

  section.appendChild(tileGrid);
  container.appendChild(section);
});
