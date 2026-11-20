const CACHE_NAME = "workspace-hub-v2.1.0";
const ASSETS = ["./", "./index.html", "./assets/css/style.css", "./assets/js/app.js", "./data/tools.json", "./modules/prompt-builder.html", "./modules/preventivi.html", "./modules/tipografia.html", "./modules/botanica.html", "./modules/template-modulo.html"];
self.addEventListener("install", function(e) { e.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(ASSETS); })); });
self.addEventListener("fetch", function(e) { e.respondWith(fetch(e.request).catch(function() { return caches.match(e.request); })); });