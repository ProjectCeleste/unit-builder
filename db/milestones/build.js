import {
  downloadImage,
  getMilestones,
  getMilestonesTiers,
  getTechtree
} from "../api.js"
import { convertEffects, duplicateEffects } from "../effects.js"
import { findLang, stringtablex } from "../lang.js"
import { convertIconName, findByAttribute } from "../utils.js"

export async function buildMilestones() {
  console.log("Building milestones...")
  const tiers = await getMilestonesTiers()
  const milestones = await getMilestones()

  const res = {}

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i]
    const civ = tier.civid.toLowerCase()
    if (civ === "roman") {
      // TODO remove this
      continue
    }
    if (!res[civ]) {
      res[civ] = []
    }

    const resTier = []
    resTier.push({
      id: res[civ].length + "_none",
      name: "None",
      icon: "none",
      effects: []
    })
    for (let j = 0; j < tier.rewardids.id.length; j++) {
      const milestone = findByAttribute(milestones, "id", tier.rewardids.id[j])
      resTier.push(await convertMilestone(milestone))
    }

    res[civ].push(resTier)
  }

  return res
}

async function convertMilestone(milestone) {
  const techtree = await getTechtree()
  const tech = findByAttribute(techtree, "name", milestone.tech)

  const icon = milestone.largeicon.replace(/\\/g, "/").toLowerCase()
  const iconDst = convertIconName(icon)
  await downloadImage(
    icon + ".png",
    "../src/assets/milestones/" + iconDst + ".png"
  )

  const effects = convertEffects(tech.Effects.Effect).filter(duplicateEffects)

  return {
    id: milestone.id,
    icon: iconDst,
    name: findLang(stringtablex, tech.DisplayNameID),
    description: findLang(stringtablex, tech.RolloverTextID),
    effects: effects
  }
}
