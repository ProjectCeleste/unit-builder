<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Welcome to Your Vue.js App" />
  <collapse title="Collapse">
    <div class="columns">
      <div class="column">
        <h1 class="title">
          Test
        </h1>
      </div>
      <div class="column">
        <h2 class="subtitle">
          Test2
        </h2>
      </div>
    </div>
  </collapse>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue"
import Collapse from "./components/Collapse.vue"

export default {
  name: "App",
  components: {
    HelloWorld,
    Collapse
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
