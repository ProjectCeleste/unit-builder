import { createStore } from "vuex"

export default createStore({
  state: {
    units: {}
  },
  mutations: {
    setUnitStats(state, { id, stats }) {
      state.units[id] = stats
    },
    deleteUnit(state, id) {
      delete state.units[id]
    }
  },
  actions: {},
  modules: {}
})
