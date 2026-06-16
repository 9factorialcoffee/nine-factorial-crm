// 9! COFFEE Store — Service Worker
const CACHE = '9coffee-store-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

// ติดตั้ง — cache ไฟล์หลัก
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// activate — ลบ cache เก่า
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// fetch — network first สำหรับ API, cache first สำหรับ assets
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // ไม่ cache API calls (workers.dev) — ต้องสดเสมอ
  if (url.includes('workers.dev')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"ok":false,"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })));
    return;
  }

  // assets — cache first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
