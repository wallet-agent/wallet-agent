import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, rmdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { ProjectStorageManager } from "../../src/storage/project-storage.js"
import { StorageManager } from "../../src/storage/storage-manager.js"

describe("User Instructions", () => {
  let testBaseDir: string

  beforeEach(async () => {
    testBaseDir = `/tmp/wallet-agent-instructions-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
    await mkdir(testBaseDir, { recursive: true })
  })

  afterEach(async () => {
    if (existsSync(testBaseDir)) {
      await rmdir(testBaseDir, { recursive: true })
    }
  })

  describe("StorageManager", () => {
    it("should return null when no instructions file exists", async () => {
      const storageDir = join(testBaseDir, ".wallet-agent")
      const manager = new StorageManager(storageDir)

      const instructions = await manager.readInstructions()
      expect(instructions).toBeNull()
    })

    it("should read instructions file when it exists", async () => {
      const storageDir = join(testBaseDir, ".wallet-agent")
      const manager = new StorageManager(storageDir)

      await mkdir(storageDir, { recursive: true })
      const instructionsContent = "# My Instructions\n\n- Use fast gas for DEX trades"
      await writeFile(join(storageDir, "instructions.md"), instructionsContent)

      const instructions = await manager.readInstructions()
      expect(instructions).toBe(instructionsContent)
    })

    it("should handle read errors gracefully", async () => {
      const storageDir = "/nonexistent/path"
      const manager = new StorageManager(storageDir)

      const instructions = await manager.readInstructions()
      expect(instructions).toBeNull()
    })
  })

  describe("ProjectStorageManager", () => {
    let projectPath: string
    let globalStorageDir: string

    beforeEach(() => {
      projectPath = join(testBaseDir, ".wallet-agent")
      globalStorageDir = join(testBaseDir, "global", ".wallet-agent")
    })

    it("should return project instructions when they exist", async () => {
      const manager = await ProjectStorageManager.initializeProject(projectPath)

      const projectInstructions = "# Project Instructions\n\n- Project-specific behavior"
      await writeFile(join(projectPath, "instructions.md"), projectInstructions)

      const instructions = await manager.readInstructions()
      expect(instructions).toBe(projectInstructions)
    })

    it("should fall back to global instructions when project instructions don't exist", async () => {
      // Create global storage with instructions
      await mkdir(globalStorageDir, { recursive: true })
      const globalInstructions = "# Global Instructions\n\n- Global behavior"
      await writeFile(join(globalStorageDir, "instructions.md"), globalInstructions)

      // Create project storage manager that will use the global storage for fallback
      const manager = await ProjectStorageManager.initializeProject(projectPath)

      // Mock the global storage to return our test instructions
      const originalGlobalStorage = (manager as unknown as { globalStorage: StorageManager })
        .globalStorage
      const mockGlobalStorage = new StorageManager(globalStorageDir)
      ;(manager as unknown as { globalStorage: StorageManager }).globalStorage = mockGlobalStorage

      const instructions = await manager.readInstructions()
      expect(instructions).toBe(globalInstructions)

      // Restore original
      ;(manager as unknown as { globalStorage: StorageManager }).globalStorage =
        originalGlobalStorage
    })

    it("should prefer project instructions over global instructions", async () => {
      // Create global storage with instructions
      await mkdir(globalStorageDir, { recursive: true })
      const globalInstructions = "# Global Instructions\n\n- Global behavior"
      await writeFile(join(globalStorageDir, "instructions.md"), globalInstructions)

      const manager = await ProjectStorageManager.initializeProject(projectPath)

      // Add project instructions
      const projectInstructions = "# Project Instructions\n\n- Project overrides global"
      await writeFile(join(projectPath, "instructions.md"), projectInstructions)

      // Mock the global storage
      const mockGlobalStorage = new StorageManager(globalStorageDir)
      ;(manager as unknown as { globalStorage: StorageManager }).globalStorage = mockGlobalStorage

      const instructions = await manager.readInstructions()
      expect(instructions).toBe(projectInstructions)
    })

    it("should return null when no instructions exist anywhere", async () => {
      const manager = await ProjectStorageManager.initializeProject(projectPath)

      const instructions = await manager.readInstructions()
      expect(instructions).toBeNull()
    })
  })
})
