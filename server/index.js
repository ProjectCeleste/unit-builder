import express from "express"
import bodyParser from "body-parser"
import Keyv from "keyv"
import fs from "fs"
import { v4 as uuid } from "uuid"
const app = express()
const port = process.argv[2] ? parseInt(process.argv[2]) : 8080
const keyv = new Keyv("sqlite://build-db.sqlite")
const sixMonths = 15552000000
const units = JSON.parse(fs.readFileSync("./units.json", "utf8"))
const gear = JSON.parse(fs.readFileSync("./gear.json", "utf8"))

keyv.on("error", err => {
  console.log("DB Connection Error", err)
  process.exit(1)
})

app.use(bodyParser.json())
app.use(async (req, res, next) => {
  if (req.query.build && !req.originalUrl.startsWith("/builds")) {
    try {
      const build = await keyv.get(req.query.build)
      if (build) {
        const unit = build[Object.keys(build)[0]]
        const selection = unit.selection
        const firstUnit = selection.unit
        const civ =
          selection.civ.charAt(0).toUpperCase() + selection.civ.slice(1)
        const title = civ + " " + firstUnit.name + " - Unit Builder"
        let description = "Gear:"
        for (let key in unit.gear) {
          const gearID = unit.gear[key].selected
          if (!gearID.endsWith("_none")) {
            description += "\n- " + gear[gearID]
          }
        }

        res.setHeader("Content-Type", "text/html")
        let html = fs.readFileSync("./front/index.html", "utf8")
        html = html
          .replace(
            /<meta property="og:title" content="Unit Builder - Age of Empires Online">/g,
            `<meta property="og:title" content="${title}">`
          )
          .replace(
            /<meta property="og:description" content="Build, compare and share your Age of Empires Online units.">/g,
            `<meta property="og:description" content="${description}">`
          )
          .replace(
            /https:\/\/unitstats.projectceleste.com\/assets\/meta\/favicon-512.png/g,
            `https://images.projectceleste.com/Art/${units[firstUnit.id]}.png`
          )
        res.status(200).end(html)
        return
      }
    } catch (e) {
      console.log("ogHandler error", e)
      res.status(500).end()
      return
    }
  }

  next()
})
app.use(express.static("./front"))

app.post("/builds", async (req, res) => {
  if (req.body && Object.keys(req.body).length) {
    const id = uuid()
    keyv.set(id, req.body, sixMonths)
    res.setHeader("Content-Type", "text/plain")
    res.status(200).end(id)
  } else {
    res.status(400).end()
  }
})

app.get("/builds/:b", async (req, res) => {
  const val = await keyv.get(req.params.b)
  if (!val) {
    res.status(404).end()
    return
  }
  res.setHeader("Content-Type", "application/json")
  res.send(val)
})

function healthHandler(req, res) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate")
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, HEAD ,OPTIONS")
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Cache-Control, Origin, Authorization, Content-Length, X-Requested-With"
  )
  res.sendStatus(200)
}
app.get("/health", healthHandler)
app.options("/health", healthHandler)

app.listen(port, "0.0.0.0", () =>
  console.log(`Unit builder server listening on port ${port}!`)
)
