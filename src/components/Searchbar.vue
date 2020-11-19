<template>
  <input
    type="text"
    class="searchbar"
    placeholder="Search..."
    autocomplete="off"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  name: "Searchbar",
  props: {
    modelValue: { type: String, default: "" }
  },
  emits: ["update:modelValue"],
  activated() {
    this.focus()
  },
  methods: {
    focus() {
      this.$el.focus()
    }
  }
}
</script>

<style lang="scss">
.searchbar {
  border: none;
  border-radius: 0;
  line-height: 14px;
  padding-top: 9px;
  padding-bottom: 9px;
  padding-left: 5px;
  padding-right: 5px;
  border-bottom: 1px solid $color--border;
  width: 100%;
  background: transparent;
  color: #fff;

  &:focus {
    outline: none;
  }
}
</style>
