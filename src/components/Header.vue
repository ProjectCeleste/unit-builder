<template>
  <header
    class="header is-flex is-flex-direction-row-reverse has-text-shadow mb-3"
  >
    <div class="pt-3 px-2 is-flex controls">
      <div v-if="shareVisible" class="px-1 is-relative">
        <Button
          icon="share"
          text="Share"
          tooltip="Share"
          @click="$emit('share-clicked')"
        />
        <transition name="fade">
          <span
            v-if="clipboardNotificationVisible"
            class="has-text-shadow is-bold clipboard-notification"
          >
            Copied to clipboard!
          </span>
        </transition>
      </div>
      <div v-if="canAddUnit" class="px-1">
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
  props: {
    canAddUnit: { type: Boolean, default: true },
    shareVisible: { type: Boolean, default: true }
  },
  emits: ["unit-added", "share-clicked"],
  data() {
    return {
      clipboardNotificationVisible: false
    }
  },
  methods: {
    showClipboardNotification() {
      this.clipboardNotificationVisible = true
      setTimeout(() => {
        this.clipboardNotificationVisible = false
      }, 1000)
    }
  }
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

  .clipboard-notification {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
    -webkit-text-stroke: 1px darken($color-positive, 15%);
    -webkit-text-fill-color: $color-positive;
  }
}
</style>
