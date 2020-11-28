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

export function upgradeAppliesToUnit(u, unit) {
  for (let i = 0; i < u.effects.length; i++) {
    const e = u.effects[i]
    if (effectAppliesToUnit(e, unit)) {
      return true
    }
  }
  return false
}

export function effectAppliesToUnit(e, unit) {
  const isTarget = unit.id === e.target || unit.types.includes(e.target)
  if (isTarget) {
    if (e.type === "MaximumRangeConvert") {
      return (
        unit.stats.ConvertStandardConvertable !== undefined ||
        unit.stats.ChaosStandardConvertable !== undefined
      )
    } else if (e.type === "DamageRangedAttack") {
      return unit.stats.DamageRanged !== undefined
    } else if (e.type === "DamageMeleeAttack") {
      return (
        unit.stats.DamageHand !== undefined ||
        unit.stats.DamageCavalry !== undefined
      )
    } else if (e.type.startsWith("Gather")) {
      return Object.keys(unit.stats).includes(e.type)
    } else if (e.type.startsWith("Yield")) {
      const resource = e.type.substring("Yield".length)
      return Object.keys(unit.stats).includes(`Gather${resource}`)
    }
  }

  return isTarget
}
