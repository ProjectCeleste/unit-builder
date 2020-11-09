import { createApp } from "vue"
import App from "./App.vue"
import vClickOutside from "v-click-outside"
import "./registerServiceWorker"
import store from "./store"

createApp(App)
  .use(store)
  .use(vClickOutside)
  .mount("#app")
