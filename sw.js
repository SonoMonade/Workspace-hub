const CACHE_NAME = 'workspace-hub-v2.1.0';
const ASSETS = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/js/app.js',
  './data/tools.json',
  './modules/prompt-builder.html',
  './modules/preventivi.html',
  './modules/tipografia.html',
  './modules/botanica.html',
  './modules/template-modulo.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});