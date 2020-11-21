import { getTechtree, getEquipments, downloadImage } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import { convertEffects } from "../effects.js"
import { convertIconName, findByAttribute, convertMarkup } from "../utils.js"

export async function buildUpgrades() {
  console.log("Building upgrades...")
  const equipments = await getEquipments()

  let results = []
  for (let i = 0; i < equipments.length; i++) {
    const e = equipments[i]
    const upgrades = await convertEquipmentToUpgrades(e)

    results = results.concat(upgrades)
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
          results.push(upgrade)
        }
      }
    }
  }

  return results
}

async function convertUpgrade(tech) {
  if (!tech.Effects) {
    return undefined
  }

  let techEffects = tech.Effects.Effect
  if (!Array.isArray(techEffects)) {
    techEffects = [techEffects]
  }
  const effects = convertEffects(techEffects)
  if (!effects.length) {
    return undefined
  }

  const icon = tech.Icon.replace(/\\/g, "/").toLowerCase()
  if (icon == "userinterface/icons/techs/greektrireme64_ua") {
    console.log(tech)
  }
  const iconDst = convertIconName(icon)
  await downloadImage(
    icon + ".png",
    "../src/assets/upgrades/" + iconDst + ".png"
  )
  return {
    id: tech.name,
    name: findLang(stringtablex, tech.DisplayNameID),
    description: formatUpgradeDescription(tech.RolloverTextID),
    icon: iconDst,
    cost: convertUpgradeCost(tech),
    effects: effects
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
    for (let i = 0; i < tech.Cost.length; i++) {
      const c = tech.Cost[i]
      const resource =
        c.resourcetype.charAt(0).toUpperCase() + c.resourcetype.slice(1)

      res["Cost" + resource] = c.quantity
    }
  }
  return res
}
