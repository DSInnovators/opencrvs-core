importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js'
)

const queue = new workbox.backgroundSync.Queue('registerQueue', {
  callbacks: {
    queueDidReplay: function(requestArray) {
      let requestSynced = 0
      requestArray.forEach(item => {
        if (!item.error) {
          requestSynced++
        }
      })

      if (requestSynced > 0) {
        new BroadcastChannel('backgroundSynBroadCastChannel').postMessage(
          requestSynced
        )
      }
    }
  }
})
const GraphQLMatch = /graphql(\S+)?/

self.addEventListener('fetch', event => {
  if (
    null !== event.request.url.match(GraphQLMatch) &&
    navigator.onLine === false
  ) {
    const promiseChain = fetch(event.request.clone()).catch(err => {
      return queue.addRequest(event.request)
    })

    event.waitUntil(promiseChain)
  }
})

self.addEventListener('message', event => {
  if (!event.data) {
    return
  }

  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting()
      break
    default:
      break
  }
})

workbox.precaching.precacheAndRoute([])

/*
 *   Alternate for navigateFallback & navigateFallbackBlacklist
 */
workbox.routing.registerNavigationRoute('/index.html', {
  blacklist: [/^\/__.*$/]
})
