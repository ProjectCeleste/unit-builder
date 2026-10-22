import { registerSW } from "virtual:pwa-register"

if (import.meta.env.PROD) {
  let registration

  registerSW({
    onRegisteredSW(swUrl, r) {
      registration = r
      console.log("Service worker has been registered.")
      if (!navigator.onLine) {
        console.log(
          "No internet connection found. App is running in offline mode."
        )
        document.dispatchEvent(new CustomEvent("swOffline"))
      }
    },
    onOfflineReady() {
      console.log("Content has been cached for offline use.")
    },
    onNeedRefresh() {
      console.log("New content is available; please refresh.")
      document.dispatchEvent(
        new CustomEvent("swUpdated", { detail: registration })
      )
    },
    onRegisterError(error) {
      console.error("Error during service worker registration:", error)
    }
  })
}
