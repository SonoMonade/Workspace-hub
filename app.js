/* Logica centrale Workspace Hub — Sincronizzazione GitHub data/tools.json + localStorage */
const iconLibrary = {"all":"<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#277584\" stroke-width=\"2.2\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/></svg>","operativita":"<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#277584\" stroke-width=\"2.2\"><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><line x1=\"8\" y1=\"6\" x2=\"16\" y2=\"6\"/><line x1=\"8\" y1=\"10\" x2=\"16\" y2=\"10\"/><line x1=\"8\" y1=\"14\" x2=\"12\" y2=\"14\"/></svg>","ai-automazione":"<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#277584\" stroke-width=\"2.2\"><polyline points=\"16 18 22 12 16 6\"/><polyline points=\"8 6 2 12 8 18\"/></svg>","archivi":"<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#277584\" stroke-width=\"2.2\"><path d=\"M12 2L2 7l10 5 10-5-10-5z\"/><path d=\"M2 17l10 5 10-5\"/><path d=\"M2 12l10 5 10-5\"/></svg>","didattica-lab":"<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#277584\" stroke-width=\"2.2\"><path d=\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z\"/><path d=\"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z\"/></svg>"};
let workspaceState = { version: "2.1.0", sections: [], tools: [] };
let currentCategory = "all";
function showToast(msg) {
      const toast = document.getElementById('toastBox');
      document.getElementById('toastMessage').textContent = msg;
      toast.style.display = 'flex';
      setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
function updateSectionPurposeBanner() {
      const titleEl = document.getElementById('sectionPurposeTitle');
      const descEl = document.getElementById('sectionPurposeDesc');
      const actionsEl = document.getElementById('sectionPurposeActions');

      if (currentCategory === 'all') {
        titleEl.textContent = 'Panoramica Completa del Workspace';
        descEl.textContent = 'A cosa serve: Riunisce in un unico hub tutti gli strumenti operativi, di automazione AI, archiviazione e didattica.';
        actionsEl.textContent = 'Cosa puoi farci: Filtra per funzione, cerca strumenti o creane di nuovi';
        return;
      }

      const activeSec = workspaceState.sections.find(s => s.id === currentCategory);
      if (activeSec) {
        titleEl.textContent = activeSec.label;
        descEl.textContent = activeSec.purpose || '';
        actionsEl.textContent = activeSec.capabilities || '';
      }
    }
function renderNavigationAndFilters() {
  const rail = document.getElementById("railNavItems");
  const filterBar = document.getElementById("filterBar");
  const select = document.getElementById("toolCategory");
  rail.innerHTML = '<button class="nav-btn ' + (currentCategory === "all" ? "active" : "") + '" data-filter="all"><span class="nav-icon-pill">' + iconLibrary.all + '</span><span class="nav-label">Tutti</span></button>';
  filterBar.innerHTML = '<button class="chip ' + (currentCategory === "all" ? "active" : "") + '" data-filter="all">Tutti</button>';
  select.innerHTML = "";
  workspaceState.sections.forEach(function(sec) {
    rail.innerHTML += '<button class="nav-btn ' + (currentCategory === sec.id ? "active" : "") + '" data-filter="' + sec.id + '"><span class="nav-icon-pill">' + (iconLibrary[sec.icon] || iconLibrary.all) + '</span><span class="nav-label">' + (sec.shortLabel || sec.label) + '</span></button>';
    filterBar.innerHTML += '<button class="chip ' + (currentCategory === sec.id ? "active" : "") + '" data-filter="' + sec.id + '">' + sec.label + '</button>';
    const opt = document.createElement("option");
    opt.value = sec.id;
    opt.textContent = sec.label;
    select.appendChild(opt);
  });
  updateSectionPurposeBanner();
  document.querySelectorAll("[data-filter]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      currentCategory = btn.getAttribute("data-filter");
      renderNavigationAndFilters();
      renderGrid();
    });
  });
}
function renderGrid() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const grid = document.getElementById("toolsGrid");
  grid.innerHTML = "";
  let count = 0;
  workspaceState.tools.forEach(function(tool) {
    const matchCat = currentCategory === "all" || tool.category === currentCategory;
    const matchQ = tool.title.toLowerCase().includes(query) || tool.desc.toLowerCase().includes(query) || tool.badge.toLowerCase().includes(query);
    if (matchCat && matchQ) {
      count++;
      const card = document.createElement("article");
      card.className = "tool-card";
      card.innerHTML = '<div><div class="card-top"><div class="card-icon">' + (iconLibrary[tool.category] || iconLibrary.all) + '</div><span class="badge">' + tool.badge + '</span></div><h2>' + tool.title + '</h2><p class="card-desc">' + tool.desc + '</p></div><div class="card-footer"><span class="meta-tag">' + tool.status + '</span><a href="' + tool.url + '" class="btn btn-primary"><span>Apri →</span></a></div>';
      grid.appendChild(card);
    }
  });
  document.getElementById("counterBadge").textContent = count + " Strument" + (count === 1 ? "o" : "i") + " attiv" + (count === 1 ? "o" : "i");
}
async function initWorkspaceHub() {
  let remoteData = null;
  try {
    const res = await fetch("./data/tools.json?v=" + Date.now());
    if (res.ok) remoteData = await res.json();
  } catch (e) {}
  let localData = null;
  try {
    const saved = localStorage.getItem("ws_dashboard_state");
    if (saved) localData = JSON.parse(saved);
  } catch (e) {}
  if (remoteData && localData) {
    if (remoteData.version === localData.version) {
      workspaceState = localData;
    } else {
      const customTools = (localData.tools || []).filter(function(t) { return t.isCustom; });
      workspaceState = remoteData;
      workspaceState.tools = customTools.concat(workspaceState.tools);
      localStorage.setItem("ws_dashboard_state", JSON.stringify(workspaceState));
    }
  } else if (remoteData) {
    workspaceState = remoteData;
    localStorage.setItem("ws_dashboard_state", JSON.stringify(workspaceState));
  } else if (localData) {
    workspaceState = localData;
  }
  document.getElementById("schemaVersionTag").textContent = "v" + (workspaceState.version || "2.1.0");
  renderNavigationAndFilters();
  renderGrid();
}
window.addEventListener("DOMContentLoaded", function() {
  initWorkspaceHub();
  document.getElementById("searchInput").addEventListener("input", renderGrid);
  const drawer = document.getElementById("drawerOverlay");
  document.getElementById("openDrawerBtn").addEventListener("click", function() { drawer.classList.add("open"); });
  document.getElementById("closeDrawerBtn").addEventListener("click", function() { drawer.classList.remove("open"); });
  drawer.addEventListener("click", function(e) { if (e.target === drawer) drawer.classList.remove("open"); });
  document.getElementById("addToolForm").addEventListener("submit", function(e) {
    e.preventDefault();
    workspaceState.tools.unshift({
      id: Date.now(),
      isCustom: true,
      title: document.getElementById("toolTitle").value.trim(),
      category: document.getElementById("toolCategory").value,
      badge: document.getElementById("toolBadge").value.trim(),
      desc: document.getElementById("toolDesc").value.trim(),
      status: document.getElementById("toolStatus").value.trim() || "Attivo",
      url: document.getElementById("toolUrl").value.trim() || "./modules/template-modulo.html"
    });
    localStorage.setItem("ws_dashboard_state", JSON.stringify(workspaceState));
    e.target.reset();
    drawer.classList.remove("open");
    renderGrid();
    showToast("Strumento salvato nel browser");
  });
  document.getElementById("resetDefaultBtn").addEventListener("click", function() {
    localStorage.removeItem("ws_dashboard_state");
    location.reload();
  });
  document.getElementById("importJsonBtn").addEventListener("click", function() { document.getElementById("importJsonInput").click(); });
  document.getElementById("importJsonInput").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed && Array.isArray(parsed.sections) && Array.isArray(parsed.tools)) {
          workspaceState = parsed;
          localStorage.setItem("ws_dashboard_state", JSON.stringify(workspaceState));
          renderNavigationAndFilters();
          renderGrid();
          showToast("Backup JSON importato");
        }
      } catch (err) {}
    };
    reader.readAsText(file);
  });
  document.getElementById("exportJsonBtn").addEventListener("click", function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workspaceState, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "tools.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("File tools.json esportato");
  });
});