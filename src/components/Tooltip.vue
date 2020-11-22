<template>
  <div class="tooltip" :style="'top:' + y + 'px; left:' + x + 'px;'">
    <slot />
  </div>
</template>

<script>
export default {
  name: "Tooltip",
  props: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  }
}
</script>
