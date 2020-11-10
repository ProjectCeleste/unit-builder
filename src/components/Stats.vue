<template>
  <div class="stats-container">
    {{ JSON.stringify(base) }}
    {{ JSON.stringify(gear) }}
  </div>
</template>

<script>
// TODO find out how effects are really calculated / applied
export default {
  name: "Stats",
  props: {
    base: {
      type: Object,
      default() {
        return {}
      }
    },
    gear: {
      type: Object,
      default() {
        return {}
      }
    },
    advisors: {
      type: Object,
      default() {
        return {}
      }
    },
    milestones: {
      type: Object,
      default() {
        return {}
      }
    },
    upgrades: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>

<style lang="scss"></style>
