// Service Worker simples
const CACHE_NAME = "kim-stylus-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Deixa o navegador lidar normalmente (modo online)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
