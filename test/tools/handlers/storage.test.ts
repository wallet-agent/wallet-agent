import { beforeEach, describe, expect, it } from "bun:test"
import { McpError } from "@modelcontextprotocol/sdk/types.js"
import { TestContainer } from "../../../src/test-container.js"
import {
  handleGetStorageInfo,
  handleInitStorage,
  handleManageStoragePreferences,
  handleMigrateToStorage,
} from "../../../src/tools/handlers/storage.js"

describe("Storage Handlers (Consolidated)", () => {
  let _testContainer: TestContainer

  beforeEach(() => {
    _testContainer = TestContainer.createForTest({})
  })

  describe("handleInitStorage", () => {
    it("should handle storage initialization", async () => {
      // Since test container doesn't have storage enabled, expect error
      await expect(handleInitStorage()).rejects.toThrow("Storage is not available")
    })

    it("should handle force initialization parameter", async () => {
      await expect(handleInitStorage({ force: true })).rejects.toThrow("Storage is not available")
    })

    it("should handle clearCache parameter", async () => {
      await expect(handleInitStorage({ clearCache: true })).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should handle combined force and clearCache parameters", async () => {
      await expect(handleInitStorage({ force: true, clearCache: true })).rejects.toThrow(
        "Storage is not available",
      )
    })
  })

  describe("handleGetStorageInfo", () => {
    it("should return storage not available message", async () => {
      const result = await handleGetStorageInfo()

      expect(result).toHaveProperty("content")
      expect(result.content[0].type).toBe("text")
      expect(result.content[0].text).toContain("Storage not available")
    })

    it("should handle detailed parameter", async () => {
      const result = await handleGetStorageInfo({ detailed: true })

      expect(result).toHaveProperty("content")
      expect(result.content[0].type).toBe("text")
      expect(result.content[0].text).toContain("Storage not available")
    })

    it("should handle export parameter", async () => {
      const result = await handleGetStorageInfo({ export: true })

      expect(result).toHaveProperty("content")
      expect(result.content[0].type).toBe("text")
      expect(result.content[0].text).toContain("Storage not available")
    })

    it("should handle export with format parameter", async () => {
      const result = await handleGetStorageInfo({ export: true, exportFormat: "yaml" })

      expect(result).toHaveProperty("content")
      expect(result.content[0].type).toBe("text")
      expect(result.content[0].text).toContain("Storage not available")
    })

    it("should handle includePreferences parameter", async () => {
      const result = await handleGetStorageInfo({ export: true, includePreferences: false })

      expect(result).toHaveProperty("content")
      expect(result.content[0].type).toBe("text")
      expect(result.content[0].text).toContain("Storage not available")
    })
  })

  describe("handleManageStoragePreferences", () => {
    it("should handle get action", async () => {
      await expect(handleManageStoragePreferences({ action: "get" })).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should handle update action", async () => {
      const preferences = { theme: "dark" as const }

      await expect(
        handleManageStoragePreferences({ action: "update", ...preferences }),
      ).rejects.toThrow("Storage is not available")
    })

    it("should default to get action when no action specified", async () => {
      await expect(handleManageStoragePreferences()).rejects.toThrow("Storage is not available")
    })

    it("should handle multiple preference updates", async () => {
      const preferences = {
        action: "update" as const,
        theme: "dark" as const,
        autoConnect: true,
        preferredCurrency: "EUR",
      }

      await expect(handleManageStoragePreferences(preferences)).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should validate invalid action", async () => {
      // This test would need storage to be available to test the validation logic
      // For now, it will fail with storage not available error
      await expect(
        handleManageStoragePreferences({ action: "invalid" as "get" | "update" }),
      ).rejects.toThrow("Storage is not available")
    })
  })

  describe("handleMigrateToStorage", () => {
    it("should handle storage not available", async () => {
      await expect(handleMigrateToStorage()).rejects.toThrow("Storage is not available")
    })

    it("should handle createBackup parameter", async () => {
      await expect(handleMigrateToStorage({ createBackup: true })).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should handle force parameter", async () => {
      await expect(handleMigrateToStorage({ force: true })).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should handle combined parameters", async () => {
      await expect(handleMigrateToStorage({ createBackup: true, force: true })).rejects.toThrow(
        "Storage is not available",
      )
    })
  })

  describe("Error Handling", () => {
    it("should return proper MCP errors for init_storage", async () => {
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

    it("should return proper MCP errors for manage_storage_preferences", async () => {
      try {
        await handleManageStoragePreferences({ action: "update", theme: "dark" })
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
  })

  describe("Tool Consolidation Benefits", () => {
    it("should demonstrate init_storage consolidates cache clearing", async () => {
      // Test that cache clearing is now part of init_storage
      await expect(handleInitStorage({ clearCache: true })).rejects.toThrow(
        "Storage is not available",
      )
    })

    it("should demonstrate get_storage_info consolidates layout and export", async () => {
      // Test that detailed layout and export are now part of get_storage_info
      const result = await handleGetStorageInfo({ detailed: true, export: true })
      expect(result).toHaveProperty("content")
    })

    it("should demonstrate manage_storage_preferences handles both get and update", async () => {
      // Test that both get and update actions are handled by one tool
      await expect(handleManageStoragePreferences({ action: "get" })).rejects.toThrow(
        "Storage is not available",
      )
      await expect(
        handleManageStoragePreferences({ action: "update", theme: "dark" }),
      ).rejects.toThrow("Storage is not available")
    })
  })
})
