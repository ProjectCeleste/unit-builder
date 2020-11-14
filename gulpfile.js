const { series, parallel } = require("gulp")

const meta = require("./scripts/meta")
const sprites = require("./scripts/sprites")
const optimize = require("./scripts/optimize")

exports.meta = meta
exports.sprites = sprites
exports.optimize = optimize

exports.default = series(parallel(meta, sprites), parallel(optimize))
