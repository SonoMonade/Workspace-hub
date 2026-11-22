const iconLibrary = {
all: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
operativita: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>',
'ai-automazione': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
archivi: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
'didattica-lab': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#277584" stroke-width="2.2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
};
// Dati predefiniti integrati: garantiscono che il sito carichi SEMPRE anche senza tools.json
const BUILTIN_DEFAULT_DATA = {
version: "2.3.0",
sections: [
{
id: "operativita",
label: "Operatività & Gestione",
shortLabel: "Operatività",
icon: "operativita",
purpose: "A cosa servono: Strumenti per pianificare attività, calcolare tariffe/preventivi e amministrare spese o scadenze.",
capabilities: "Cosa puoi farci: Calcolare importi, monitorare scadenze, aggiornare stati ed esportare CSV/JSON."
},
{
id: "ai-automazione",
label: "AI & Automazione",
shortLabel: "AI & Flow",
icon: "ai-automazione",
purpose: "A cosa servono: Strumenti per progettare, strutturare e riutilizzare system prompt, flussi operativi e checklist AI.",
capabilities: "Cosa puoi farci: Archiviare template di prompt, copiare istruzioni con un clic e standardizzare i flussi."
},
{
id: "archivi",
label: "Archivi & Conoscenza",
shortLabel: "Archivi",
icon: "archivi",
purpose: "A cosa servono: Strumenti per catalogare schede botaniche, impaginare documenti e consultare guide di riferimento.",
capabilities: "Cosa puoi farci: Stampare etichette botaniche, impaginare in pt ed esportare Word / Google Docs."
},
{
id: "didattica-lab",
label: "Didattica & Lab",
shortLabel: "Lab",
icon: "didattica-lab",
purpose: "A cosa servono: Spazio dedicato a dispense formative, esercitazioni guidate e prototipi di nuovi moduli.",
capabilities: "Cosa puoi farci: Preparare materiali didattici e testare nuovi strumenti."
}
],
tools: [
{
id: 1,
title: "Prompt & Workflow Builder",
category: "ai-automazione",
badge: "Prompt & Workflow",
desc: "Libreria strutturata di system prompt, template per automazioni AI e checklist di controllo qualità.",
status: "Operativo",
url: "./prompt-builder.html"
},
{
id: 2,
title: "Gestione Attività & Preventivi",
category: "operativita",
badge: "Lavoro",
desc: "Calcolatore rapido tariffe, scadenzario consegne e modelli di preventivo pronti all'esportazione.",
status: "Operativo",
url: "./preventivi.html"
},
{
id: 3,
title: "Ripartizione Utenze & Casa",
category: "operativita",
badge: "Casa",
desc: "Registro condiviso bollette (luce, gas, fibra), scadenze domestiche e promemoria manutenzione.",
status: "In pari",
url: "./template-modulo.html"
},
{
id: 4,
title: "Archivio Botanico & Stampa",
category: "archivi",
badge: "Botanica",
desc: "Catalogo personale con generatore di layout ottimizzati per etichette termiche e schede tecniche.",
status: "Operativo",
url: "./botanica.html"
},
{
id: 5,
title: "Note di Viaggio & Fotografia",
category: "archivi",
badge: "Fotografia",
desc: "Tracce itinerari, appunti sulla luce, checklist attrezzatura e selezione progetti personali.",
status: "Archivio 2026",
url: "./template-modulo.html"
},
{
id: 6,
title: "Knowledge Base & Guide",
category: "archivi",
badge: "Documenti",
desc: "Dispense, link utili, manuali rapidi e documentazione tecnica di riferimento quotidiano.",
status: "Consultazione",
url: "./template-modulo.html"
},
{
id: 7,
title: "Strumento Tipografico & Impaginazione",
category: "archivi",
badge: "Tipografia",
desc: "Calcolatore scale in pt, margini pagina, griglia a colonne ed esportazione Word / Google Docs.",
status: "Operativo",
url: "./tipografia.html"
}
]
};
let workspaceState = JSON.parse(JSON.stringify(BUILTIN_DEFAULT_DATA));
let currentCategory = 'all';
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const counterBadge = document.getElementById('counterBadge');
const filterBar = document.getElementById('filterBar');
const railNavItems = document.getElementById('railNavItems');
const toolCategorySelect = document.getElementById('toolCategory');
function showToast(msg) {
const toast = document.getElementById('toastBox');
document.getElementById('toastMessage').textContent = msg;
toast.style.display = 'flex';
setTimeout(() => { toast.style.display = 'none'; }, 3500);
}
async function initData() {
// Rimuove eventuali vecchi Service Worker bloccati in cache
if ('serviceWorker' in navigator) {
navigator.serviceWorker.getRegistrations().then(regs => {
for (let reg of regs) reg.unregister();
}).catch(() => {});
}
let savedState = null;
try {
const savedRaw = localStorage.getItem('ws_dashboard_state');
if (savedRaw) savedState = JSON.parse(savedRaw);
} catch (e) {
savedState = null;
}
if (savedState && Array.isArray(savedState.sections) && savedState.sections.length > 0 && Array.isArray(savedState.tools) && savedState.tools.length > 0) {
workspaceState = savedState;
} else {
workspaceState = JSON.parse(JSON.stringify(BUILTIN_DEFAULT_DATA));
localStorage.setItem('ws_dashboard_state', JSON.stringify(workspaceState));
}
try {
const res = await fetch('./tools.json?v=' + Date.now());
if (res.ok) {
const remoteData = await res.json();
if (remoteData && Array.isArray(remoteData.sections) && remoteData.sections.length > 0) {
const customTools = workspaceState.tools.filter(t => t.isCustom);
workspaceState = { ...remoteData, tools: [...customTools, ...remoteData.tools] };
localStorage.setItem('ws_dashboard_state', JSON.stringify(workspaceState));
}
}
} catch (e) {
// Usa silenziosamente i dati integrati
}
document.getElementById('schemaVersionTag').textContent = 'v' + (workspaceState.version || '2.3.0');
loadCloudConfig();
renderNavigationAndFilters();
renderGrid();
}
function updateSectionPurposeBanner() {
const titleEl = document.getElementById('sectionPurposeTitle');
const descEl = document.getElementById('sectionPurposeDesc');
const actionsEl = document.getElementById('sectionPurposeActions');
if (currentCategory === 'all') {
titleEl.textContent = 'Panoramica Completa del Workspace';
descEl.textContent = 'A cosa serve: Riunisce in un unico hub tutti gli strumenti operativi, di automazione AI, archiviazione e didattica.';
actionsEl.textContent = 'Cosa puoi farci: Filtra per funzione, cerca strumenti o salva sul Cloud';
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
railNavItems.innerHTML = ⁠<button class="nav-btn ${currentCategory === 'all' ? 'active' : ''}" data-filter="all"><span class="nav-icon-pill">${iconLibrary.all}</span><span class="nav-label">Tutti</span></button>⁠;
workspaceState.sections.forEach(sec => {
railNavItems.innerHTML += ⁠<button class="nav-btn ${currentCategory === sec.id ? 'active' : ''}" data-filter="${sec.id}"><span class="nav-icon-pill">${iconLibrary[sec.icon] || iconLibrary.all}</span><span class="nav-label">${sec.shortLabel || sec.label}</span></button>⁠;
});
filterBar.innerHTML = ⁠<button class="chip ${currentCategory === 'all' ? 'active' : ''}" data-filter="all">Tutti</button>⁠;
workspaceState.sections.forEach(sec => {
filterBar.innerHTML += ⁠<button class="chip ${currentCategory === sec.id ? 'active' : ''}" data-filter="${sec.id}">${sec.label}</button>⁠;
});
toolCategorySelect.innerHTML = '';
workspaceState.sections.forEach(sec => {
const opt = document.createElement('option');
opt.value = sec.id;
opt.textContent = sec.label;
toolCategorySelect.appendChild(opt);
});
updateSectionPurposeBanner();
document.querySelectorAll('[data-filter]').forEach(btn => {
btn.addEventListener('click', () => {
currentCategory = btn.getAttribute('data-filter');
renderNavigationAndFilters();
renderGrid();
});
});
}
function renderGrid() {
const query = searchInput.value.toLowerCase().trim();
toolsGrid.innerHTML = '';
let visibleCount = 0;
workspaceState.tools.forEach(tool => {
const matchesCategory = (currentCategory === 'all' || tool.category === currentCategory);
const matchesSearch = tool.title.toLowerCase().includes(query) || tool.desc.toLowerCase().includes(query) || tool.badge.toLowerCase().includes(query);
if (matchesCategory && matchesSearch) {
visibleCount++;
const card = document.createElement('article');
card.className = 'tool-card';
card.innerHTML = ⁠<div><div class="card-top"><div class="card-icon">${iconLibrary[tool.category] || iconLibrary.all}</div><span class="badge">${tool.badge}</span></div><h2>${tool.title}</h2><p class="card-desc">${tool.desc}</p></div><div class="card-footer"><span class="meta-tag">${tool.status}</span><a href="${tool.url}" class="btn">Apri →</a></div>⁠;
toolsGrid.appendChild(card);
}
});
counterBadge.textContent = ⁠${visibleCount} Strument${visibleCount === 1 ? 'o' : 'i'} attiv${visibleCount === 1 ? 'o' : 'i'}⁠;
}
// --- SINCRONIZZAZIONE GRATUITA GITHUB CLOUD ---
const CLOUD_CFG_KEY = 'ws_github_cloud_cfg';
function loadCloudConfig() {
try {
const cfg = JSON.parse(localStorage.getItem(CLOUD_CFG_KEY) || '{}');
if (cfg.owner) document.getElementById('ghOwner').value = cfg.owner;
if (cfg.repo) document.getElementById('ghRepo').value = cfg.repo;
if (cfg.token) document.getElementById('ghToken').value = cfg.token;
if (cfg.lastSync) document.getElementById('cloudLastSyncLabel').textContent = 'Ultimo sync: ' + cfg.lastSync;
} catch (e) {}
}
function utf8ToBase64(str) {
return btoa(unescape(encodeURIComponent(str)));
}
function base64ToUtf8(b64) {
return decodeURIComponent(escape(atob(b64.replace(/\n/g, ''))));
}
function gatherAllWorkspaceData() {
return {
exportedAt: new Date().toISOString(),
dashboard: JSON.parse(localStorage.getItem('ws_dashboard_state') || 'null'),
botanica: JSON.parse(localStorage.getItem('ws_module_botanica') || 'null'),
tipografia: JSON.parse(localStorage.getItem('ws_module_tipografia') || 'null'),
preventivi: JSON.parse(localStorage.getItem('ws_module_preventivi') || 'null'),
prompts: JSON.parse(localStorage.getItem('ws_module_prompts') || 'null')
};
}
async function pushAllDataToGithub() {
const cfg = JSON.parse(localStorage.getItem(CLOUD_CFG_KEY) || '{}');
if (!cfg.owner || !cfg.repo || !cfg.token) {
showToast('Inserisci prima Utente, Repository e Chiave');
return;
}
const apiUrl = ⁠https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/backup-workspace.json⁠;
const headers = {
'Authorization': ⁠Bearer ${cfg.token}⁠,
'Accept': 'application/vnd.github+json',
'Content-Type': 'application/json'
};
try {
showToast('Salvataggio su GitHub Cloud in corso...');
let sha = undefined;
const checkRes = await fetch(apiUrl, { headers });
if (checkRes.ok) {
const existing = await checkRes.json();
sha = existing.sha;
}
const payload = {
message: 'Sync backup Workspace Hub ' + new Date().toLocaleString('it-IT'),
content: utf8ToBase64(JSON.stringify(gatherAllWorkspaceData(), null, 2)),
...(sha ? { sha } : {})
};
const putRes = await fetch(apiUrl, {
method: 'PUT',
headers,
body: JSON.stringify(payload)
});
if (!putRes.ok) throw new Error('Errore API GitHub (' + putRes.status + ')');
const nowLabel = new Date().toLocaleString('it-IT');
cfg.lastSync = nowLabel;
localStorage.setItem(CLOUD_CFG_KEY, JSON.stringify(cfg));
document.getElementById('cloudLastSyncLabel').textContent = 'Ultimo sync: ' + nowLabel;
showToast('Tutti i dati salvati su GitHub Cloud!');
} catch (err) {
showToast('Errore sync: verifica Chiave o Repository');
}
}
async function pullAllDataFromGithub() {
const cfg = JSON.parse(localStorage.getItem(CLOUD_CFG_KEY) || '{}');
if (!cfg.owner || !cfg.repo || !cfg.token) {
showToast('Inserisci prima Utente, Repository e Chiave');
return;
}
const apiUrl = ⁠https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/backup-workspace.json?t=${Date.now()}⁠;
try {
showToast('Scaricamento dal Cloud in corso...');
const res = await fetch(apiUrl, {
headers: {
'Authorization': ⁠Bearer ${cfg.token}⁠,
'Accept': 'application/vnd.github+json'
}
});
if (!res.ok) throw new Error('File backup non trovato');
const fileData = await res.json();
const parsed = JSON.parse(base64ToUtf8(fileData.content));
if (parsed.dashboard) localStorage.setItem('ws_dashboard_state', JSON.stringify(parsed.dashboard));
if (parsed.botanica) localStorage.setItem('ws_module_botanica', JSON.stringify(parsed.botanica));
if (parsed.tipografia) localStorage.setItem('ws_module_tipografia', JSON.stringify(parsed.tipografia));
if (parsed.preventivi) localStorage.setItem('ws_module_preventivi', JSON.stringify(parsed.preventivi));
if (parsed.prompts) localStorage.setItem('ws_module_prompts', JSON.stringify(parsed.prompts));
await initData();
showToast('Dati ripristinati dal Cloud GitHub!');
} catch (err) {
showToast('Nessun backup trovato o Chiave non valida');
}
}
const cloudDrawerOverlay = document.getElementById('cloudDrawerOverlay');
document.getElementById('openCloudDrawerBtn').addEventListener('click', () => cloudDrawerOverlay.classList.add('open'));
document.getElementById('closeCloudDrawerBtn').addEventListener('click', () => cloudDrawerOverlay.classList.remove('open'));
cloudDrawerOverlay.addEventListener('click', (e) => { if (e.target === cloudDrawerOverlay) cloudDrawerOverlay.classList.remove('open'); });
document.getElementById('cloudConfigForm').addEventListener('submit', (e) => {
e.preventDefault();
const prev = JSON.parse(localStorage.getItem(CLOUD_CFG_KEY) || '{}');
const updated = {
...prev,
owner: document.getElementById('ghOwner').value.trim(),
repo: document.getElementById('ghRepo').value.trim(),
token: document.getElementById('ghToken').value.trim()
};
localStorage.setItem(CLOUD_CFG_KEY, JSON.stringify(updated));
showToast('Configurazione salvata');
});
document.getElementById('pushToGithubCloudBtn').addEventListener('click', pushAllDataToGithub);
document.getElementById('pullFromGithubCloudBtn').addEventListener('click', pullAllDataFromGithub);
// --- EVENTI STANDARD DASHBOARD ---
searchInput.addEventListener('input', renderGrid);
const drawerOverlay = document.getElementById('drawerOverlay');
document.getElementById('openDrawerBtn').addEventListener('click', () => drawerOverlay.classList.add('open'));
document.getElementById('closeDrawerBtn').addEventListener('click', () => drawerOverlay.classList.remove('open'));
drawerOverlay.addEventListener('click', (e) => { if (e.target === drawerOverlay) drawerOverlay.classList.remove('open'); });
document.getElementById('addToolForm').addEventListener('submit', (e) => {
e.preventDefault();
const newTool = {
id: Date.now(),
isCustom: true,
title: document.getElementById('toolTitle').value.trim(),
category: document.getElementById('toolCategory').value,
badge: document.getElementById('toolBadge').value.trim(),
desc: document.getElementById('toolDesc').value.trim(),
status: document.getElementById('toolStatus').value.trim() || 'Attivo',
url: document.getElementById('toolUrl').value.trim() || './template-modulo.html'
};
workspaceState.tools.unshift(newTool);
localStorage.setItem('ws_dashboard_state', JSON.stringify(workspaceState));
e.target.reset();
drawerOverlay.classList.remove('open');
renderGrid();
showToast('Strumento salvato nel browser');
});
document.getElementById('resetDefaultBtn').addEventListener('click', async () => {
localStorage.removeItem('ws_dashboard_state');
await initData();
drawerOverlay.classList.remove('open');
showToast('Strumenti base ripristinati');
});
document.getElementById('importJsonBtn').addEventListener('click', () => document.getElementById('importJsonInput').click());
document.getElementById('importJsonInput').addEventListener('change', (e) => {
const file = e.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = (ev) => {
try {
const parsed = JSON.parse(ev.target.result);
if (parsed && Array.isArray(parsed.sections) && Array.isArray(parsed.tools)) {
workspaceState = parsed;
localStorage.setItem('ws_dashboard_state', JSON.stringify(workspaceState));
renderNavigationAndFilters();
renderGrid();
showToast('Backup importato');
}
} catch (err) { showToast('Errore file JSON'); }
};
reader.readAsText(file);
});
document.getElementById('exportJsonBtn').addEventListener('click', () => {
const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workspaceState, null, 2));
const a = document.createElement('a');
a.href = dataStr;
a.download = "tools.json";
document.body.appendChild(a);
a.click();
a.remove();
showToast('File tools.json scaricato');
});
window.addEventListener('DOMContentLoaded', initData);
