const API_URL = "https://api.projectceleste.com/gamedb"
const IMAGES_URL = "https://images.projectceleste.com/Art/"

import axios from "axios"
import fs from "fs"
import https from "https"
import { saveFile } from "./utils.js"

axios.defaults.baseURL = API_URL

const DB_PATH = "../src/gamedb_data/"

const cache = {}

async function get(url, file) {
  if (!cache[url]) {
    console.log("GET " + url)
    const res = await axios.get(url)
    cache[url] = res.data
    saveFile(DB_PATH + file, res.data)
  }
  return cache[url]
}

export async function getStringtablex() {
  return await get("/languages/stringtablex/English", "source_stringtablexEnglish.json")
}

export async function getEquipmentStrings() {
  return await get("/languages/equipmentstrings/English", "source_equipmentstringsEnglish.json")
}

export async function getEconStrings() {
  return await get("/languages/econstrings/English", "source_econstringsEnglish.json")
}

export async function getUnits() {
  return await get("/units", "source_units.json")
}

export async function getAdvisors() {
  return await get("/advisors", "source_advisors.json")
}

export async function getTechtree() {
  const techtree = await get("/techtree", "source_techtree.json")
  return techtree.Tech
}

export async function getReforgeBlacklist() {
  return await get("/reforgeitemblacklist", "source_reforgeitemblacklist.json")
}

export async function getEquipments() {
  return await get("/equipments", "source_equipments.json")
}

export async function getGear() {
  return await get("/traits", "source_traits.json")
}

export async function getMilestonesTiers() {
  return await get("/milestones/tiers", "source_milestones_tiers.json")
}

export async function getMilestones() {
  return await get("/milestones/rewards", "source_milestones_rewards.json")
}

export async function getVendors() {
  return await get("/vendors", "source_vendors.json")
}

export async function getNuggets() {
  return await get("/nuggets", "source_nuggets.json")
}

export async function getTactics(fileName) {
  const caseExceptions = {
    "catapultShip.tactics": "CatapultShip.tactics",
    "norseLongHouse.tactics": "norseLonghouse.tactics",
    "Helepolis.tactics": "helepolis.tactics"
  }
  const tactics = await get("/tactics", "source_tactics.json")
  if (caseExceptions[fileName]) {
    fileName = caseExceptions[fileName]
  }
  return tactics[fileName]
}

export async function downloadImage(path, dest) {
  const url = IMAGES_URL + path
  if (!fs.existsSync(dest)) {
    console.log("Download image: " + url + " to " + dest)

    return new Promise((resolve, reject) => {
      fs.promises
        .mkdir(dest.substring(0, dest.lastIndexOf("/")), { recursive: true })
        .then(() => {
          https
            .get(url, res => {
              if (res.statusCode == 200) {
                const file = fs.createWriteStream(dest)
                res.on("data", d => {
                  file.write(d)
                })

                res.on("end", () => {
                  file.end()
                  resolve()
                })
              } else {
                console.error("GET " + url + " returned code " + res.statusCode)
                reject(res)
              }
            })
            .on("error", e => {
              console.error(e)
              reject(e)
            })
        })
        .catch(e => {
          console.error(e)
          reject(e)
        })
    })
  }
}
