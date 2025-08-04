import { mock } from "bun:test";

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: mock(() => {}),
  warn: mock(() => {}),
};
