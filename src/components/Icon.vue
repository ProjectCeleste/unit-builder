<template>
  <div class="icon" :class="{ 'icon-sm': small }">
    <div :class="classObject" />
  </div>
</template>

<script>
export default {
  name: "Icon",
  props: {
    sprite: { type: String, required: true },
    name: { type: String, required: true },
    small: { type: Boolean, default: false } // TODO medium icon size
  },
  computed: {
    classObject() {
      return {
        [`sprite--${this.sprite}`]: true,
        [`sprite--${this.sprite}--${this.name}`]: true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.icon {
  display: inline-block;
  position: relative;
  width: 64px;
  min-width: 64px;
  height: 64px;
  min-height: 64px;

  & > div {
    transform-origin: top left;
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

  &.icon-sm {
    width: 32px;
    min-width: 32px;
    height: 32px;
    min-height: 32px;

    & > div:not(.sprite--icons) {
      transform: scale(0.5);
    }
  }
}
</style>
