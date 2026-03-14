const CACHE_NAME = 'wordyfy-app-v3';
const urlsToCache = [
  '/',
  '/blog',
  '/manifest.json',
  '/puzzle_icon.png'
];

// Install: cache core assets and skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
      .catch((err) => console.error('SW install failed:', err))
  );
});

// Activate: claim clients and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => name !== CACHE_NAME ? caches.delete(name) : Promise.resolve()))
    ).then(() => self.clients.claim())
  );
});

// Fetch: never cache _next (chunks/assets); cache-first for app pages; network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isApi = url.pathname.startsWith('/api/');
  const isNextStatic = url.pathname.startsWith('/_next/');

  if (!sameOrigin || event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  // Always fetch Next.js chunks/static from network (avoid serving HTML 404 as script)
  if (isNextStatic) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (isApi) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
      const clone = res.clone();
      if (res.ok && res.type === 'basic') {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return res;
    }))
  );
});

// Push: show notification with actions (Take Quiz / Today's Word)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = { title: 'WordyFy', body: 'Time to practice your vocabulary!', url: '/', action: 'default' };
  try {
    data = { ...data, ...event.data.json() };
  } catch (_) {
    data.body = event.data.text() || data.body;
  }
  const options = {
    body: data.body,
    icon: '/puzzle_icon.png',
    badge: '/puzzle_icon.png',
    tag: data.tag || 'wordyfy-default',
    requireInteraction: false,
    data: { url: data.url || '/', action: data.action || 'default' },
    actions: [
      { action: 'quiz', title: 'Take Quiz' },
      { action: 'word', title: "Today's Word" }
    ]
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click: open app to /quiz or /
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const action = event.action || data.action || 'default';
  const url = action === 'quiz' ? '/quiz' : action === 'word' ? '/' : (data.url || '/');
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length) {
        const client = clientList[0];
        client.navigate(url);
        client.focus();
      } else if (self.clients.openWindow) {
        self.clients.openWindow(self.location.origin + url);
      }
    })
  );
});

// Background sync: retry failed requests when back online (e.g. quiz-stats)
// To use: from the page, register a sync with registration.sync.register('quiz-stats-sync')
// and in 'sync' handler below, read queued payloads from IndexedDB and POST to /api/quiz-stats
self.addEventListener('sync', (event) => {
  if (event.tag === 'quiz-stats-sync') {
    event.waitUntil(
      Promise.resolve()
      // TODO: read queued quiz-stats from IndexedDB and POST each to /api/quiz-stats
    );
  }
});

// App messages (e.g. skip waiting)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
