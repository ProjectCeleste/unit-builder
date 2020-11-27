import { createApp } from "vue"
import App from "./App.vue"
import vClickOutside from "./v-click-outside.js"
import "./registerServiceWorker"
import store from "./store"

createApp(App)
  .use(store)
  .directive("click-outside", vClickOutside)
  .mount("#app")
