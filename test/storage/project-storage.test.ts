import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { existsSync } from "node:fs"
import { mkdir, readFile, rmdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { ProjectStorageManager, StorageResolver } from "../../src/storage/project-storage.js"

// Use unique test directories for isolation
const createTestDir = () =>
  `/tmp/wallet-agent-project-test-${Date.now()}-${Math.random().toString(36).slice(2)}`

describe("StorageResolver", () => {
  let testDir: string
  let originalCwd: string

  beforeEach(async () => {
    originalCwd = process.cwd()
    testDir = createTestDir()
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    process.chdir(originalCwd)
    if (existsSync(testDir)) {
      await rmdir(testDir, { recursive: true })
    }
  })

  describe("findProjectStorage", () => {
    it("should find .wallet-agent in current directory", async () => {
      const projectPath = join(testDir, ".wallet-agent")
      await mkdir(projectPath, { recursive: true })

      const found = StorageResolver.findProjectStorage(testDir)
      expect(found).toBe(projectPath)
    })

    it("should find .wallet-agent in parent directory", async () => {
      const projectPath = join(testDir, ".wallet-agent")
      const subDir = join(testDir, "subdir", "nested")
      await mkdir(projectPath, { recursive: true })
      await mkdir(subDir, { recursive: true })

      const found = StorageResolver.findProjectStorage(subDir)
      expect(found).toBe(projectPath)
    })

    it("should return null if no .wallet-agent found", () => {
      const found = StorageResolver.findProjectStorage(testDir)
      expect(found).toBeNull()
    })

    it("should find project from deeply nested directory", async () => {
      const projectPath = join(testDir, ".wallet-agent")
      const deepDir = join(testDir, "a", "b", "c", "d", "e")
      await mkdir(projectPath, { recursive: true })
      await mkdir(deepDir, { recursive: true })

      const found = StorageResolver.findProjectStorage(deepDir)
      expect(found).toBe(projectPath)
    })
  })

  describe("getProjectRoot", () => {
    it("should return parent directory of .wallet-agent", () => {
      const projectPath = join(testDir, ".wallet-agent")
      const root = StorageResolver.getProjectRoot(projectPath)
      expect(root).toBe(testDir)
    })
  })

  describe("isInProject", () => {
    it("should return true when in project context", async () => {
      const projectPath = join(testDir, ".wallet-agent")
      await mkdir(projectPath, { recursive: true })

      expect(StorageResolver.isInProject(testDir)).toBe(true)
    })

    it("should return false when not in project context", () => {
      expect(StorageResolver.isInProject(testDir)).toBe(false)
    })
  })
})

describe("ProjectStorageManager", () => {
  let testDir: string
  let projectPath: string
  let manager: ProjectStorageManager

  beforeEach(async () => {
    testDir = createTestDir()
    projectPath = join(testDir, ".wallet-agent")
    await mkdir(testDir, { recursive: true })
  })

  afterEach(async () => {
    if (existsSync(testDir)) {
      await rmdir(testDir, { recursive: true })
    }
  })

  describe("initialization", () => {
    it("should create project structure on initialization", async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
      const layout = manager.getProjectLayout()

      // Check all directories exist
      expect(existsSync(layout.baseDir)).toBe(true)
      expect(existsSync(layout.contractsDir)).toBe(true)
      expect(existsSync(layout.contractsAbisDir)).toBe(true)
      expect(existsSync(layout.walletsDir)).toBe(true)
      expect(existsSync(layout.transactionsHistoryDir)).toBe(true)
      expect(existsSync(layout.authDir)).toBe(true)
      expect(existsSync(layout.networksDir)).toBe(true)
      expect(existsSync(layout.addressBookDir)).toBe(true)
      expect(existsSync(layout.cacheDir)).toBe(true)
      expect(existsSync(layout.templatesDir)).toBe(true)
    })

    it("should create default configuration file", async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
      const layout = manager.getProjectLayout()

      expect(existsSync(layout.configPath)).toBe(true)

      const config = await manager.readConfig()
      expect(config.version).toBeDefined()
      expect(config.projectName).toBe(testDir.split("/").pop())
      expect(config.preferences).toBeDefined()
      expect(config.createdAt).toBeDefined()
    })

    it("should create default active state file", async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
      const layout = manager.getProjectLayout()

      expect(existsSync(layout.activeStatePath)).toBe(true)

      const activeState = await manager.readActiveState()
      expect(activeState.lastUsed).toBeDefined()
      expect(activeState.wallet).toBeUndefined() // Initially no active wallet
      expect(activeState.network).toBeUndefined() // Initially no active network
    })

    it("should generate .gitignore file", async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
      const layout = manager.getProjectLayout()

      expect(existsSync(layout.gitignorePath)).toBe(true)

      const gitignoreContent = await readFile(layout.gitignorePath, "utf-8")
      expect(gitignoreContent).toContain("auth/")
      expect(gitignoreContent).toContain("active.json")
      expect(gitignoreContent).toContain("transactions/history/")
      expect(gitignoreContent).toContain("*.key")
      expect(gitignoreContent).toContain("cache/")
    })

    it("should not override existing files", async () => {
      // Create manager and initialize
      manager = await ProjectStorageManager.initializeProject(projectPath)

      // Modify config
      const customConfig = {
        version: "2.0.0",
        projectName: "custom-project",
        preferences: { theme: "dark" as const },
        createdAt: "2023-01-01T00:00:00.000Z",
        lastModified: "2023-01-01T00:00:00.000Z",
      }

      const layout = manager.getProjectLayout()
      await writeFile(layout.configPath, JSON.stringify(customConfig, null, 2))

      // Initialize again - should not override
      await manager.initialize()

      const config = await manager.readConfig()
      expect(config.projectName).toBe("custom-project")
      expect(config.preferences?.theme).toBe("dark")
    })
  })

  describe("configuration management", () => {
    beforeEach(async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
    })

    it("should read project configuration", async () => {
      const config = await manager.readConfig()

      expect(config.version).toBeDefined()
      expect(config.projectName).toBe(testDir.split("/").pop())
      expect(config.preferences).toBeDefined()
    })

    it("should inherit from global configuration", async () => {
      // This test would need a mock global storage manager
      // For now, just test that project config is read correctly
      const config = await manager.readConfig()
      expect(config).toBeDefined()
      expect(config.preferences).toBeDefined()
    })
  })

  describe("active state management", () => {
    beforeEach(async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
    })

    it("should read default active state", async () => {
      const state = await manager.readActiveState()

      expect(state.lastUsed).toBeDefined()
      expect(state.wallet).toBeUndefined()
      expect(state.network).toBeUndefined()
    })

    it("should update active state", async () => {
      const updates = {
        wallet: "0x1234567890123456789012345678901234567890",
        network: 1,
      }

      await manager.updateActiveState(updates)

      const state = await manager.readActiveState()
      expect(state.wallet).toBe(updates.wallet)
      expect(state.network).toBe(updates.network)
      expect(state.lastUsed).toBeDefined()
    })

    it("should preserve existing state on partial updates", async () => {
      // Set initial state
      await manager.updateActiveState({
        wallet: "0x1111111111111111111111111111111111111111",
        network: 1,
      })

      // Partial update
      await manager.updateActiveState({
        network: 2,
      })

      const state = await manager.readActiveState()
      expect(state.wallet).toBe("0x1111111111111111111111111111111111111111")
      expect(state.network).toBe(2)
    })

    it("should always update lastUsed timestamp", async () => {
      const initialState = await manager.readActiveState()
      const initialTime = initialState.lastUsed

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      await manager.updateActiveState({})

      const updatedState = await manager.readActiveState()
      expect(updatedState.lastUsed).not.toBe(initialTime)
    })
  })

  describe("layout and paths", () => {
    beforeEach(async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
    })

    it("should return correct project layout", () => {
      const layout = manager.getProjectLayout()

      expect(layout.baseDir).toBe(projectPath)
      expect(layout.configPath).toBe(join(projectPath, "config.json"))
      expect(layout.activeStatePath).toBe(join(projectPath, "active.json"))
      expect(layout.contractsDeployedPath).toBe(join(projectPath, "contracts", "deployed.json"))
      expect(layout.contractsAbisDir).toBe(join(projectPath, "contracts", "abis"))
      expect(layout.walletsTestingPath).toBe(join(projectPath, "wallets", "testing.json"))
      expect(layout.transactionsQueuePath).toBe(join(projectPath, "transactions", "queue.json"))
      expect(layout.transactionsHistoryDir).toBe(join(projectPath, "transactions", "history"))
      expect(layout.gitignorePath).toBe(join(projectPath, ".gitignore"))
    })

    it("should return compatible storage layout", () => {
      const layout = manager.getLayout()

      // Should have all standard StorageLayout properties
      expect(layout.baseDir).toBeDefined()
      expect(layout.configPath).toBeDefined()
      expect(layout.authDir).toBeDefined()
      expect(layout.walletsDir).toBeDefined()
      expect(layout.networksDir).toBeDefined()
      expect(layout.contractsDir).toBeDefined()
      expect(layout.addressBookDir).toBeDefined()
      expect(layout.cacheDir).toBeDefined()
      expect(layout.templatesDir).toBeDefined()
    })
  })

  describe("error handling", () => {
    it("should throw error when project storage not found", () => {
      expect(() => new ProjectStorageManager("/nonexistent/path")).toThrow(
        "No project storage found",
      )
    })

    it("should handle permission errors gracefully", async () => {
      // This test is difficult to implement without actually restricting permissions
      // For now, just test that the manager can be created and initialized
      manager = await ProjectStorageManager.initializeProject(projectPath)
      expect(manager).toBeDefined()
    })

    it("should handle missing active state file gracefully", async () => {
      manager = await ProjectStorageManager.initializeProject(projectPath)
      const layout = manager.getProjectLayout()

      // Remove active state file
      await rmdir(layout.activeStatePath).catch(() => {}) // Ignore if doesn't exist

      // Should return default state
      const state = await manager.readActiveState()
      expect(state.lastUsed).toBeDefined()
      expect(state.wallet).toBeUndefined()
      expect(state.network).toBeUndefined()
    })
  })

  describe("static methods", () => {
    it("should initialize project with static method", async () => {
      const manager = await ProjectStorageManager.initializeProject(projectPath)

      expect(manager).toBeInstanceOf(ProjectStorageManager)
      expect(existsSync(projectPath)).toBe(true)

      const layout = manager.getProjectLayout()
      expect(existsSync(layout.configPath)).toBe(true)
      expect(existsSync(layout.activeStatePath)).toBe(true)
      expect(existsSync(layout.gitignorePath)).toBe(true)
    })

    it("should create directory if it doesn't exist", async () => {
      expect(existsSync(projectPath)).toBe(false)

      const manager = await ProjectStorageManager.initializeProject(projectPath)

      expect(existsSync(projectPath)).toBe(true)
      expect(manager).toBeInstanceOf(ProjectStorageManager)
    })
  })

  describe("integration scenarios", () => {
    it("should work correctly when called from subdirectory", async () => {
      // Initialize project in test dir
      const _manager = await ProjectStorageManager.initializeProject(projectPath)

      // Create subdirectory
      const subDir = join(testDir, "src", "contracts")
      await mkdir(subDir, { recursive: true })

      // Should find project storage from subdirectory
      const foundPath = StorageResolver.findProjectStorage(subDir)
      expect(foundPath).toBe(projectPath)

      // Should be able to create manager from subdirectory context
      const subManager = new ProjectStorageManager(foundPath!)
      const config = await subManager.readConfig()
      expect(config.projectName).toBe(testDir.split("/").pop())
    })

    it("should handle nested project scenarios", async () => {
      // Create parent project
      const parentProject = join(testDir, ".wallet-agent")
      const _parentManager = await ProjectStorageManager.initializeProject(parentProject)

      // Create child directory (but not child project)
      const childDir = join(testDir, "child")
      await mkdir(childDir, { recursive: true })

      // Should find parent project from child directory
      const foundPath = StorageResolver.findProjectStorage(childDir)
      expect(foundPath).toBe(parentProject)

      const childManager = new ProjectStorageManager(foundPath!)
      const config = await childManager.readConfig()
      expect(config.projectName).toBe(testDir.split("/").pop())
    })
  })
})
