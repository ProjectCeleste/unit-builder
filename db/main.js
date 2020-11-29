import { buildGear } from "./gear/build.js"
import { fetchLang } from "./lang.js"
import { buildUnits } from "./units/build.js"
import { saveFile } from "./utils.js"
import { getEffects } from "./effects.js"
import { buildUpgrades } from "./upgrades/build.js"
import { buildAdvisors } from "./advisors/build.js"

const DB_PATH = "../src/data/"

async function generate() {
  await fetchLang()
  const advisors = await buildAdvisors()
  saveFile(DB_PATH + "advisors.json", advisors)

  const upgrades = await buildUpgrades()
  saveFile(DB_PATH + "upgrades.json", upgrades)

  const units = await buildUnits()
  saveFile(DB_PATH + "units.json", units)

  const gear = await buildGear()
  saveFile(DB_PATH + "gear.json", gear)

  saveFile(DB_PATH + "effects.json", getEffects())
}

generate()
