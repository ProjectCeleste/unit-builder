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
    cache[url] = await axios.get(url)
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

export async function getTechtree() {
  return await get("/techtree") // FIXME not correct
}

export async function getEquipments() {
  return await get("/equipments")
}

export async function downloadImage(path, dest) {
  const url = IMAGES_URL + path
  if (!fs.existsSync(dest)) {
    console.log("Download image: " + url + " to " + dest)

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
              })
            } else {
              console.error("GET " + url + " returned code " + res.statusCode)
            }
          })
          .on("error", e => {
            console.error(e)
          })
      })
      .catch(console.error)
  }
}
