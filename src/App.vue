<template>
  <Header
    ref="header"
    class="mb-2"
    :can-add-unit="canAddUnit"
    :share-visible="shareVisible"
    @unitAdded="onUnitAdded"
    @shareClicked="postBuild()"
  />
  <div class="my-1 is-flex is-flex-direction-row is-flex-grow-1">
    <Unit
      v-for="(unit, i) in units"
      :key="i"
      v-model="units[i]"
      :unit-id="i"
      :show-delete="Object.keys(units).length > 1"
      @unitDeleted="onUnitDeleted(i)"
    />
  </div>
  <LegalNotice class="mt-3" />
  <transition name="slide-in-left">
    <Button
      v-if="updateVisible"
      icon="update"
      text="Update available!"
      tooltip="Click to update"
      class="update-button"
      @click="onUpdateClicked"
    />
  </transition>
</template>

<script>
import Unit from "./components/Unit.vue"
import LegalNotice from "./components/LegalNotice.vue"
import Header from "./components/Header.vue"
import Button from "./components/Button.vue"
import clonedeep from "lodash.clonedeep"

const MAX_UNITS = 10

export default {
  name: "App",
  components: { Unit, LegalNotice, Header, Button },
  data() {
    return {
      updateVisible: false,
      shareVisible: true,
      refreshing: false,
      registration: undefined,
      units: {},
      uid: 0
    }
  },
  computed: {
    unitCount() {
      return Object.keys(this.units).length
    },
    canAddUnit() {
      return this.unitCount < MAX_UNITS
    }
  },
  created() {
    document.addEventListener("swUpdated", this.showUpdateButton, {
      once: true
    })
    document.addEventListener("swOffline", this.hideShareButton, {
      once: true
    })
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.refreshing) return
        this.refreshing = true
        window.location.reload()
      })
    }
  },
  mounted() {
    const build = this.getUrlParameter("build")
    if (build) {
      this.fetchBuild(build)
    } else if (!Object.keys(this.units).length) {
      this.units[this.uid++] = {}
    }
  },
  unmounted() {
    document.removeEventListener("swUpdated", this.showUpdateButton)
    document.removeEventListener("swOffline", this.hideShareButton)
  },
  methods: {
    showUpdateButton(registration) {
      this.updateVisible = true
      this.registration = registration.detail
    },
    hideShareButton() {
      this.shareVisible = false
    },
    onUpdateClicked() {
      if (this.refreshing) {
        return
      }
      this.updateVisible = false
      // Protect against missing registration.waiting.
      if (!this.registration || !this.registration.waiting) {
        return
      }
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" })
    },
    onUnitAdded() {
      if (this.unitCount < MAX_UNITS) {
        this.units[this.uid++] = clonedeep(
          this.units[Math.max(...Object.keys(this.units))]
        )
      }
    },
    onUnitDeleted(index) {
      delete this.units[index]
      this.$store.commit("deleteUnit", index)
    },
    getUrlParameter(param) {
      const url = new URL(window.location)
      const raw = url.searchParams.get(param)
      return raw
    },
    buildURL(buildID) {
      const url = window.location.href
      const baseURL = url.substring(0, url.indexOf("?"))
      return buildID ? baseURL + "?build=" + buildID : baseURL
    },
    setURL(buildID) {
      const url = this.buildURL(buildID)
      window.history.pushState({}, "Unit Builder - Age of Empires Online", url)
      return url
    },
    postBuild() {
      const http = new XMLHttpRequest()
      http.open("POST", "builds", true)
      http.setRequestHeader("Content-type", "application/json")

      http.onreadystatechange = () => {
        if (http.readyState == 4 && http.status == 200) {
          const url = this.setURL(http.responseText)
          this.setClipboard(url)
        }
      }
      http.send(JSON.stringify(this.units))
    },
    setClipboard(url) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.$refs.header.showClipboardNotification()
        })
        .catch(console.err)
    },
    fetchBuild(id) {
      const http = new XMLHttpRequest()
      http.open("GET", "builds/" + id, true)

      http.onreadystatechange = () => {
        if (http.readyState == 4) {
          if (http.status == 200) {
            try {
              this.units = JSON.parse(http.responseText)
              this.uid = Math.max(...Object.keys(this.units)) + 1
            } catch (e) {
              console.error(e)
              this.onFetchBuildError()
            }
          } else {
            this.onFetchBuildError()
          }
        }
      }
      http.send()
    },
    onFetchBuildError() {
      this.units = {}
      this.units[this.uid++] = {}
      this.setURL(undefined)
    }
  }
}
</script>

<style lang="scss">
html {
  background-position: top, center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-color: $body-background-color;
  background-image: url("~@/assets/background.webp");

  min-height: 100vh;
}

#app {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: min-content;
  min-width: 100%;
  margin: auto;

  .update-button {
    position: fixed;
    left: 0.75rem;
    bottom: 0.75rem;
    box-shadow: 0 2px 4px -1px rgba(25, 43, 51, 0.2),
      0 4px 5px 0 rgba(25, 43, 51, 0.14), 0 1px 10px 0 rgba(25, 43, 51, 0.12);
  }
}

@media screen and (min-width: $tablet) {
  html {
    background-size: cover;
  }

  #app .update-button {
    top: 0.75rem;
    bottom: auto;
  }
}
</style>
