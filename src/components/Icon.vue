<template>
  <div class="icon" :class="sizeClassObject">
    <div :class="classObject" />
  </div>
</template>

<script>
export default {
  name: "Icon",
  props: {
    sprite: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, default: "" }
  },
  computed: {
    classObject() {
      return {
        [`sprite--${this.sprite}`]: true,
        [`sprite--${this.sprite}--${this.name}`]: true
      }
    },
    sizeClassObject() {
      const obj = {}
      if (this.size) {
        obj["icon-" + this.size] = true
      }
      return obj
    }
  }
}
</script>

<style lang="scss" scoped>
.icon {
  display: flex;
  position: relative;
  width: 64px;
  min-width: 64px;
  height: 64px;
  min-height: 64px;
  overflow: hidden;

  & > div {
    transform-origin: top left;
    align-self: auto;
    width: 64px;
    min-width: 64px;
    height: 64px;
    min-height: 64px;

    &.sprite--icons {
      width: 32px;
      min-width: 32px;
      height: 32px;
      min-height: 32px;
    }
  }

  &.icon-xs {
    width: 16px;
    min-width: 16px;
    height: 16px;
    min-height: 16px;

    & > div:not(.sprite--icons) {
      transform: scale(0.25);
    }

    & > .sprite--icons {
      transform: scale(0.5);
    }
  }

  &.icon-vsm {
    width: 24px;
    min-width: 24px;
    height: 24px;
    min-height: 24px;

    & > div:not(.sprite--icons) {
      transform: scale(0.375);
    }

    & > .sprite--icons {
      transform: scale(0.75);
    }
  }

  &.icon-sm {
    width: 32px;
    min-width: 32px;
    height: 32px;
    min-height: 32px;

    & > div:not(.sprite--icons) {
      transform: scale(0.5);
    }
  }

  &.icon-md {
    width: 40px;
    min-width: 40px;
    height: 40px;
    min-height: 40px;

    & > div:not(.sprite--icons) {
      transform: scale(0.625);
    }
  }
}
</style>
