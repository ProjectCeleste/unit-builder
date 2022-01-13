export function med(effect, level) {
  if (effect.absolute) {
    return effect.amount + effect.scaling * level
  }
  return effect.amount - 1 + effect.scaling * level
}

export function max(effect, level) {
  return med(effect, level) * 1.05
}

export function min(effect, level) {
  return med(effect, level) * 0.95
}

export function med_temp(effect, level) {
  if (effect.absolute) {
    return effect.amount + effect.scaling * level
  }
  return effect.amount + effect.scaling * level
}

export function min_temp(effect, level) {
  return (med(effect, level) - 1) * 1.05 + 1
}

export function max_temp(effect, level) {
  return (med(effect, level) - 1) * 0.95 + 1
}

export function toDisplay(effect, value) {
  return effect.type === "WorkRateSelfHeal"
    ? value.toFixed(2)
    : (value * 100).toFixed(2)
}

export function fromDisplay(effect, value) {
  let res =
    effect.type === "WorkRateSelfHeal"
      ? parseFloat(value)
      : parseFloat(value) / 100
  if (!effect.absolute) {
    res++
  }
  return res
}

export function upgradeAppliesToUnit(u, unit) {
  let appliedCount = 0
  let compensatedCount = 0
  for (let i = 0; i < u.effects.length; i++) {
    const e = u.effects[i]
    if (effectAppliesToUnit(e, unit)) {
      appliedCount++
      if (checkCompensation(u.effects, e.type, unit)) {
        compensatedCount++
      }
    }
  }
  return appliedCount > compensatedCount
}

export function effectAppliesToUnit(e, unit) {
  const target = isTarget(unit, e)
  if (target) {
    if (e.type === "MaximumRangeConvert") {
      return (
        unit.stats.ConvertStandardConvertable !== undefined ||
        unit.stats.ChaosStandardConvertable !== undefined
      )
    } else if (e.type === "DamageRangedAttack") {
      return (
        unit.stats.DamageRanged !== undefined ||
        unit.stats.DamageSiegeRangedAttack !== undefined ||
        unit.stats.DamageSiegeRangedAttack2 !== undefined
      )
    } else if (e.type === "DamageMeleeAttack") {
      return (
        unit.stats.DamageHand !== undefined ||
        unit.stats.DamageCavalry !== undefined ||
        unit.stats.DamageSiegeMeleeAttack !== undefined
      )
    } else if (e.type.startsWith("Gather")) {
      return Object.keys(unit.stats).includes(e.type)
    } else if (e.type.startsWith("Yield")) {
      const resource = e.type.substring("Yield".length)
      return Object.keys(unit.stats).includes(`Gather${resource}`)
    }
    if (
      e.type.startsWith("Convert") &&
      e.type !== "ConvertResist" &&
      unit.stats.ConvertStandardConvertable === undefined
    ) {
      return false
    }
  }

  return target
}

export function isTarget(unit, e) {
  return unit.id === e.target || unit.types.includes(e.target)
}

// checkCompensation checks if effects are compensated.
// It's not uncommon to have upgrades apply to all units and then
// apply another countering effect to compensate the upgrade and keep the stat
// neutral. (Pierce upgrade so they don't apply to siege weapons for example)
export function checkCompensation(effects, type, unit) {
  if (effects.length === 1 || type.startsWith("ActionEnable")) {
    return false
  }
  let val = 1
  for (let i = 0; i < effects.length; i++) {
    const e = effects[i]
    if (e.type !== type || !isTarget(unit, e)) {
      continue
    }
    if (e.absolute) {
      val += e.amount
    } else {
      val *= e.amount
    }
  }

  return parseFloat(val.toFixed(2)) === 1
}
