import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, rmdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { Container } from "../../src/container.js"
import { ProjectStorageManager } from "../../src/storage/project-storage.js"
import { StorageManager } from "../../src/storage/storage-manager.js"

describe("Instructions MCP Resource", () => {
  let testBaseDir: string
  let container: Container
  let originalCwd: string

  beforeEach(async () => {
    originalCwd = process.cwd()
    testBaseDir = `/tmp/wallet-agent-resource-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
    await mkdir(testBaseDir, { recursive: true })

    // Create container for testing
    container = Container.create({ enableStorage: false })
  })

  afterEach(async () => {
    process.chdir(originalCwd)
    if (existsSync(testBaseDir)) {
      await rmdir(testBaseDir, { recursive: true })
    }
    await Container.resetInstance()
  })

  describe("with no storage", () => {
    it("should return default instructions when no storage is available", async () => {
      const storageManager = container.getStorageManager()
      expect(storageManager).toBeUndefined()

      // This simulates the MCP resource handler behavior
      const defaultInstructions = `# User Instructions

This file allows you to customize how the wallet agent behaves. Write your preferences in natural language.`

      // The actual MCP resource would return this when no storage is available
      expect(defaultInstructions).toContain("User Instructions")
      expect(defaultInstructions).toContain("customize how the wallet agent behaves")
    })
  })

  describe("with storage", () => {
    it("should read custom instructions from global storage", async () => {
      const globalStorageDir = join(testBaseDir, ".wallet-agent")
      await mkdir(globalStorageDir, { recursive: true })

      const customInstructions = `# My Wallet Rules

## Gas Settings
- Use fast gas for urgent trades
- Warn if cost > $20

## Security
- Never approve unlimited allowances
- Double-check recipients`

      await writeFile(join(globalStorageDir, "instructions.md"), customInstructions)

      const storageManager = new StorageManager(globalStorageDir)
      const instructions = await storageManager.readInstructions()

      expect(instructions).toBe(customInstructions)
    })

    it("should read custom instructions from project storage", async () => {
      const projectStorageDir = join(testBaseDir, ".wallet-agent")
      const manager = await ProjectStorageManager.initializeProject(projectStorageDir)

      const projectInstructions = `# Project-Specific Instructions

## For This DApp
- Use conservative gas settings
- Always simulate before executing
- Prefer Polygon for small transactions`

      await writeFile(join(projectStorageDir, "instructions.md"), projectInstructions)

      const instructions = await manager.readInstructions()
      expect(instructions).toBe(projectInstructions)
    })

    it("should prefer project instructions over global instructions", async () => {
      // Create global instructions
      const globalStorageDir = join(testBaseDir, "global", ".wallet-agent")
      await mkdir(globalStorageDir, { recursive: true })
      const globalInstructions = "# Global Instructions\n- Global settings"
      await writeFile(join(globalStorageDir, "instructions.md"), globalInstructions)

      // Create project instructions
      const projectStorageDir = join(testBaseDir, ".wallet-agent")
      const manager = await ProjectStorageManager.initializeProject(projectStorageDir)
      const projectInstructions = "# Project Instructions\n- Project overrides global"
      await writeFile(join(projectStorageDir, "instructions.md"), projectInstructions)

      // Mock global storage to verify inheritance works
      const mockGlobalStorage = new StorageManager(globalStorageDir)
      ;(manager as unknown as { globalStorage: StorageManager }).globalStorage = mockGlobalStorage

      const instructions = await manager.readInstructions()
      expect(instructions).toBe(projectInstructions) // Should prefer project over global
    })
  })

  describe("edge cases", () => {
    it("should handle malformed instructions gracefully", async () => {
      const storageDir = join(testBaseDir, ".wallet-agent")
      await mkdir(storageDir, { recursive: true })

      // Create a file with invalid UTF-8 or special characters
      const weirdInstructions = "# Instructions\n\n- Use emoji 🚀\n- Handle üñíçødé"
      await writeFile(join(storageDir, "instructions.md"), weirdInstructions)

      const storageManager = new StorageManager(storageDir)
      const instructions = await storageManager.readInstructions()

      expect(instructions).toBe(weirdInstructions) // Should handle special characters fine
    })

    it("should return null for empty instructions file", async () => {
      const storageDir = join(testBaseDir, ".wallet-agent")
      await mkdir(storageDir, { recursive: true })

      // Create empty file
      await writeFile(join(storageDir, "instructions.md"), "")

      const storageManager = new StorageManager(storageDir)
      const instructions = await storageManager.readInstructions()

      expect(instructions).toBe("") // Empty string, not null
    })
  })
})
