/**
 * Project-scoped storage system
 *
 * Manages project-specific storage at ./.wallet-agent/ with inheritance from global storage
 */

import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { createLogger } from "../logger.js"
import { StorageManager } from "./storage-manager.js"
import type { GlobalConfig, StorageLayout, UserPreferences } from "./types.js"

const logger = createLogger("project-storage")

export interface ProjectConfig extends Omit<GlobalConfig, "preferences"> {
  preferences?: UserPreferences
  projectName?: string
  extends?: string // Path to parent config (for inheritance)
}

export interface ProjectActiveState {
  wallet?: string
  network?: number
  lastUsed: string
}

export interface ProjectStorageLayout extends StorageLayout {
  projectDir: string
  activeStatePath: string
  contractsDeployedPath: string
  contractsAbisDir: string
  walletsTestingPath: string
  transactionsQueuePath: string
  transactionsHistoryDir: string
  gitignorePath: string
}

/**
 * Resolves storage location (project vs global) by walking up directory tree
 */
export class StorageResolver {
  private static readonly PROJECT_DIR_NAME = ".wallet-agent"

  /**
   * Find project storage directory by walking up from current directory
   */
  static findProjectStorage(startDir: string = process.cwd()): string | null {
    let currentDir = resolve(startDir)
    const root = resolve("/")

    while (currentDir !== root) {
      const projectPath = join(currentDir, StorageResolver.PROJECT_DIR_NAME)
      if (existsSync(projectPath)) {
        return projectPath
      }
      currentDir = dirname(currentDir)
    }

    return null
  }

  /**
   * Get project root directory (parent of .wallet-agent)
   */
  static getProjectRoot(projectStoragePath: string): string {
    return dirname(projectStoragePath)
  }

  /**
   * Check if we're in a project context
   */
  static isInProject(startDir: string = process.cwd()): boolean {
    return StorageResolver.findProjectStorage(startDir) !== null
  }
}

/**
 * Project storage manager with global storage inheritance
 */
export class ProjectStorageManager extends StorageManager {
  private projectLayout: ProjectStorageLayout
  private globalStorage?: StorageManager

  constructor(projectPath?: string) {
    super() // Call parent constructor

    let resolvedProjectPath: string | null

    if (projectPath) {
      // If explicit path provided, verify it exists
      if (!existsSync(projectPath)) {
        throw new Error(
          "No project storage found. Run 'wallet-agent init' to initialize project storage.",
        )
      }
      resolvedProjectPath = projectPath
    } else {
      // If no path provided, search for project storage
      resolvedProjectPath = StorageResolver.findProjectStorage()
      if (!resolvedProjectPath) {
        throw new Error(
          "No project storage found. Run 'wallet-agent init' to initialize project storage.",
        )
      }
    }

    // Create project-specific layout
    this.projectLayout = this.createProjectLayout(resolvedProjectPath)

    // Initialize global storage for inheritance
    this.globalStorage = new StorageManager()
  }

  private createProjectLayout(projectPath: string): ProjectStorageLayout {
    return {
      baseDir: projectPath,
      configPath: join(projectPath, "config.json"),
      authDir: join(projectPath, "auth"),
      walletsDir: join(projectPath, "wallets"),
      networksDir: join(projectPath, "networks"),
      contractsDir: join(projectPath, "contracts"),
      addressBookDir: join(projectPath, "addressbook"),
      cacheDir: join(projectPath, "cache"),
      templatesDir: join(projectPath, "templates"),

      // Project-specific paths
      projectDir: projectPath,
      activeStatePath: join(projectPath, "active.json"),
      contractsDeployedPath: join(projectPath, "contracts", "deployed.json"),
      contractsAbisDir: join(projectPath, "contracts", "abis"),
      walletsTestingPath: join(projectPath, "wallets", "testing.json"),
      transactionsQueuePath: join(projectPath, "transactions", "queue.json"),
      transactionsHistoryDir: join(projectPath, "transactions", "history"),
      gitignorePath: join(projectPath, ".gitignore"),
    }
  }

  /**
   * Initialize project storage structure
   */
  override async initialize(): Promise<void> {
    try {
      // Create all directories
      await this.ensureDirectory(this.projectLayout.baseDir, 0o700)

      const dirsToCreate = [
        this.projectLayout.contractsDir,
        this.projectLayout.contractsAbisDir,
        this.projectLayout.walletsDir,
        join(this.projectLayout.baseDir, "transactions"),
        this.projectLayout.transactionsHistoryDir,
        this.projectLayout.authDir,
        this.projectLayout.networksDir,
        this.projectLayout.addressBookDir,
        this.projectLayout.cacheDir,
        this.projectLayout.templatesDir,
      ]

      for (const dir of dirsToCreate) {
        await this.ensureDirectory(dir, 0o700)
      }

      // Create default config if it doesn't exist
      if (!existsSync(this.projectLayout.configPath)) {
        await this.createDefaultProjectConfig()
      }

      // Create default active state if it doesn't exist
      if (!existsSync(this.projectLayout.activeStatePath)) {
        await this.createDefaultActiveState()
      }

      // Generate .gitignore if it doesn't exist
      if (!existsSync(this.projectLayout.gitignorePath)) {
        await this.generateGitignore()
      }

      logger.info(`Project storage initialized at ${this.projectLayout.baseDir}`)
    } catch (error) {
      throw new Error(
        `Failed to initialize project storage: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Create default project configuration
   */
  private async createDefaultProjectConfig(): Promise<void> {
    const projectRoot = StorageResolver.getProjectRoot(this.projectLayout.baseDir)
    const projectName = projectRoot.split("/").pop() || "wallet-agent-project"

    const defaultConfig: ProjectConfig = {
      version: "1.0.0",
      projectName,
      preferences: {
        autoConnect: false,
        theme: "auto",
        preferredCurrency: "USD",
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }

    await writeFile(this.projectLayout.configPath, JSON.stringify(defaultConfig, null, 2), {
      mode: 0o600,
    })
  }

  /**
   * Create default active state
   */
  private async createDefaultActiveState(): Promise<void> {
    const defaultState: ProjectActiveState = {
      lastUsed: new Date().toISOString(),
    }

    await writeFile(this.projectLayout.activeStatePath, JSON.stringify(defaultState, null, 2), {
      mode: 0o600,
    })
  }

  /**
   * Generate .gitignore for project
   */
  private async generateGitignore(): Promise<void> {
    const gitignoreContent = `# Wallet Agent - Auto-generated
# Sensitive files - DO NOT COMMIT

# Private keys and authentication
auth/
*.key
*.pem

# Active state (may contain sensitive data)
active.json

# Transaction history (may contain sensitive data)
transactions/history/

# Wallet configurations (may contain sensitive data) 
wallets/testing.json

# Cache files
cache/
*.tmp
*.cache

# Add your own exclusions below:
`

    await writeFile(
      this.projectLayout.gitignorePath,
      gitignoreContent,
      { mode: 0o644 }, // Regular file permissions for .gitignore
    )
  }

  /**
   * Read project configuration with global inheritance
   */
  override async readConfig(): Promise<ProjectConfig> {
    try {
      const projectConfigContent = await readFile(this.projectLayout.configPath, "utf-8")
      const projectConfig = JSON.parse(projectConfigContent) as ProjectConfig

      // If global storage is available, merge with global config
      if (this.globalStorage) {
        try {
          const globalConfig = await this.globalStorage.readConfig()

          // Merge configs with project overriding global
          return {
            ...globalConfig,
            ...projectConfig,
            preferences: {
              ...globalConfig.preferences,
              ...projectConfig.preferences,
            },
          }
        } catch {
          // Global config not available, use project only
          return projectConfig
        }
      }

      return projectConfig
    } catch (error) {
      throw new Error(
        `Failed to read project config: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Read active state for project
   */
  async readActiveState(): Promise<ProjectActiveState> {
    try {
      const content = await readFile(this.projectLayout.activeStatePath, "utf-8")
      return JSON.parse(content) as ProjectActiveState
    } catch (_error) {
      // Return default state if file doesn't exist
      return {
        lastUsed: new Date().toISOString(),
      }
    }
  }

  /**
   * Update active state for project
   */
  async updateActiveState(state: Partial<ProjectActiveState>): Promise<void> {
    try {
      const currentState = await this.readActiveState()
      const updatedState: ProjectActiveState = {
        ...currentState,
        ...state,
        lastUsed: new Date().toISOString(),
      }

      await writeFile(this.projectLayout.activeStatePath, JSON.stringify(updatedState, null, 2), {
        mode: 0o600,
      })

      logger.debug({ msg: "Updated project active state", state: updatedState })
    } catch (error) {
      throw new Error(
        `Failed to update active state: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Get project storage layout
   */
  getProjectLayout(): ProjectStorageLayout {
    return { ...this.projectLayout }
  }

  /**
   * Get regular storage layout (for compatibility)
   */
  override getLayout(): StorageLayout {
    return this.projectLayout
  }

  /**
   * Static method to initialize a new project
   */
  static async initializeProject(projectPath?: string): Promise<ProjectStorageManager> {
    const targetPath = projectPath || join(process.cwd(), ".wallet-agent")

    // Create the directory first
    await mkdir(targetPath, { recursive: true, mode: 0o700 })

    // Create and initialize the manager
    const manager = new ProjectStorageManager(targetPath)
    await manager.initialize()

    return manager
  }
}
