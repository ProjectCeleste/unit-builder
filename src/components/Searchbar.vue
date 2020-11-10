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

<style lang="scss"></style>
