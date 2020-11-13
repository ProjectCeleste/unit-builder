import { buildGear } from "./gear/build.js"
import { fetchLang } from "./lang.js"
import { buildUnits } from "./units/build.js"
import { saveFile } from "./utils.js"
import { getEffects } from "./effects.js"

const DB_PATH = "../src/data/"

async function generate() {
  await fetchLang()
  const units = await buildUnits()
  saveFile(DB_PATH + "units.json", units)

  const gear = await buildGear()
  saveFile(DB_PATH + "gear.json", gear)
  saveFile(DB_PATH + "effects.json", getEffects())
}

generate()
