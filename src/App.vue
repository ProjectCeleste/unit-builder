<template>
  <Unit />
</template>

<script>
import Unit from "./components/Unit.vue"

export default {
  name: "App",
  components: { Unit }
}
</script>

<style lang="scss">
html {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-color: #488489;
  background-image: url("~@/assets/background.jpg");

  min-height: 100vh;
}

#app {
  margin-top: 60px;
}
</style>
