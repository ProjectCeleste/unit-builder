<template>
  <div class="preview">
    <div class="is-flex mb-2">
      <Icon :sprite="type" :name="item.icon" :title="item.name" class="mr-2" />
      <span class="title is-size-6">{{ item.name }}</span>
    </div>
    <div v-if="type === 'gear'" class="preview-effects-container is-size-6-5">
      <div
        v-for="effect in item.effects"
        :key="effect.type"
        :class="{
          'is-positive': effect.positive,
          'is-negative': !effect.positive
        }"
      >
        <span class="is-fullwidth pr-2">{{ effectName(effect) }}</span>
        <template v-if="effectType(effect) !== 'action'">
          <span v-if="item.fixed" class="has-text-right">{{
            toDisplay(
              effect,
              med(
                effect.amount,
                effect.scaling,
                item.levels[item.levels.length - 1]
              )
            )
          }}</span>
          <span v-else class="nowrap has-text-right">
            {{
              toDisplay(
                effect,
                min(
                  effect.amount,
                  effect.scaling,
                  item.levels[item.levels.length - 1]
                )
              )
            }}
            &nbsp;-&nbsp;
            {{
              toDisplay(
                effect,
                max(
                  effect.amount,
                  effect.scaling,
                  item.levels[item.levels.length - 1]
                )
              )
            }}
          </span>
          <span v-if="!effect.absolute && effect.type !== 'WorkRateSelfHeal'">
            %
          </span>
          <span v-if="effect.type === 'WorkRateSelfHeal'">/s</span>
        </template>
      </div>
    </div>
    <div v-else class="is-positive">
      {{ item.description }}
    </div>
  </div>
</template>

<script>
import Icon from "./Icon.vue"
import effects from "../data/effects.json"
import { med, min, max, toDisplay } from "../stats.js"

export default {
  name: "Preview",
  components: { Icon },
  props: {
    item: { type: Object, required: true },
    type: { type: String, default: "gear" }
  },
  methods: {
    med,
    min,
    max,
    toDisplay,
    effectName(effect) {
      return effects[effect.type].name
    },
    effectType(effect) {
      return effects[effect.type].type
    }
  }
}
</script>

<style lang="scss" scoped>
.preview {
  white-space: normal;
  word-break: keep-all;
  background: #fff;

  .title {
    word-break: keep-all !important;
  }

  .preview-effects-container {
    display: table;
    white-space: nowrap;
    width: 100%;

    & > * {
      display: table-row;

      & > * {
        display: table-cell;
        vertical-align: middle;
      }
    }
  }
}
</style>
