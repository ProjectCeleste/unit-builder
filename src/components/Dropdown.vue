<template>
  <div class="dropdown is-flex is-flex-direction-column">
    <slot name="header" />
    <Searchbar v-model="search" />
    <div class="dropdown-contents is-flex is-flex-direction-column">
      <div
        v-for="elem in actualContents"
        :key="elem.id"
        class="dropdown-element is-flex"
        @click="onSelect(elem)"
      >
        <img
          :src="require(`../assets/img/Art/${elem.icon}`)"
          class="small-img mr-2"
        />
        <span>{{ elem.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import Searchbar from "./Searchbar.vue"

export default {
  name: "Dropdown",
  components: { Searchbar },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { name: "None", icon: "32.png" }
      }
    },
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
  methods: {
    onSelect(elem) {
      this.$emit("selected", elem)
      this.$emit("update:modelValue", elem)
    }
  }
}
</script>

<style lang="scss">
.dropdown {
  position: absolute;
  width: 100%;
  // TODO min width
  z-index: 10;

  .dropdown-element {
    line-height: 32px;

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
