export function rarityClass(gear) {
  const classObj = {}
  if (gear.rarity !== undefined) {
    classObj["rarity-" + rarityName(gear.rarity)] = true
  }
  return classObj
}

export function rarityName(rarity) {
  switch (rarity) {
    case 1:
      return "uncommon"
    case 2:
      return "rare"
    case 3:
      return "epic"
    case 4:
      return "legendary"
    default:
      return "common"
  }
}
