<template>
  <header class="header is-flex is-flex-direction-row has-text-shadow mb-3">
    <div class="title-container is-flex is-flex-direction-row py-1 px-3">
      <a
        href="https://www.projectceleste.com"
        rel="nofollow"
        target="_blank"
        class="is-flex mr-3"
      >
        <img src="@/assets/logo_roman.webp" width="64" height="64" />
      </a>
      <h1 class="title is-align-self-center">
        Unit Builder
      </h1>
    </div>
    <div class="p-3 subtitle wip is-flex">
      <p class="is-align-self-center">
        WORK IN PROGRESS
      </p>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header"
}
</script>

<style lang="scss" scoped>
.header {
  justify-content: space-between;
  white-space: nowrap;
  flex-wrap: wrap;

  .title-container {
    background: $color--card-background;
    border-bottom-right-radius: 2rem;

    padding-right: 1.5rem !important;

    img {
      min-width: 64px;
      min-height: 64px;
    }
  }

  .wip {
    margin-left: auto;
    background: $color--card-background;
    border-bottom-left-radius: 2rem;
    padding-left: 1.5rem !important;
  }
}
</style>
