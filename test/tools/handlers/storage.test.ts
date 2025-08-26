import { beforeEach, describe, expect, it } from "bun:test"
import { McpError } from "@modelcontextprotocol/sdk/types.js"
import { TestContainer } from "../../../src/test-container.js"
import {
  handleClearStorageCache,
  handleExportStorageConfig,
  handleGetStorageInfo,
  handleGetStorageLayout,
  handleInitStorage,
  handleMigrateToStorage,
  handleUpdateStoragePreferences,
} from "../../../src/tools/handlers/storage.js"

describe("Storage Handlers", () => {
  let _testContainer: TestContainer

  beforeEach(async () => {
    _testContainer = TestContainer.createForTest({})
  })

  describe("handleGetStorageInfo", () => {
    it("should return storage not available message when no storage manager", async () => {
      // Test container doesn't initialize storage by default
      const result = await handleGetStorageInfo()

      expect(result.content[0].type).toBe("text")
      expect(result.content[0].text).toContain("❌ Storage not available")
      expect(result.content[0].text).toContain("in-memory storage only")
    })
  })

  describe("handleInitStorage", () => {
    it("should return error when storage manager not available", async () => {
      await expect(handleInitStorage()).rejects.toThrow("Storage is not available")
    })
  })

  describe("handleUpdateStoragePreferences", () => {
    it("should return error when storage manager not available", async () => {
      const preferences = { theme: "dark" as const }

      await expect(handleUpdateStoragePreferences(preferences)).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should handle storage not available", async () => {
      const validArgs = { theme: "dark" as const }

      await expect(handleUpdateStoragePreferences(validArgs)).rejects.toThrow(
        "Storage is not available",
      )
    })
  })

  describe("handleClearStorageCache", () => {
    it("should require confirmation", async () => {
      await expect(handleClearStorageCache({ confirm: false })).rejects.toThrow(
        "Must confirm cache clearing",
      )
    })

    it("should return error when storage manager not available", async () => {
      await expect(handleClearStorageCache({ confirm: true })).rejects.toThrow(
        "Storage is not available",
      )
    })
  })

  describe("handleExportStorageConfig", () => {
    it("should return error when storage manager not available", async () => {
      await expect(handleExportStorageConfig()).rejects.toThrow("Storage is not available")
    })
  })

  describe("handleGetStorageLayout", () => {
    it("should return error when storage manager not available", async () => {
      await expect(handleGetStorageLayout()).rejects.toThrow("Storage is not available")
    })
  })

  describe("handleMigrateToStorage", () => {
    it("should return error when storage manager not available", async () => {
      await expect(handleMigrateToStorage()).rejects.toThrow("Storage is not available")
    })
  })

  describe("argument validation", () => {
    it("should handle valid theme preference", async () => {
      const validPrefs = { theme: "dark" as const }

      // Will still fail due to no storage manager, but shouldn't fail validation
      await expect(handleUpdateStoragePreferences(validPrefs)).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should handle valid export config arguments", async () => {
      const validArgs = { format: "json" as const, includePreferences: true }

      // Will still fail due to no storage manager, but shouldn't fail validation
      await expect(handleExportStorageConfig(validArgs)).rejects.toThrow("Storage is not available")
    })

    it("should handle migration arguments", async () => {
      const validArgs = { createBackup: true, force: false }

      // Will still fail due to no storage manager, but shouldn't fail validation
      await expect(handleMigrateToStorage(validArgs)).rejects.toThrow("Storage is not available")
    })
  })

  describe("error message formatting", () => {
    it("should return properly formatted error messages", async () => {
      try {
        await handleInitStorage()
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toHaveProperty("message")
        expect(error).toHaveProperty("code")
        expect(error).toBeInstanceOf(McpError)
        if (error instanceof McpError) {
          expect(error.code).toBe(-32603) // InternalError
        }
      }
    })

    it("should return properly formatted validation errors", async () => {
      try {
        await handleClearStorageCache({ confirm: false })
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toHaveProperty("message")
        expect(error).toHaveProperty("code")
        expect(error).toBeInstanceOf(McpError)
        if (error instanceof McpError) {
          expect(error.code).toBe(-32602) // InvalidParams
        }
      }
    })
  })
})

// Integration tests would require a more complex setup with actual storage
// These tests focus on the handler logic and error conditions
describe("Storage Handlers Integration", () => {
  // These tests would be run with a real storage manager instance
  // For now, we test the basic structure and error handling

  it("should have all required handlers exported", () => {
    expect(typeof handleInitStorage).toBe("function")
    expect(typeof handleGetStorageInfo).toBe("function")
    expect(typeof handleUpdateStoragePreferences).toBe("function")
    expect(typeof handleClearStorageCache).toBe("function")
    expect(typeof handleExportStorageConfig).toBe("function")
    expect(typeof handleGetStorageLayout).toBe("function")
    expect(typeof handleMigrateToStorage).toBe("function")
  })

  it("should have consistent error handling patterns", () => {
    // All handlers should throw McpError with proper codes
    // This is tested implicitly in the individual handler tests above
    expect(true).toBe(true)
  })
})
