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

      const converted = await convertGear(g)
      results[g.traittype].push(converted)
    }
  }

  for (let type in results) {
    results[type] = results[type].reverse()
    results[type].sort((a, b) =>
      a.rarity > b.rarity ? -1 : a.rarity == b.rarity ? 0 : 1
    )

    results[type].unshift({
      id: type + "_none",
      name: "None",
      icon: "32", // TODO slot icon,
      levels: [],
      rarity: 0,
      effects: []
    })
  }

  return results
}

async function convertGear(gear) {
  const icon = gear.icon.replace(/\\/g, "/").toLowerCase()
  await downloadImage(icon + ".png", "../src/assets/img/art/" + icon + ".png") //TODO gulp sprite and webp
  return {
    id: gear.name,
    name: findLang(stringtablex, gear.displaynameid),
    icon: icon,
    levels: gear.itemlevels,
    rarity: convertRarity(gear),
    effects: convertEffects(gear)
  }
}

function convertRarity(gear) {
  switch (gear.rarity) {
    case "common":
      return 0
    case "uncommon":
      return 1
    case "rare":
      return 2
    case "epic":
      return 3
    case "legendary":
      return 4
    default:
      return 0
  }
}

function convertEffects(gear) {
  const effects = gear.effects.effect
  const res = []
  for (let i = 0; i < effects.length; i++) {
    const e = effects[i]
    // TODO WorkRate
    // TODO cost using resource="Food"
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
