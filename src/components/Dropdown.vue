<template>
  <div class="dropdown is-flex is-flex-direction-column">
    <slot name="header" />
    <Searchbar v-model="search" />
    <div
      ref="contents"
      class="dropdown-contents is-flex is-flex-direction-column"
    >
      <div
        v-for="elem in actualContents"
        :key="elem.id"
        class="dropdown-element is-flex"
        :title="elem.name"
        @click="onSelect(elem)"
      >
        <Icon class="mr-2" :sprite="sprite" :name="elem.icon" :small="true" />
        <span>{{ elem.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Searchbar from "./Searchbar.vue"
import Icon from "./Icon.vue"

export default {
  name: "Dropdown",
  components: { Searchbar, Icon },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { name: "None", icon: "32" }
      }
    },
    sprite: { type: String, required: true },
    contents: { type: Array, default: () => [] }
  },
  emits: ["selected", "update:modelValue"],
  data() {
    return {
      search: ""
    }
  },
  computed: {
    actualContents() {
      return this.search
        ? this.contents.filter(elem =>
            elem.name.toLowerCase().includes(this.search.toLowerCase())
          )
        : this.contents
    }
  },
  watch: {
    search() {
      this.resetContentsScroll()
    }
  },
  methods: {
    onSelect(elem) {
      this.$emit("selected", elem)
      this.$emit("update:modelValue", elem)
    },
    resetContentsScroll() {
      if (this.$refs.contents) {
        this.$refs.contents.scrollTo(0, 0)
      }
    }
  }
}
</script>

<style lang="scss">
.dropdown {
  position: absolute;
  min-width: 100%;
  max-width: 200px;
  white-space: nowrap;
  z-index: 10;
  background-color: #fff;

  .dropdown-element {
    line-height: 32px;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:hover {
      cursor: pointer;
    }
  }

  .dropdown-contents {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 160px;

    scrollbar-color: hsla(0, 0%, 100%, 0.3) #192b33b3; // TODO use var color
    scrollbar-width: auto;
  }
}
</style>
