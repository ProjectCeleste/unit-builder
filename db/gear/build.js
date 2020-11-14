import { getGear, downloadImage } from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import { addEffect } from "../effects.js"
import { convertIconName } from "../utils.js"

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
      icon: type,
      levels: [],
      rarity: 0,
      effects: []
    })
  }

  return results
}

async function convertGear(gear) {
  const icon = gear.icon.replace(/\\/g, "/").toLowerCase()
  const iconDst = convertIconName(icon)
  await downloadImage(icon + ".png", "../src/assets/gear/" + iconDst + ".png") //TODO gulp sprite and webp
  return {
    id: gear.name,
    name: findLang(stringtablex, gear.displaynameid),
    icon: iconDst,
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
  // TODO factor this for upgrades and advisors too
  const effects = gear.effects.effect
  const res = []
  for (let i = 0; i < effects.length; i++) {
    const e = effects[i]
    let type = e.subtype
    if (type === "WorkRate") {
      switch (e.action) {
        case "Gather":
        case "AutoGather":
        case "Empower":
        case "Convert":
          if (e.unittype === "BerryBush") {
            type = e.action + "AbstractFruit"
          } else if (e.unittype === "Fish") {
            type = e.action + "AbstractFish"
          } else {
            type = e.action + e.unittype
          }
          break
        case "FishGather":
        case "Trade":
          type = e.action
          break
        case "Heal":
          type = "RateHeal"
          break
        case "SelfHeal":
          type += e.action
          break
        case "Build":
          type =
            e.unittype === "UnitTypeBldgWatchPost" ? "BuildWatchPost" : e.action
          break
      }
    } else if (type === "CarryCapacity") {
      type += e.resource.charAt(0).toUpperCase() + e.resource.slice(1)
    } else if (type === "Cost") {
      type += e.resource
    } else if (type === "DamageBonus") {
      type += e.unittype
      // TODO check if no problem with Siege and Artillery
    } else if (type === "Armor") {
      type += e.damagetype
    } else if (
      (type === "MaximumRange" && e.action !== "RangedAttack") ||
      type === "ActionEnable"
    ) {
      type += e.action
    }
    // TODO rate of fire (techtree:20931), call it "AttackSpeed"
    // TODO TargetSpeedBoostResist special case (100% instead of 1000%)
    // TODO ActionEnable (grants charge for example) should not be editable and give no stats
    res.push({
      type: type,
      visible: e.visible,
      absolute: e.relativity === "Absolute", // TODO relativity == "Assign" is always when subtype is ActionEnable
      positive: e.bonus,
      amount: e.amount,
      scaling: e.scaling
    })
  }

  for (let key in res) {
    addEffect(res[key].type)
  }
  return res
}

function includeGear(gear) {
  return !gear.traittype.includes("Vanity")
}
