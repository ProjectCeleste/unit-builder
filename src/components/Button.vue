<template>
  <div
    class="button is-flex is-flex-direction-row"
    :title="tooltip"
    @mouseover="visible = true"
    @mouseleave="visible = false"
  >
    <Icon sprite="icons" :name="icon" size="sm" />
    <span v-if="text" :class="{ visible: visible }" class="button-text">
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
    text: { type: String, required: true }
  },
  data() {
    return {
      visible: false
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

@media screen and (min-width: $tablet) {
  .button .button-text {
    max-width: 0;
    transition: max-width 0.25s ease-in-out;

    &.visible {
      max-width: 150px;
    }
  }
}
</style>
