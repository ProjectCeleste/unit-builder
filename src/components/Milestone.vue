<template>
  <div
    v-click-outside="onClickOutside"
    class="milestone mx-1"
    @click="pickerOpen = !pickerOpen"
  >
    <Icon
      sprite="milestones"
      :name="modelValue.icon"
      :title="modelValue.name"
      size="md"
      class="is-align-self-center"
    />

    <keep-alive>
      <div v-if="pickerOpen" class="milestone-picker dropdown">
        <div class="py-2">
          <div
            v-for="option in options"
            :key="option.id"
            class="is-flex is-flex-direction-row wrap-word milestone-option p-2"
            @click="onPick(option)"
          >
            <Icon
              sprite="milestones"
              :name="option.icon"
              size="md"
              class="mr-2 is-align-self-center"
            />
            <div class="is-flex is-flex-direction-column is-align-self-center ">
              <span class="is-bold">{{ option.name }}</span>
              <span>{{ option.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </keep-alive>
  </div>
</template>

<script>
import Icon from "./Icon.vue"

export default {
  name: "Milestone",
  components: { Icon },
  props: {
    modelValue: {
      type: Object,
      default() {
        return { icon: "none", name: "None" }
      }
    },
    options: { type: Array, required: true }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      pickerOpen: false
    }
  },
  watch: {
    modelValue() {
      this.onActivate()
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
        this.$emit("update:modelValue", this.options[0])
      }
    },
    onClickOutside() {
      if (this.pickerOpen) {
        this.pickerOpen = false
      }
    },
    onPick(option) {
      this.$emit("update:modelValue", option)
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
