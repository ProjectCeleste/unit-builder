import { getGear, getReforgeBlacklist, downloadImage } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import { convertEffects } from "../effects.js"
import { convertIconName, findByAttribute, convertRarity } from "../utils.js"

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
      a.rarity > b.rarity ? -1 : a.rarity === b.rarity ? 0 : 1
    )

    results[type].unshift({
      id: type + "_none",
      name: "None",
      icon: type,
      levels: [],
      rarity: 0,
      effects: [],
      fixed: false
    })
  }

  return results
}

async function convertGear(gear) {
  const reforgeBlacklist = await getReforgeBlacklist()
  const icon = gear.icon.replace(/\\/g, "/").toLowerCase()
  const iconDst = convertIconName(icon)
  await downloadImage(icon + ".png", "../src/assets/gear/" + iconDst + ".png")
  return {
    id: gear.name,
    name: findLang(stringtablex, gear.displaynameid),
    icon: iconDst,
    levels: gear.itemlevels,
    rarity: convertRarity(gear.rarity),
    effects: convertEffects(gear.effects.effect),
    fixed:
      gear.event !== undefined ||
      findByAttribute(reforgeBlacklist, "name", gear.name) !== undefined
  }
}

function includeGear(gear) {
  return !gear.traittype.includes("Vanity") && gear.itemlevels.length
}
