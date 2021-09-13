import { getGear, getReforgeBlacklist, downloadImage, getVendors} from "../api.js"
import { stringtablex, findLang } from "../lang.js"
import { convertEffects, duplicateEffects } from "../effects.js"
import { convertIconName, convertRarity } from "../utils.js"

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

  return { front: results, server: buildGearForServer(results) }
}

function buildGearForServer(gear) {
  const results = {}
  for (let type in gear) {
    for (let g of gear[type]) {
      results[g.id] = g.name
    }
  }
  return results
}

async function convertGear(gear) {
  const reforgeBlacklist = await getReforgeBlacklist()
  
  const vendorsList = await getVendors()

  const fixedItemsVendor = []

  for (let  i= 0; i < vendorsList.length; i++) { 
    const vendorListItems = vendorsList[i].itemsets.itemset.items.item

    for (let  j= 0; j < vendorListItems.length; j++) {
      const vendorListItem = vendorListItems[j]

        const vendorListItemPurchase = vendorListItem.purchase


        const vendorListItemPurchaseTraits = vendorListItemPurchase.trait
        
        for (const k in vendorListItemPurchaseTraits) {
          switch (k){
            case "id":
              fixedItemsVendor.push(vendorListItemPurchaseTraits[k])

          }


        }
    }
  } 

  const icon = gear.icon.replace(/\\/g, "/").toLowerCase()
  const iconDst = convertIconName(icon + "_" + gear.traittype.toLowerCase())
  await downloadImage(icon + ".png", "../src/assets/gear/" + iconDst + ".png")
  const effects = await convertEffects(gear.effects.effect)
  return {
    id: gear.name,
    name: findLang(stringtablex, gear.displaynameid),
    icon: iconDst,
    levels: gear.itemlevels,
    rarity: convertRarity(gear.rarity),
    effects: effects.filter(duplicateEffects),
    fixed:
      gear.event !== undefined || reforgeBlacklist.some(g => g === gear.name) || fixedItemsVendor.some(v => v === gear.name)
  }
}

function includeGear(gear) {
  return (
    !gear.traittype.includes("Vanity") &&
    gear.itemlevels.length &&
    gear.itemlevels[0] != 0
  )
}


