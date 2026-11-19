const categoryIcons = {
  lavoro: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
  personale: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  hobby: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};
const categoryLabels = { lavoro: "Lavoro", personale: "Personale", hobby: "Hobby", info: "Info" };
let toolsData = [];
let currentCategory = 'all';
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const counterBadge = document.getElementById('counterBadge');
const filterButtons = document.querySelectorAll('[data-filter]');

function showToast(msg) {
  const toast = document.getElementById('toastBox');
  document.getElementById('toastMessage').textContent = msg;
  toast.style.display = 'flex';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

async function initData() {
  const saved = localStorage.getItem('personalWorkspaceTools');
  if (saved) {
    toolsData = JSON.parse(saved);
    renderGrid();
  } else {
    await fetchDefaultTools();
  }
}

async function fetchDefaultTools() {
  try {
    const response = await fetch('./data/tools.json');
    if (!response.ok) throw new Error('Errore nel caricamento JSON');
    toolsData = await response.json();
    localStorage.setItem('personalWorkspaceTools', JSON.stringify(toolsData));
    renderGrid();
  } catch (error) {
    console.error(error);
    counterBadge.textContent = '0 Strumenti';
    showToast('Errore caricamento data/tools.json');
  }
}

function renderGrid() {
  const query = searchInput.value.toLowerCase().trim();
  toolsGrid.innerHTML = '';
  let visibleCount = 0;

  toolsData.forEach(tool => {
    const matchesCategory = (currentCategory === 'all' || tool.category === currentCategory);
    const matchesSearch = tool.title.toLowerCase().includes(query) || 
                          tool.desc.toLowerCase().includes(query) ||
                          tool.badge.toLowerCase().includes(query);

    if (matchesCategory && matchesSearch) {
      visibleCount++;
      const card = document.createElement('article');
      card.className = 'tool-card';
      card.innerHTML = `
        <div>
          <div class="card-top">
            <div class="card-icon">${categoryIcons[tool.category] || categoryIcons.info}</div>
            <span class="badge">${tool.badge}</span>
          </div>
          <h2>${tool.title}</h2>
          <p class="card-desc">${tool.desc}</p>
        </div>
        <div class="card-footer">
          <span class="meta-tag">${tool.status}</span>
          <a href="${tool.url}" class="btn">Apri →</a>
        </div>
      `;
      toolsGrid.appendChild(card);
    }
  });
  counterBadge.textContent = `${visibleCount} Strument${visibleCount === 1 ? 'o' : 'i'} attiv${visibleCount === 1 ? 'o' : 'i'}`;
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.getAttribute('data-filter');
    filterButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === currentCategory));
    renderGrid();
  });
});

searchInput.addEventListener('input', renderGrid);

const drawerOverlay = document.getElementById('drawerOverlay');
document.getElementById('openDrawerBtn').addEventListener('click', () => drawerOverlay.classList.add('open'));
document.getElementById('closeDrawerBtn').addEventListener('click', () => drawerOverlay.classList.remove('open'));
drawerOverlay.addEventListener('click', (e) => { if (e.target === drawerOverlay) drawerOverlay.classList.remove('open'); });

document.getElementById('addToolForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const cat = document.getElementById('toolCategory').value;
  const newTool = {
    id: Date.now(),
    title: document.getElementById('toolTitle').value.trim(),
    category: cat,
    badge: categoryLabels[cat],
    desc: document.getElementById('toolDesc').value.trim(),
    status: document.getElementById('toolStatus').value.trim() || 'Attivo',
    url: document.getElementById('toolUrl').value.trim() || './modules/template-modulo.html'
  };
  toolsData.unshift(newTool);
  localStorage.setItem('personalWorkspaceTools', JSON.stringify(toolsData));
  e.target.reset();
  drawerOverlay.classList.remove('open');
  renderGrid();
  showToast('Strumento salvato nel browser');
});

document.getElementById('resetDefaultBtn').addEventListener('click', async () => {
  await fetchDefaultTools();
  drawerOverlay.classList.remove('open');
  showToast('Dati sincronizzati con data/tools.json');
});

document.getElementById('exportJsonBtn').addEventListener('click', () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toolsData, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "tools.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('File tools.json scaricato (sostituiscilo su GitHub)');
});

window.addEventListener('DOMContentLoaded', initData);