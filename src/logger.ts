import pino from "pino"

const isDevelopment = process.env.NODE_ENV === "development"
const isTest = process.env.NODE_ENV === "test"

// For MCP servers, we must use stderr for logging to avoid interfering with
// the JSON-RPC protocol on stdout
export const logger = pino(
  {
    level: isTest ? "silent" : process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
    transport:
      isDevelopment && !isTest
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              ignore: "pid,hostname",
              translateTime: "HH:MM:ss",
              destination: 2, // stderr
            },
          }
        : undefined,
  },
  pino.destination(2), // Always use stderr
)

export const createLogger = (name: string) => logger.child({ module: name })
