const crmList = ["Km Kalpana", "Priyam Dixit", "Akansha Jain", "Mahima Agarwal"];
const levels = [1, 2, 3, 4, 5];
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
    tile.href = `${baseUrl}/L${level}.html?crm=${crmParam}&mode=view`;
    tile.textContent = `L${level}`;

    const count = document.createElement("div");
    count.className = "tile-count";
    count.textContent = "..."; // placeholder
    tile.appendChild(count);

    tileGrid.appendChild(tile);

    // Fetch pending count from API
    fetch(`https://script.google.com/macros/s/AKfycbyXqpKEvkGqZcTVXvoSBRBl1EI-j5UkODqSlUqgeKjPlIoOddnB3uHM7eGQTce_cwRW/exec?action=getStatsFiltered&crm=${crmParam}&level=L${level}`)
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
