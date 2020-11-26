<template>
  <Header class="mb-2" />
  <div class="my-1 is-flex is-flex-direction-row is-flex-grow-1">
    <Unit />
  </div>
  <LegalNotice class="mt-3" />
</template>

<script>
import Unit from "./components/Unit.vue"
import LegalNotice from "./components/LegalNotice.vue"
import Header from "./components/Header.vue"

export default {
  name: "App",
  components: { Unit, LegalNotice, Header }
}
</script>

<style lang="scss">
html {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-color: #488489;
  background-image: url("~@/assets/background.webp");

  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
