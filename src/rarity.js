export function rarityClass(rarity) {
  const classObj = {}
  if (rarity !== undefined) {
    classObj["rarity-" + rarityName(rarity)] = true
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
