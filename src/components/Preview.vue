<template>
  <div class="preview p-1">
    <div class="is-flex mb-2">
      <Icon :sprite="type" :name="item.icon" :title="item.name" class="mr-2" />
      <div class="is-flex is-flex-direction-column">
        <span class="title is-size-6 mb-2">{{ item.name }}</span>
        <div v-if="item.cost" class="is-flex is-flex-direction-row is-size-7">
          <CostStats :cost="item.cost" />
        </div>
      </div>
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
    <div v-else-if="type === 'upgrades'" class="is-size-6-5">
      <p class="mt-1 mb-2" v-html="item.description.text" />
      <ul v-if="item.description.effects.length">
        <li
          v-for="(effect, index) in item.description.effects"
          :key="index"
          v-html="effect"
        />
      </ul>
      <p class="is-flex is-flex-direction-row mt-2">
        <span class="is-flex-grow-1">Research time:</span>
        <span>{{ item.time }}s</span>
        <Icon
          sprite="icons"
          name="BuildPoints"
          class="ml-1 is-align-self-center"
          size="xs"
        />
      </p>
    </div>
    <div v-else class="is-positive">
      {{ item.description }}
    </div>
  </div>
</template>

<script>
import Icon from "./Icon.vue"
import CostStats from "./CostStats.vue"
import effects from "../data/effects.json"
import { med, min, max, toDisplay } from "../stats.js"

export default {
  name: "Preview",
  components: { Icon, CostStats },
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
  background-color: $tooltip-background-color;
  white-space: normal;
  word-break: keep-all;

  .icon {
    border-radius: $border-radius;
  }

  .title {
    word-break: keep-all !important;
  }

  .preview-effects-container {
    display: table;
    word-break: keep-all;
    width: 100%;

    & > * {
      display: table-row;

      & > * {
        display: table-cell;
        vertical-align: middle;

        &:not(:first-child) {
          width: 1px;
        }
      }
    }
  }
}
</style>
