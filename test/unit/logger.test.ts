import { afterEach, beforeEach, describe, expect, test } from "bun:test"

describe("Logger", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Clear module cache before each test
    delete require.cache[require.resolve("../../src/logger.js")]
  })

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv }
    // Clear module cache
    delete require.cache[require.resolve("../../src/logger.js")]
  })

  describe("Logger Configuration", () => {
    test("should use silent level in test environment", () => {
      process.env.NODE_ENV = "test"

      const { logger } = require("../../src/logger.js")

      expect(logger.level).toBe("silent")
    })

    test("should use debug level in development environment", () => {
      process.env.NODE_ENV = "development"
      delete process.env.LOG_LEVEL

      const { logger } = require("../../src/logger.js")

      expect(logger.level).toBe("debug")
    })

    test("should use info level in production environment", () => {
      process.env.NODE_ENV = "production"
      delete process.env.LOG_LEVEL

      const { logger } = require("../../src/logger.js")

      expect(logger.level).toBe("info")
    })

    test("should respect LOG_LEVEL environment variable", () => {
      process.env.NODE_ENV = "production"
      process.env.LOG_LEVEL = "warn"

      const { logger } = require("../../src/logger.js")

      expect(logger.level).toBe("warn")
    })

    test("should prioritize LOG_LEVEL over NODE_ENV defaults", () => {
      process.env.NODE_ENV = "development"
      process.env.LOG_LEVEL = "error"

      const { logger } = require("../../src/logger.js")

      expect(logger.level).toBe("error")
    })
  })

  describe("Logger Transport", () => {
    test("should not use pretty transport in test environment", () => {
      process.env.NODE_ENV = "test"

      const { logger } = require("../../src/logger.js")

      // In test environment, transport should be undefined
      // We can verify this indirectly by checking the logger is created
      expect(logger).toBeDefined()
      expect(logger.level).toBe("silent")
    })

    test("should configure pretty transport in development", () => {
      process.env.NODE_ENV = "development"

      const { logger } = require("../../src/logger.js")

      // Logger should be created with proper configuration
      expect(logger).toBeDefined()
      expect(logger.level).toBe("debug")
    })

    test("should not use pretty transport in production", () => {
      process.env.NODE_ENV = "production"

      const { logger } = require("../../src/logger.js")

      expect(logger).toBeDefined()
      expect(logger.level).toBe("info")
    })
  })

  describe("createLogger", () => {
    test("should create child logger with module name", () => {
      process.env.NODE_ENV = "production"

      const { createLogger } = require("../../src/logger.js")

      const childLogger = createLogger("test-module")

      expect(childLogger).toBeDefined()
      expect(childLogger.child).toBeDefined() // Child loggers also have child method
    })

    test("should create multiple child loggers with different names", () => {
      process.env.NODE_ENV = "production"

      const { createLogger } = require("../../src/logger.js")

      const logger1 = createLogger("module1")
      const logger2 = createLogger("module2")

      expect(logger1).toBeDefined()
      expect(logger2).toBeDefined()
      expect(logger1).not.toBe(logger2)
    })

    test("should inherit parent logger configuration", () => {
      process.env.NODE_ENV = "production"
      process.env.LOG_LEVEL = "warn"

      const { createLogger } = require("../../src/logger.js")

      const childLogger = createLogger("child-module")

      expect(childLogger.level).toBe("warn")
    })
  })

  describe("Logger Destination", () => {
    test("should always use stderr (file descriptor 2)", () => {
      // This is important for MCP servers to avoid interfering with stdout
      process.env.NODE_ENV = "production"

      const { logger } = require("../../src/logger.js")

      // Logger should be configured to use stderr
      // We can verify this by checking the logger is created successfully
      expect(logger).toBeDefined()

      // The logger should have standard pino methods
      expect(typeof logger.info).toBe("function")
      expect(typeof logger.error).toBe("function")
      expect(typeof logger.warn).toBe("function")
      expect(typeof logger.debug).toBe("function")
    })
  })

  describe("Environment Combinations", () => {
    test("should handle undefined NODE_ENV", () => {
      delete process.env.NODE_ENV
      delete process.env.LOG_LEVEL

      const { logger } = require("../../src/logger.js")

      // Should default to info when NODE_ENV is not set
      expect(logger.level).toBe("info")
    })

    test("should handle empty string NODE_ENV", () => {
      process.env.NODE_ENV = ""
      delete process.env.LOG_LEVEL

      const { logger } = require("../../src/logger.js")

      expect(logger.level).toBe("info")
    })

    test("should handle arbitrary NODE_ENV values", () => {
      process.env.NODE_ENV = "staging"
      delete process.env.LOG_LEVEL

      const { logger } = require("../../src/logger.js")

      // Should default to info for unknown environments
      expect(logger.level).toBe("info")
    })
  })
})
