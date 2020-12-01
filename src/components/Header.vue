<template>
  <header
    class="header is-flex is-flex-direction-row-reverse has-text-shadow mb-3"
  >
    <div class="p-3 is-flex controls">
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
  position: sticky;
  right: 0;
  justify-content: space-between;
  white-space: nowrap;
  flex-wrap: wrap;
  align-self: flex-end;
}
</style>
