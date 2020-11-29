import { getAdvisors, downloadImage, getTechtree } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import {
  findByAttribute,
  convertRarity,
  convertIconName,
  max
} from "../utils.js"
import { convertEffects } from "../effects.js"

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
          "../src/assets/gear/" + iconDst + ".png"
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
      icon: "none", // TODO none icon
      effects: []
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

  advisor.rarities.push({
    description: findLang(stringtablex, a.displaydescriptionid),
    rarity: convertRarity(a.rarity),
    effects: convertEffects(tech.Effects.Effect, advisor.civ)
  })
  // TODO special cases (enable upgrade, such as Esfandiyar)
  // <Effect type="TechStatus" status="obtainable">PersiaTechAdvisorEsfandiyar_Upgrade1</Effect>
  // <Effect type="TechStatus" status="obtainable">PersiaTechAdvisorEsfandiyar_Upgrade2</Effect>
  // <Effect type="TechStatus" status="obtainable">PersiaTechAdvisorEsfandiyar_Upgrade3</Effect>

  return advisor
}

function convertCivilization(a) {
  if (!a.civilization) {
    return undefined
  }
  return a.civilization.replace("eCivMatchingType", "").toLowerCase()
}

function includeAdvisor(advisor) {
  return advisor !== undefined
}
