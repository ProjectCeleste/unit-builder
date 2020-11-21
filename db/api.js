const API_URL = "https://api.projectceleste.com/gamedb"
const IMAGES_URL = "https://images.projectceleste.com/Art/"

import axios from "axios"
import fs from "fs"
import https from "https"
import xmlParser from "fast-xml-parser"

axios.defaults.baseURL = API_URL

const cache = {}
const xmlOptions = {
  attributeNamePrefix: "",
  attrNodeName: false,
  textNodeName: "text",
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: true,
  parseNodeValue: true,
  parseAttributeValue: true,
  trimValues: true,
  cdataTagName: "__cdata", //default is 'false'
  cdataPositionChar: "\\c",
  localeRange: "", //To support non english character in tag/attribute values.
  parseTrueNumberOnly: false
}

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

export async function getTechtree() {
  if (!cache["/techtree"]) {
    console.log("GET techtree")
    cache["/techtree"] = xmlParser.parse(
      fs.readFileSync("./techtreex.xml").toString(),
      xmlOptions
    ).TechTree.Tech
  }
  return cache["/techtree"]
}

export async function getReforgeBlacklist() {
  if (!cache["/reforgeblacklist"]) {
    console.log("GET reforgeblacklist")
    cache["/reforgeblacklist"] = xmlParser.parse(
      fs.readFileSync("./ReforgeItemBlacklist.xml").toString(),
      xmlOptions
    ).ReforgeItemBlacklist.ReforgeBlacklistTrait
  }
  return cache["/reforgeblacklist"]
}

export async function getEquipments() {
  return await get("/equipments")
}

export async function getGear() {
  return await get("/traits")
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
