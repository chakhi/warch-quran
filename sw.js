// Offline support: app shell + full Warsh text cached on install (audio needs internet).
const SHELL = "warsh-shell-v2";
const FILES = ["./", "index.html", "quran-data.js", "warsh.10.woff2", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== SHELL).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  // Audio streams straight from everyayah.com (not intercepted — iOS Safari needs native range requests).
  if (url.hostname === "everyayah.com") return;

  // App shell: cache-first, fall back to network
  if (url.origin === location.origin) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
  }
});
