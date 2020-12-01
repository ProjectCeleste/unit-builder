<template>
  <Header class="mb-2" @unitAdded="onUnitAdded" />
  <div class="my-1 is-flex is-flex-direction-row is-flex-grow-1">
    <Unit
      v-for="(unit, i) in units"
      :key="unit.id"
      v-model="units[i]"
      :show-delete="units.length > 1"
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

export default {
  name: "App",
  components: { Unit, LegalNotice, Header, Button },
  data() {
    return {
      updateVisible: false,
      refreshing: false,
      registration: undefined,
      units: [],
      uid: 0
    }
  },
  mounted() {
    document.addEventListener("swUpdated", this.showUpdateButton, {
      once: true
    })
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (this.refreshing) return
        this.refreshing = true
        window.location.reload()
      })
    }

    if (!this.units.length) {
      this.units.push({ id: this.uid++ })
    }
  },
  unmounted() {
    document.removeEventListener("swUpdated", this.showUpdateButton)
  },
  methods: {
    showUpdateButton(registration) {
      this.updateVisible = true
      this.registration = registration
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
      this.registration.waiting.postMessage("skipWaiting")
    },
    onUnitAdded() {
      this.units.push({ id: this.uid++ })
    },
    onUnitDeleted(index) {
      this.units.splice(index, 1)
    }
  }
}
</script>

<style lang="scss">
html {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-color: $body-background-color;
  background-image: url("~@/assets/background.webp");

  min-height: 100vh;
}

#app {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .update-button {
    position: fixed;
    left: 20px;
    bottom: 20px;
    box-shadow: 0 2px 4px -1px rgba(25, 43, 51, 0.2),
      0 4px 5px 0 rgba(25, 43, 51, 0.14), 0 1px 10px 0 rgba(25, 43, 51, 0.12);
  }
}

@media screen and (min-width: $tablet) {
  #app .update-button {
    top: 100px;
    bottom: auto;
  }
}
</style>
