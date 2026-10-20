#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const PATCHES_DIR = 'patches'

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

const fail = message => {
  console.error(`${RED}✗ ${message}${RESET}`)
  process.exit(1)
}

// patch-package encodes scoped package names as "@scope+name+version.patch",
// so split on the last "+" and turn the scope separator back into "/".
export const parsePatchFileName = fileName => {
  const base = fileName.slice(0, -'.patch'.length)
  const lastPlus = base.lastIndexOf('+')

  if (lastPlus === -1) {
    throw new Error(`Cannot parse "${fileName}" (expected "<package>+<version>.patch")`)
  }

  const rawName = base.slice(0, lastPlus)
  const version = base.slice(lastPlus + 1)
  const packageName = rawName.startsWith('@') ? rawName.replace('+', '/') : rawName

  return { packageName, version }
}

const readInstalledVersion = packageName => {
  const manifestPath = join('node_modules', packageName, 'package.json')

  if (!existsSync(manifestPath)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf-8')).version
  } catch {
    return null
  }
}

export const verifyPatch = file => {
  let parsed

  try {
    parsed = parsePatchFileName(file)
  } catch (error) {
    return [error.message]
  }

  const { packageName, version: patchVersion } = parsed
  const installedVersion = readInstalledVersion(packageName)

  if (!installedVersion) {
    return [
      `package ${packageName} not installed or unreadable; patch ${file} is stale — ` +
        `reinstall deps or remove the patch`,
    ]
  }

  if (installedVersion !== patchVersion) {
    return [
      `Patch ${file} targets ${patchVersion} but ${installedVersion} is installed. ` +
        `If upstream fixed the issue, delete the patch and run: yarn patch-package ${packageName}  ` +
        `(recreate only if still needed). See docs/debt.md.`,
    ]
  }

  return []
}

const main = () => {
  if (!existsSync(PATCHES_DIR)) {
    fail(`patches directory "${PATCHES_DIR}" not found`)
  }

  const patchFiles = readdirSync(PATCHES_DIR)
    .filter(name => name.endsWith('.patch'))
    .sort()
  const errors = patchFiles.flatMap(verifyPatch)

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`${RED}✗ ${error}${RESET}`)
    }
    process.exit(1)
  }

  console.log(`${GREEN}✓ patches OK (${patchFiles.length} patch(es) verified)${RESET}`)
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url

if (isMain) {
  main()
}
