<template>
  <header
    class="header is-flex is-flex-direction-row-reverse has-text-shadow mb-3"
  >
    <div class="p-3 subtitle is-flex">
      <Button
        icon="plus"
        text="Add unit"
        tooltip="Add unit"
        @click="$emit('unit-added')"
      />
    </div>
  </header>
</template>

<script>
import Button from "./Button.vue"

export default {
  name: "Header",
  components: { Button },
  emits: ["unit-added"]
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
}
</style>
