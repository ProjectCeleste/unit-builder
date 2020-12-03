<template>
  <div
    v-click-outside="onClickOutside"
    class="milestone mx-1"
    @click="pickerOpen = !pickerOpen"
  >
    <div class="is-relative">
      <Icon
        v-if="selectedOption.id !== undefined"
        sprite="milestones"
        :name="selectedOption.icon"
        :title="selectedOption.name"
        size="md"
        class="is-align-self-center"
      />
      <Icon
        v-if="civ"
        sprite="icons"
        :name="civ"
        :title="civ.charAt(0).toUpperCase() + civ.slice(1)"
        size="vsm"
        class="milestone-civ-icon"
      />
    </div>

    <keep-alive>
      <Dropdown
        v-if="pickerOpen"
        :contents="options"
        sprite="milestones"
        @selected="onPick"
      />
    </keep-alive>
  </div>
</template>

<script>
import Icon from "./Icon.vue"
import Dropdown from "./Dropdown.vue"

export default {
  name: "Milestone",
  components: { Icon, Dropdown },
  props: {
    modelValue: {
      type: Object,
      default() {
        return {}
      }
    },
    options: { type: Array, required: true },
    civ: { type: String, default: undefined }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      pickerOpen: false,
      selectedOption: { icon: "none", name: "None" }
    }
  },
  watch: {
    modelValue() {
      this.onActivate()
      if (this.modelValue.id !== undefined) {
        this.selectedOption = this.options.find(
          o => o.id === this.modelValue.id
        )
      }
    }
  },
  activated() {
    this.onActivate()
  },
  mounted() {
    this.onActivate()
  },
  methods: {
    onActivate() {
      if (this.modelValue.id === undefined) {
        this.onPick(this.options[0])
      }
    },
    onClickOutside() {
      if (this.pickerOpen) {
        this.pickerOpen = false
      }
    },
    onPick(option) {
      this.$emit("update:modelValue", {
        id: option.id,
        effects: option.effects
      })
    }
  }
}
</script>

<style lang="scss">
.milestone {
  &:hover {
    cursor: pointer;
  }
}

.milestone-civ-icon {
  position: absolute !important;
  bottom: 0;
  right: 0;
}

.milestone-picker {
  background-color: $tooltip-background-color;
}

.milestone-option {
  &:hover {
    cursor: pointer;
    background-color: $tooltip-item-background-color-hover;
  }
}
</style>
