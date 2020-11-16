export function med(amount, scaling, level) {
  return amount - 1 + scaling * level
}

export function max(amount, scaling, level) {
  return med(amount, scaling, level) * 1.05
}

export function min(amount, scaling, level) {
  return med(amount, scaling, level) * 0.95
}

export function toDisplay(effect, value) {
  return effect.type === "WorkRateSelfHeal"
    ? value.toFixed(2)
    : (value * 100).toFixed(2)
}
