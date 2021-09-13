const API_URL = "https://api.projectceleste.com/gamedb"
const IMAGES_URL = "https://images.projectceleste.com/Art/"

import axios from "axios"
import fs from "fs"
import https from "https"

axios.defaults.baseURL = API_URL

const cache = {}

async function get(url) {
  if (!cache[url]) {
    console.log("GET " + url)
    const res = await axios.get(url)
    cache[url] = res.data
  }
  return cache[url]
}

export async function getStringtablex() {
  return await get("/languages/stringtablex/English")
}

export async function getEquipmentStrings() {
  return await get("/languages/equipmentstrings/English")
}

export async function getEconStrings() {
  return await get("/languages/econstrings/English")
}

export async function getUnits() {
  return await get("/units")
}

export async function getAdvisors() {
  return await get("/advisors")
}

export async function getTechtree() {
  const techtree = await get("/techtree")
  return techtree.Tech
}

export async function getReforgeBlacklist() {
  return await get("/reforgeitemblacklist")
}

export async function getEquipments() {
  return await get("/equipments")
}

export async function getGear() {
  return await get("/traits")
}

export async function getMilestonesTiers() {
  return await get("/milestones/tiers")
}

export async function getMilestones() {
  return await get("/milestones/rewards")
}

export async function getVendors() {
  return await get("/vendors")
}

export async function getTactics(fileName) {
  const caseExceptions = {
    "catapultShip.tactics": "CatapultShip.tactics",
    "norseLongHouse.tactics": "norseLonghouse.tactics"
  }
  const tactics = await get("/tactics")
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
