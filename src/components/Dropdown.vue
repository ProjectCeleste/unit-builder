<template>
  <div class="dropdown">
    <div class="is-flex is-flex-direction-column is-flex-grow-1 is-relative">
      <div class="dropdown-header is-flex is-flex-direction-column">
        <slot name="header" />
        <Searchbar v-model="search" />
      </div>
      <div
        ref="contents"
        class="dropdown-contents"
        @mouseleave="hoveredItem = null"
        @scroll="updateScroll"
      >
        <div
          v-for="elem in actualContents"
          :key="elem.id"
          class="dropdown-element"
          :title="elem.name"
          @click="onSelect(elem)"
          @mouseover="hoveredItem = elem"
        >
          <Icon
            class="mr-2"
            :sprite="sprite"
            :name="elem.icon"
            size="sm"
            :class="advisorRarityClass(elem)"
          />
          <span>{{ elem.name }}</span>
        </div>
        <div v-if="!actualContents.length" class="pl-1 no-result">
          No results.
        </div>
      </div>
      <Preview
        v-if="preview && hoveredItem && hoveredItem.name !== 'None'"
        :item="hoveredItem"
        :type="sprite"
        class="p-2"
      />
    </div>
  </div>
</template>

<script>
import Searchbar from "./Searchbar.vue"
import Preview from "./Preview.vue"
import Icon from "./Icon.vue"
import { rarityClass } from "../rarity.js"

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
      hoveredItem: null,
      scrollPos: 0
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
  activated() {
    this.$refs.contents.scrollTop = this.scrollPos
  },
  methods: {
    onSelect(elem) {
      this.hoveredItem = null
      this.$emit("selected", elem)
      this.$emit("update:modelValue", elem)
    },
    updateScroll() {
      this.scrollPos = this.$refs.contents.scrollTop
    },
    resetContentsScroll() {
      if (this.$refs.contents) {
        this.$refs.contents.scrollTo(0, 0)
      }
    },
    advisorRarityClass(elem) {
      if (
        this.sprite !== "advisors" ||
        elem.rarities === undefined ||
        elem.name === "None"
      ) {
        return {}
      }
      return rarityClass(elem.rarities[elem.rarities.length - 1].rarity)
    }
  }
}
</script>

<style lang="scss" scoped>
.preview {
  border-top: 1px solid $color--border;
}
</style>
