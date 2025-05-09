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

const extraUpgrades = []

export function addExtraUpgrade(techName, civ) {
  if (!extraUpgrades.some(u => u.techName === techName)) {
    extraUpgrades.push({ techName, civ: civ.toLowerCase() })
  }
}

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

  for (let i = 0; i < extraUpgrades.length; i++) {
    const extra = extraUpgrades[i]
    const upgrades = await convertEquipmentToUpgrades({
      civ: extra.civ,
      reward: { rank: [{ tech: extra.techName }] },
      unlocked: extra.techName === "TechTowerS" ? false : true
    })
    results[extra.civ] = results[extra.civ].concat(
      upgrades.filter(u => !results[extra.civ].some(up => up.id === u.id))
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
    const civ = equipment.civ.toLowerCase()
    for (let i = 0; i < equipment.reward.rank.length; i++) {
      const reward = equipment.reward.rank[i]
      const tech = findByAttribute(techtree, "name", reward.tech)
      if (tech && !techIgnored(tech)) {
        if(tech.name.startsWith("IndiaTechRMMonastery")) {
          for (let i = 0; i < tech.Effects.effect.length; i++) {
            //console.log(tech.Effects.effect[i].text)
            const toggleTech = findByAttribute(techtree, "name", tech.Effects.effect[i].text)
            const toggleUpgrade = await convertUpgrade(toggleTech, civ)
            results.push(toggleUpgrade)
          }
        }
        const upgrade = await convertUpgrade(tech, civ)
        if (equipment.unlocked !== undefined) {
          upgrade.unlocked = equipment.unlocked
        }
        if (includeUpgrade(upgrade)) {
          if (tech.name === "PersiaTechVillagerUnlock1") {
            results.push(upgrade)
          }    
          else if (
            tech.Prereqs &&
            tech.Prereqs.techStatus &&
            tech.Prereqs.techStatus.length &&
            !ignoredRequirements.includes(tech.Prereqs.techStatus[0].text)
          ) {
            if (!chains[civ]) {
              chains[civ] = {}
            }
            chains[civ][tech.Prereqs.techStatus[0].text] = upgrade
          } else {
            results.push(upgrade)
          }
        }
      }
    }
  }

  return results
}

async function convertUpgrade(tech, civ) {
  if (!tech || !tech.Effects) {
    return undefined
  }

  let techEffects = tech.Effects.effect
  if (!Array.isArray(techEffects)) {
    techEffects = [techEffects]
  }

  for (let i = 0; i < techEffects.length; i++) {
    const e = techEffects[i]
    if (e.type === "TechStatus" && e.status === "active") {
      const techtree = await getTechtree()
      const subTech = findByAttribute(techtree, "name", e.text)
      techEffects = subTech.Effects.effect
      if (!Array.isArray(techEffects)) {
        techEffects = [techEffects]
      }
    }
  }

  let effects = await convertEffects(techEffects, civ)
  effects = effects.filter(e => includeEffect(tech, e))
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
  /*if (tech.name === "TechPhilosophy") {
    if (effect.target === "Unit") {
      return false
    }
  }*/
  return true
}

function setChain(civ, upgrade) {
  if (upgrade.id in chains[civ]) {
    upgrade.chain = chains[civ][upgrade.id]
    setChain(civ, upgrade.chain)
  }
}

function includeUpgrade(u) {
  return (
    u !== undefined &&
    u.id !== "BabylonTechGarden_Upgrade1" &&
    u.id !== "BabylonTechGarden_Upgrade2"
  )
}

function techIgnored(tech) {
  const ignored = [
    "Ce_Ct_BldgGoldMine1",
    "PersiaTechAdvisorBahram_C",
    "PersiaTechAdvisorBahram_U",
    "PersiaTechAdvisorBahram_R",
    "PersiaTechAdvisorBahram_E",
    "Ro_Ct_UnitCenturion1",
    "Ro_Ct_UnitDecurion1",
    "Ro_Ct_UnitEngineer1",
    "In_Ct_UnitBladeChariot1"
  ]
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

      res["Cost" + resource] = c.value
    }
  }
  return res
}
