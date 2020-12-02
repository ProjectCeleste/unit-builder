import express from "express"
import bodyParser from "body-parser"
import Keyv from "keyv"
import { v4 as uuid } from "uuid"
const app = express()
const port = process.argv[2] ? parseInt(process.argv[2]) : 8080
const keyv = new Keyv()

app.use(bodyParser.json())
app.use(express.static("./front"))

app.post("/builds", async (req, res) => {
  if (req.body && Object.keys(req.body).length) {
    const id = uuid()
    keyv.set(id, req.body, 604800000)
    // TODO maybe use sqlite?
    res.setHeader("Content-Type", "text/plain")
    res.status(200).end(id)
  } else {
    res.status(400).end()
  }
})

app.get("/builds/:b", async (req, res) => {
  const val = await keyv.get(req.params.b)
  // TODO if accept != json -> send formatted opengraph and twitter and everything
  res.setHeader("Content-Type", "application/json")
  if (val) {
    res.send(val)
  } else {
    res.status(404).end()
  }
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
