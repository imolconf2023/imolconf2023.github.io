const version = '20230911182059';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/general/external%20sources/2016/08/27/example-post-one/","/categories/","/people/emre_ugur/","/people/fei_xu/","/people/georg_martius/","/people/gianluca_baldassarre/","/blog/","/","/people/jeff_clune/","/people/johann_huber/","/people/junyi_chu/","/people/laure_soulier/","/manifest.json","/people/matej_hoffmann/","/offline/","/people/olivier_sigaud/","/participate/","/people/pierre_yves_oudeyer/","/program/","/people/richard_duro/","/people/sao_mai_nguyen/","/assets/search.json","/people/stephane_doncieux/","/assets/styles.css","/people/sylvain_calinon/","/venue_and_accomodation/","/people/vieri_santucci/","/redirects.json","/sitemap.xml","/robots.txt","/feed.xml","/assets/styles.css.map","/assets/logos/imol_2023_conf_logo.png", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
