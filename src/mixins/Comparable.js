import effects from "../data/effects.json"

export default {
  methods: {
    comparisonClass(name, value) {
      const classObj = {}
      const units = this.$store.state.units
      const unitCount = Object.keys(units).length
      if (unitCount <= 1) {
        return classObj
      }
      const values = Object.values(units).reduce((acc, unit) => {
        if (name in unit) {
          acc.push(unit[name])
        }
        return acc
      }, [])
      const max = Math.max(...values)
      const min = Math.min(...values)
      if (min === max) {
        if (values.length === 1) {
          classObj["is-positive"] = true
        }
        return classObj
      }

      const lowerIsBetter = effects[name].lowerIsBetter !== undefined

      if (max === value) {
        classObj[lowerIsBetter ? "is-negative" : "is-positive"] = true
      } else if (min === value) {
        classObj[lowerIsBetter ? "is-positive" : "is-negative"] = true
      } else if (unitCount > 2) {
        classObj["is-neutral"] = true
      }
      return classObj
    }
  }
}
