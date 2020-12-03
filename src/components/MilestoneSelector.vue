<template>
  <div
    v-if="Object.keys(milestoneValues).length"
    class="milestone-selector is-flex is-flex-direction-column is-relative"
  >
    <div class="is-flex is-flex-direction-row is-justify-content-center">
      <Milestone
        v-for="(tier, i) in civMilestones"
        :key="i"
        v-model="milestoneValues[civ][i]"
        :options="tier"
      />
    </div>
    <hr class="my-2" />
    <div class="is-flex is-flex-direction-row is-justify-content-center">
      <Milestone
        v-for="(options, altCiv) in altMilestones"
        :key="altCiv"
        v-model="milestoneValues[altCiv][0]"
        :options="options"
        :civ="altCiv"
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
    },
    altMilestones() {
      const res = {}
      Object.keys(Milestones)
        .filter(c => c !== this.civ)
        .forEach(c => {
          const options = []
          options.push({
            id: "0_none",
            name: "None",
            icon: "none",
            effects: []
          })
          Milestones[c].forEach(tier => {
            tier
              .filter(m => !m.id.endsWith("_none"))
              .forEach(m => options.push(m))
          })
          res[c] = options
        })
      return res
    }
  },
  watch: {
    modelValue: {
      handler(val) {
        this.onActivate()
        if (Object.keys(val).length) {
          this.milestoneValues = val
        }
      }
    },
    civ() {
      for (let key in this.milestoneValues) {
        this.milestoneValues[key] = []
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
