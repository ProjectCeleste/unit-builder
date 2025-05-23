import { getAdvisors, downloadImage, getTechtree } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import {
  findByAttribute,
  convertRarity,
  convertIconName,
  max
} from "../utils.js"
import { convertEffects, duplicateEffects } from "../effects.js"

export async function buildAdvisors() {
  console.log("Building advisors...")
  const advisors = await getAdvisors()

  const results = [[], [], [], []]
  for (let i = 0; i < advisors.length; i++) {
    const a = advisors[i]
    if (includeAdvisor(a)) {
      const converted = await convertAdvisor(a)
      const existing = findByAttribute(results[a.age], "name", converted.name)
      if (existing) {
        existing.rarities = existing.rarities.concat(converted.rarities)
      } else {
        const iconDst = convertIconName(converted.icon)
        await downloadImage(
          converted.icon + ".png",
          "../src/assets/advisors/" + iconDst + ".png"
        )
        converted.icon = iconDst
        results[a.age].push(converted)
      }
    }
  }

  for (let age = 0; age < results.length; age++) {
    results[age] = results[age].reverse()
    results[age].sort((a, b) => {
      const aMax = max(a.rarities, "rarity")
      const bMax = max(b.rarities, "rarity")
      return aMax > bMax ? -1 : aMax === bMax ? 0 : 1
    })

    results[age].unshift({
      id: age + "_none",
      name: "None",
      icon: "none_" + age,
      rarities: [{ rarity: 0, effects: [] }]
    })
  }

  return results
}

async function convertAdvisor(a) {
  const techtree = await getTechtree()
  const advisor = {
    id: a.name,
    name: findLang(stringtablex, a.displaynameid),
    icon: a.icon.replace(/\\/g, "/").toLowerCase(),
    civ: convertCivilization(a),
    rarities: []
  }

  const tech = findByAttribute(techtree, "name", a.techs.tech)
  if (!tech) {
    return undefined
  }

  let effects = await convertEffects(tech.Effects.effect, advisor.civ, true)
  /*
  if (a.name === "Leucon_C_I") {
    effects.push({"type":"BuildWatchPost","absolute":false,"amount":1.55,"target":"UnitTypeScout1"})
  }

  if (a.name === "Leucon_U_I") {
    effects.push({"type":"BuildWatchPost","absolute":false,"amount":1.70,"target":"UnitTypeScout1"})
  }

  if (a.name === "Leucon_R_I") {
    effects.push({"type":"BuildWatchPost","absolute":false,"amount":1.85,"target":"UnitTypeScout1"})
  }

  if (a.name === "Leucon_E_I") {
    effects.push({"type":"BuildWatchPost","absolute":false,"amount":2,"target":"UnitTypeScout1"})
  }
  */

  advisor.rarities.push({
    description: findLang(stringtablex, a.displaydescriptionid),
    rarity: convertRarity(a.rarity),
    effects: effects.filter(duplicateEffects)
  }) 

  return advisor
}

function convertCivilization(a) {
  if (!a.civilization) {
    return undefined
  }
  return a.civilization.replace("eCivMatchingType", "").toLowerCase()
}

function includeAdvisor(advisor) {
  return advisor !== undefined && !advisor.name.endsWith("_CivReward")
}
