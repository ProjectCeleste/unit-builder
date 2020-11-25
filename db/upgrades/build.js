import { getTechtree, getEquipments, downloadImage } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import { convertEffects } from "../effects.js"
import { convertIconName, findByAttribute, convertMarkup } from "../utils.js"

const chains = {}
const ignoredRequirements = [
  "EgyptCapStartCiv",
  "GreekCivOld",
  "Advisor_Aapep_R",
  "Age1",
  "PVP_NorseCapAge2"
]

export async function buildUpgrades() {
  console.log("Building upgrades...")
  const equipments = await getEquipments()

  const results = {}
  for (let i = 0; i < equipments.length; i++) {
    const e = equipments[i]
    const civ = e.civ.toLowerCase()
    const upgrades = await convertEquipmentToUpgrades(e)

    if (!results[civ]) {
      results[civ] = []
    }

    results[civ] = results[civ].concat(
      upgrades.filter(u => !results[civ].some(up => up.id === u.id))
    )
  }

  for (let civ in results) {
    for (let i = 0; i < results[civ].length; i++) {
      const u = results[civ][i]
      setChain(civ, u)
    }
  }

  return results
}

async function convertEquipmentToUpgrades(equipment) {
  const techtree = await getTechtree()
  const results = []
  if (equipment.reward) {
    for (let i = 0; i < equipment.reward.rank.length; i++) {
      const reward = equipment.reward.rank[i]
      const tech = findByAttribute(techtree, "name", reward.tech)
      if (tech && !techIgnored(tech)) {
        const upgrade = await convertUpgrade(tech)
        if (includeUpgrade(upgrade)) {
          if (
            tech.Prereqs &&
            tech.Prereqs.TechStatus &&
            !ignoredRequirements.includes(tech.Prereqs.TechStatus.text)
          ) {
            const civ = equipment.civ.toLowerCase()
            if (!chains[civ]) {
              chains[civ] = {}
            }
            chains[civ][tech.Prereqs.TechStatus.text] = upgrade
          } else {
            results.push(upgrade)
          }
        }
      }
    }
  }

  return results
}

async function convertUpgrade(tech) {
  if (!tech || !tech.Effects) {
    return undefined
  }

  let techEffects = tech.Effects.Effect
  if (!Array.isArray(techEffects)) {
    techEffects = [techEffects]
  }

  // TODO babylon garden upgrades BabylonTechGarden_Upgrade1

  for (let i = 0; i < techEffects.length; i++) {
    const e = techEffects[i]
    if (e.type === "TechStatus" && e.status === "active") {
      const techtree = await getTechtree()
      const subTech = findByAttribute(techtree, "name", e.text)
      techEffects = subTech.Effects.Effect
      if (!Array.isArray(techEffects)) {
        techEffects = [techEffects]
      }
    }
  }

  const effects = convertEffects(techEffects).filter(e =>
    includeEffect(tech, e)
  )
  if (!effects.length) {
    return undefined
  }

  const icon = tech.Icon.replace(/\\/g, "/").toLowerCase()
  const iconDst = convertIconName(icon)
  await downloadImage(
    icon + ".png",
    "../src/assets/upgrades/" + iconDst + ".png"
  )

  const upgrade = {
    id: tech.name,
    name: findLang(stringtablex, tech.DisplayNameID),
    description: formatUpgradeDescription(tech.RolloverTextID),
    icon: iconDst,
    cost: convertUpgradeCost(tech),
    effects: effects
  }

  if (tech.ResearchPoints) {
    upgrade.time = tech.ResearchPoints
  }

  return upgrade
}

function includeEffect(tech, effect) {
  if (tech.name === "TechPhilosophy") {
    if (effect.target === "Unit") {
      return false
    }
  }
  return true
}

function setChain(civ, upgrade) {
  if (upgrade.id in chains[civ]) {
    upgrade.chain = chains[civ][upgrade.id]
    setChain(civ, upgrade.chain)
  }
}

function includeUpgrade(u) {
  return u !== undefined
}

function techIgnored(tech) {
  const ignored = ["Ce_Ct_BldgGoldMine1"]
  return ignored.includes(tech.name)
}

function formatUpgradeDescription(textID) {
  const text = findLang(stringtablex, textID)
  const split = text.split("*")
  const description = convertMarkup(split[0])

  const effects = []
  for (let i = 1; i < split.length; i++) {
    effects.push(convertMarkup(split[i]))
  }

  return {
    text: description,
    effects: effects
  }
}

function convertUpgradeCost(tech) {
  const res = {}
  if (tech.Cost) {
    let cost = tech.Cost
    if (!Array.isArray(cost)) {
      cost = [cost]
    }
    for (let i = 0; i < cost.length; i++) {
      const c = cost[i]
      const resource =
        c.resourcetype.charAt(0).toUpperCase() + c.resourcetype.slice(1)

      res["Cost" + resource] = c.text
    }
  }
  return res
}
