<template>
  <div
    class="collapse is-flex is-flex-direction-column card"
    :class="{ 'is-open': open }"
  >
    <div class="card-header" @click="open = !open">
      <span class="title is-size-5 is-relative">{{ title }}</span>
    </div>
    <div :class="{ 'is-hidden': !open }">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "Collapse",
  props: {
    title: { type: String, required: true }
  },
  data() {
    return {
      open: true
    }
  }
}
</script>

<style lang="scss" scoped>
.collapse {
  .card-header {
    padding-bottom: 1rem;

    &:hover {
      cursor: pointer;
    }
  }

  .title {
    text-align: left;
    padding-left: 1.25rem;
    line-height: 28px;

    &::before {
      content: ">";
      position: absolute;
      left: 0;
      top: 0;
      line-height: 28px;
      font-weight: bold;
      font-size: 125%;
    }
  }

  &.is-open {
    .card-header {
      padding-bottom: 0;
    }
    .title::before {
      transform: rotate(90deg);
    }
  }
}
</style>
