importScripts('workbox/workbox-sw.js');

const isProd = false;
const buildNum = 1582713938589;
workbox.setConfig({ debug: !isProd });

const assetsCacheName = 'exb-assets-cache';
// const configCacheName = 'exb-config-cache';
const apiCacheName = 'arcgis-jsapi-cache';
const Strategy = isProd ? workbox.strategies.CacheFirst : workbox.strategies.NetworkFirst;

const cacheablePlugin = new workbox.cacheableResponse.Plugin({
  statuses: [0, 200],
});

// workbox.routing.registerRoute(
//   new RegExp(/\/experience\/(?:\w+\/)?(config.json|index.html)($|\?)/),
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: configCacheName,
//     fetchOptions: {
//       credentials: 'include',
//     },
//     matchOptions: {
//       ignoreSearch: true
//     },
//     plugins: [cacheablePlugin]
//   })
// );

workbox.routing.registerRoute(
  new RegExp(/\.(?:js|jsx|ts|tsx|css|scss|json|html|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|map|ico)($|\?)/),
  new Strategy({
    cacheName: assetsCacheName,
    fetchOptions: {
      credentials: 'include',
    },
    matchOptions: {
      ignoreSearch: true
    },
    plugins: [cacheablePlugin]
  })
);

workbox.routing.registerRoute(
  new RegExp(/^https?:\/\/js.arcgis.com\//),
  new workbox.strategies.CacheFirst({
    cacheName: apiCacheName,
    plugins: [cacheablePlugin]
  })
);

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  let message = event.data;
  if (message.type === 'to_sw_skip_waiting') {
    self.skipWaiting().then(() => {
      postMessage({type: 'to_window_reload'})
    }).catch(err => {
      console.error(err);
    });
  }
});

function postMessage(message){
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage(message)
    })
  })
}
