// Service Worker para GitHub Pages
const CACHE_NAME = 'fundacion-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/gracias.html',
  '/style.css',
  '/assets/css/responsive.css',
  '/script.js',
  '/manifest.json',
  // Imágenes críticas
  '/img/icons/logo.svg',
  '/img/hero/fundacion-mobile.jpg',
  // Recursos externos
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600&display=swap'
];

// INSTALAR
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// ACTIVAR Y LIMPIAR CACHÉ ANTIGUO
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// INTERCEPTAR PETICIONES
self.addEventListener('fetch', event => {
  // Excluir Formspree y otras peticiones externas
  if (event.request.url.includes('formspree.io')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver del caché si existe
        if (response) {
          return response;
        }
        
        // Clonar la petición
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verificar respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar respuesta
          const responseToCache = response.clone();
          
          // Guardar en caché para futuras peticiones
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Fallback para imágenes
          if (event.request.destination === 'image') {
            return caches.match('/img/icons/logo.svg');
          }
          
          // Fallback para páginas
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// SINCRONIZAR EN BACKGROUND
self.addEventListener('sync', event => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// FUNCIÓN PARA SINCRONIZAR FORMULARIOS
function syncForms() {
  const pendingForms = JSON.parse(localStorage.getItem('pendingForms') || '[]');
  
  return Promise.all(
    pendingForms.map(formData => {
      return fetch('https://formspree.io/f/TU_ID_FORMSPREE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then(response => {
        if (response.ok) {
          // Eliminar del almacenamiento local
          const updatedForms = pendingForms.filter(f => f !== formData);
          localStorage.setItem('pendingForms', JSON.stringify(updatedForms));
        }
      });
    })
  );
}