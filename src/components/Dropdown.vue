<template>
  <div class="dropdown is-flex is-flex-direction-row">
    <div class="is-flex is-flex-direction-column is-flex-grow-1">
      <slot name="header" />
      <Searchbar v-model="search" />
      <div
        ref="contents"
        class="dropdown-contents is-flex is-flex-direction-column"
        @mouseleave="hoveredItem = null"
      >
        <div
          v-for="elem in actualContents"
          :key="elem.id"
          class="dropdown-element is-flex"
          :title="elem.name"
          @click="onSelect(elem)"
          @mouseover="hoveredItem = elem"
        >
          <Icon class="mr-2" :sprite="sprite" :name="elem.icon" size="sm" />
          <span>{{ elem.name }}</span>
        </div>
        <div v-if="!actualContents.length">
          No results.
        </div>
      </div>
    </div>
    <Preview v-if="preview && hoveredItem" :item="hoveredItem" />
    <!-- TODO responsiveness -->
  </div>
</template>

<script>
import Searchbar from "./Searchbar.vue"
import Preview from "./Preview.vue"
import Icon from "./Icon.vue"

export default {
  name: "Dropdown",
  components: { Searchbar, Icon, Preview },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { name: "None", icon: "Generic" }
      }
    },
    sprite: { type: String, required: true },
    preview: { type: Boolean, default: true },
    contents: { type: Array, default: () => [] }
  },
  emits: ["selected", "update:modelValue"],
  data() {
    return {
      search: "",
      hoveredItem: null
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

<style lang="scss" scoped>
.dropdown {
  width: 100%;

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
    background: #fff;

    scrollbar-color: hsla(0, 0%, 100%, 0.3) #192b33b3; // TODO use var color
    scrollbar-width: auto;
  }
}
</style>
