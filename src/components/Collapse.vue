<template>
  <div
    class="collapse is-flex is-flex-direction-column is-flex-justify-flex-start"
    :class="{ 'is-open': open }"
  >
    <div>
      <span class="title is-relative" @click="open = !open">{{ title }}</span>
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
      open: false
    }
  }
}
</script>

<style lang="scss" scoped>
.collapse {
  .title {
    text-align: left;
    padding-left: 2rem;

    &::before {
      content: ">";
      position: absolute;
      left: 0;
      top: 0;
      line-height: 45px;
      font-weight: bold;
      font-size: 125%;
    }

    &:hover {
      cursor: pointer;
    }
  }

  &.is-open .title::before {
    transform: rotate(90deg);
  }
}
</style>
