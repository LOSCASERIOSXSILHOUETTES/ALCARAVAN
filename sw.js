// ALCARAVAN — Service Worker Offline-First Cache Engine (SGB Silhouettes V3)
const CACHE_NAME = 'alcaravan-v3-cache-v3.10.13';

const STATIC_ASSETS = [
    './',
    './index.html',
    './admin.html',
    './styles.css',
    './manifest.json',
    './js/config.js',
    './js/core/store.js',
    './js/core/realtime-sync.js',
    './js/core/auth.js',
    './js/core/uploader.js',
    './js/services/tasas-bcv.js',
    './js/modules/patentes/catalogo-locat.js',
    './js/modules/patentes/catalogo-vehiculos.js',
    './js/modules/contribuyentes/registro.js',
    './js/modules/patentes/comercial.js',
    './js/modules/declaraciones/formulario.js',
    './js/modules/caja/taquilla.js',
    './js/modules/caja/metodos-pago.js',
    './js/modules/conciliacion/parsers.js',
    './js/modules/conciliacion/smart-ledger.js',
    './js/modules/conciliacion/cuentas.js',
    './js/modules/conciliacion.js',
    './js/modules/solvencias/emisor.js',
    './js/modules/comunicacion/comunicacion.js',
    './js/modules/comunicacion/popups.js',
    './js/modules/usuarios/gestion.js',
    './js/modules/portal-comercio.js',
    './libs/localforage.min.js',
    './libs/sweetalert2/sweetalert2.all.min.js',
    './libs/supabase/supabase.min.js',
    './libs/jspdf/jspdf.umd.min.js',
    './libs/jspdf/jspdf.plugin.autotable.min.js',
    './libs/pdfjs/pdf.min.js',
    './libs/pdfjs/pdf.worker.min.js',
    './libs/tailwind/tailwind.min.css',
    './libs/fontawesome/css/all.min.css',
    './libs/fontawesome/webfonts/fa-solid-900.woff2',
    './libs/fontawesome/webfonts/fa-regular-400.woff2',
    './libs/fontawesome/webfonts/fa-brands-400.woff2'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Alcaraván SW] Pre-caching assets offline...');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[Alcaraván SW] Pre-cache parcial advertencia:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Alcaraván SW] Limpiando caché obsoleta:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // No cachear llamadas REST o Realtime a Supabase ni API de tasas en vivo
    if (url.origin.includes('supabase.co') || url.origin.includes('dolarapi.com')) {
        return;
    }

    // HTML de navegación principal: Network-First (actualización inmediata)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const copy = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Scripts y estilos: Stale-While-Revalidate
    if (event.request.destination === 'script' || event.request.destination === 'style') {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => cachedResponse);

                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // Cache-First para el resto de assets (fuentes, librerías, imágenes)
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                if (event.request.destination === 'image') {
                    return new Response('', { headers: { 'Content-Type': 'image/svg+xml' } });
                }
            });
        })
    );
});
