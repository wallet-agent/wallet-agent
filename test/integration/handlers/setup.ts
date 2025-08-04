import { beforeEach, expect } from "bun:test";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import {
	Container,
	customChains,
	privateKeyWallets,
} from "../../../src/container.js";
import { handleToolCall } from "../../../src/tools/handlers.js";

// Test addresses
export const TEST_ADDRESS_1 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
export const TEST_ADDRESS_2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
export const TEST_PRIVATE_KEY =
	"0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Helper to reset container state before each test
export function setupContainer() {
	beforeEach(async () => {
		// Reset the container singleton to get a fresh instance
		Container.resetInstance();
		
		// Get the new container instance
		const container = Container.getInstance();

		// Ensure wallet is disconnected and set to mock mode
		if (container.walletEffects.getCurrentAccount().isConnected) {
			await container.walletEffects.disconnectWallet();
		}
		container.walletEffects.setWalletType("mock");

		// Double-check maps are cleared (resetInstance should handle this)
		privateKeyWallets.clear();
		customChains.clear();
	});
}

// Helper to create a tool request
export function createToolRequest(
	name: string,
	args?: Record<string, unknown>,
): CallToolRequest {
	return {
		method: "tools/call",
		params: {
			name,
			arguments: args,
		},
	};
}

// Helper to extract text from tool response
export function extractResponseText(response: {
	content?: Array<{ type: string; text?: string }>;
}): string {
	return response.content?.[0]?.text || "";
}

// Helper to test successful tool execution
export async function expectToolSuccess(
	toolName: string,
	args: Record<string, unknown> | undefined,
	expectedTextPattern?: RegExp | string,
) {
	const request = createToolRequest(toolName, args);
	const response = await handleToolCall(request);
	const text = extractResponseText(response);

	if (expectedTextPattern) {
		if (typeof expectedTextPattern === "string") {
			expect(text).toContain(expectedTextPattern);
		} else {
			expect(text).toMatch(expectedTextPattern);
		}
	}

	return { response, text };
}

// Helper to test tool validation errors
export async function expectToolValidationError(
	toolName: string,
	args: Record<string, unknown> | undefined,
	expectedError?: string,
) {
	const request = createToolRequest(toolName, args);

	try {
		await handleToolCall(request);
		throw new Error("Expected validation error but tool succeeded");
	} catch (error) {
		const err = error as { code?: number; message?: string };
		expect(err.code).toBe(-32602); // InvalidParams
		if (expectedError && err.message) {
			expect(err.message).toContain(expectedError);
		}
	}
}

// Helper to test tool execution errors
export async function expectToolExecutionError(
	toolName: string,
	args: Record<string, unknown> | undefined,
	expectedError?: string,
) {
	const request = createToolRequest(toolName, args);

	try {
		await handleToolCall(request);
		throw new Error("Expected execution error but tool succeeded");
	} catch (error) {
		if (expectedError) {
			const err = error as { message?: string };
			if (err.message) {
				expect(err.message).toContain(expectedError);
			}
		}
	}
}
