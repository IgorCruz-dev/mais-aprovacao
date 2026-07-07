import { readdir, readFile, stat, writeFile } from "node:fs/promises"
import { join } from "node:path"

const root = process.argv[2]

if (!root) {
  console.error("Usage: node scripts/clean-vercel-prebuilt-output.mjs <vercel-output-dir>")
  process.exit(1)
}

let removed = 0

function stripEnvExamples(value) {
  if (Array.isArray(value)) {
    const next = []
    for (const item of value) {
      if (typeof item === "string" && item.endsWith(".env.example")) {
        removed += 1
        continue
      }
      next.push(stripEnvExamples(item))
    }
    return next
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (typeof value[key] === "string" && value[key].endsWith(".env.example")) {
        delete value[key]
        removed += 1
        continue
      }
      value[key] = stripEnvExamples(value[key])
    }
  }

  return value
}

async function walk(dir) {
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry)
    const info = await stat(path)

    if (info.isDirectory()) {
      await walk(path)
      continue
    }

    if (!entry.endsWith(".json")) continue

    const source = await readFile(path, "utf8")
    let json
    try {
      json = JSON.parse(source)
    } catch {
      continue
    }

    const before = removed
    stripEnvExamples(json)
    if (removed !== before) {
      await writeFile(path, `${JSON.stringify(json)}\n`)
    }
  }
}

await walk(root)
console.log(`Removed ${removed} .env.example prebuilt trace entries`)
