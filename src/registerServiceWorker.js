/* eslint-disable no-console */

import { register } from "register-service-worker"

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      )
    },
    registered() {
      console.log("Service worker has been registered.")
    },
    cached() {
      console.log("Content has been cached for offline use.")
    },
    updatefound() {
      console.log("New content is downloading.")
    },
    updated(registration) {
      console.log("New content is available; please refresh.")
      document.dispatchEvent(
        new CustomEvent("swUpdated", { detail: registration })
      )
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode."
      )
    },
    error(error) {
      console.error("Error during service worker registration:", error)
    }
  })
}

// FIXME Service worker event waitUntil() was passed a promise that rejected with 'Error: bad-precaching-response :: [{"url":"https://unitstats.projectceleste.com/robots.prod.txt?__WB_REVISION__=5e0bd1c281a62a380d7a948085bfe2d1","status":404}]'. workbox-core.prod.js:1:240
