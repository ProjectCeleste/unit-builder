import { renameSync } from "node:fs"

/**
 * Replaces the pre-production robots.txt (denies everything) with the production one.
 */
renameSync("dist/robots.prod.txt", "dist/robots.txt")
