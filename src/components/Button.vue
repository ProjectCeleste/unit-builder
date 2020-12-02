<template>
  <div
    class="button is-flex is-flex-direction-row"
    :title="tooltip"
    :class="classObj"
  >
    <Icon sprite="icons" :name="icon" :size="size" />
    <span v-if="text" class="button-text">
      {{ text }}
    </span>
  </div>
</template>

<script>
import Icon from "./Icon.vue"

export default {
  name: "Button",
  components: { Icon },
  props: {
    icon: { type: String, required: true },
    tooltip: { type: String, default: undefined },
    text: { type: String, default: undefined },
    size: { type: String, default: "sm" }
  },
  computed: {
    classObj() {
      const obj = {}
      obj["button-" + this.size] = true
      return obj
    }
  }
}
</script>

<style lang="scss">
.button {
  color: white;
  border-radius: 2rem;
  background-color: $color--card-background-opaque;
  padding: #{map-get($spacing-values, "3")};

  &.button-xs {
    padding: #{map-get($spacing-values, "1")};
  }

  &.button-vsm {
    padding: #{map-get($spacing-values, "2")};
  }

  &:hover {
    cursor: pointer;
  }

  & > * {
    align-self: center;
  }

  .button-text {
    white-space: nowrap;
    overflow: hidden;
  }
}
</style>
