<template>
  <div class="milestone-selector is-flex is-flex-direction-column is-relative">
    <div
      v-if="Object.keys(milestoneValues).length"
      class="is-flex is-flex-direction-row is-justify-content-center"
    >
      <Milestone
        v-for="(age, i) in civMilestones"
        :key="i"
        v-model="milestoneValues[civ][i]"
        :options="age"
      />
    </div>
  </div>
</template>

<script>
import Milestone from "./Milestone.vue"
import Milestones from "../data/milestones.json"
import Civs from "../data/civs.json"

export default {
  name: "MilestoneSelector",
  components: { Milestone },
  props: {
    modelValue: {
      type: Object,
      default() {
        return {}
      }
    },
    civ: { type: String, required: true }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      milestoneValues: {}
    }
  },
  computed: {
    civMilestones() {
      return Milestones[this.civ]
    }
  },
  watch: {
    modelValue(val) {
      this.onActivate()
      if (Object.keys(val).length) {
        this.milestoneValues = val
      }
    },
    milestoneValues: {
      deep: true,
      handler(val) {
        this.$emit("update:modelValue", val)
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
      if (!Object.keys(this.modelValue).length) {
        const values = {}
        Civs.forEach(c => {
          values[c] = []
        })
        this.$emit("update:modelValue", values)
      }
    }
  }
}
</script>

<style lang="scss"></style>
