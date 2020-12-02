<template>
  <header
    class="header is-flex is-flex-direction-row-reverse has-text-shadow mb-3"
  >
    <div class="pt-3 px-2 is-flex controls">
      <div class="px-1">
        <Button
          icon="share"
          text="Share"
          tooltip="Share"
          @click="$emit('share-clicked')"
        />
      </div>
      <div class="px-1">
        <Button
          icon="plus"
          text="Add unit"
          tooltip="Add unit"
          @click="$emit('unit-added')"
        />
      </div>
    </div>
  </header>
</template>

<script>
import Button from "./Button.vue"

export default {
  name: "Header",
  components: { Button },
  emits: ["unit-added", "share-clicked"]
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
