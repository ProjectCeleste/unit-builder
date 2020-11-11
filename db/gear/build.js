import { getGear, downloadImage } from "../api.js"
import { stringtablex, findLang } from "../lang.js"

export async function buildGear() {
  console.log("Building gear...")
  const gear = await getGear()

  const results = {}
  for (let i = 0; i < gear.length; i++) {
    const g = gear[i]
    if (includeGear(g)) {
      if (!results[g.traittype]) {
        results[g.traittype] = []
      }

      const converted = convertGear(g)
      results[g.traittype].push(converted)
    }
  }

  return results
}

function convertGear(gear) {
  const icon = gear.icon.replace(/\\/g, "/")
  downloadImage(icon + ".png", "../src/assets/img/Art/" + icon + ".png") //TODO gulp sprite and webp
  return {
    id: gear.name,
    name: findLang(stringtablex, gear.displaynameid),
    icon: icon,
    levels: gear.itemlevels,
    effects: convertEffects(gear)
  }
}

function convertEffects(gear) {
  const effects = gear.effects.effect
  const res = []
  for (let i = 0; i < effects.length; i++) {
    const e = effects[i]
    res.push({
      type: e.subtype,
      visible: e.visible,
      absolute: e.relativity === "Absolute", // TODO relativity == "Assign" is always when subtype is ActionEnable
      positive: e.bonus,
      amount: e.amount,
      scaling: e.scaling
    })
  }

  return res
}

function includeGear(gear) {
  return !gear.traittype.includes("Vanity")
}
