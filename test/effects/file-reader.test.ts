import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NodeFileReader } from "../../src/effects/file-reader";

describe("NodeFileReader", () => {
  let fileReader: NodeFileReader;
  let testDir: string;

  beforeAll(async () => {
    fileReader = new NodeFileReader();
    testDir = join(process.cwd(), "test-temp-dir");

    // Create test directory
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  describe("read", () => {
    test("reads existing file with absolute path", async () => {
      const testFile = join(testDir, "test-absolute.txt");
      const content = "Hello, World!";

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("reads existing file with relative path", async () => {
      const fileName = "test-relative.txt";
      const testFile = join(testDir, fileName);
      const relativePath = `test-temp-dir/${fileName}`;
      const content = "This is a test file with relative path.";

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(relativePath);
      expect(result).toBe(content);
    });

    test("reads file with UTF-8 encoding", async () => {
      const testFile = join(testDir, "test-utf8.txt");
      const content = "UTF-8 content: 🚀 Hello, 世界! こんにちは";

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("reads empty file", async () => {
      const testFile = join(testDir, "empty.txt");

      await writeFile(testFile, "", "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe("");
    });

    test("reads file with special characters", async () => {
      const testFile = join(testDir, "special-chars.txt");
      const content = `Special characters: !@#$%^&*()_+{}[]|\\:";'<>?,./\nNewlines\nand\ttabs`;

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("reads file with contract-like content", async () => {
      const testFile = join(testDir, "contract.ts");
      const content = `
export const TestContractABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [{"name": "owner", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  }
] as const;

export const TestContractAddress = {
  1: "0x1234567890123456789012345678901234567890",
  5: "0x0987654321098765432109876543210987654321"
} as const;
      `;

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("reads large file", async () => {
      const testFile = join(testDir, "large.txt");
      const content = "A".repeat(10000); // 10KB file

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
      expect(result.length).toBe(10000);
    });

    test("reads file with JSON content", async () => {
      const testFile = join(testDir, "data.json");
      const content = JSON.stringify(
        {
          name: "Test Contract",
          version: "1.0.0",
          abi: [
            {
              type: "function",
              name: "test",
              inputs: [],
              outputs: [],
            },
          ],
        },
        null,
        2,
      );

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);

      // Verify it's valid JSON
      const parsed = JSON.parse(result);
      expect(parsed.name).toBe("Test Contract");
      expect(parsed.abi).toBeInstanceOf(Array);
    });

    test("throws error when file does not exist", async () => {
      const nonExistentFile = join(testDir, "does-not-exist.txt");

      await expect(fileReader.read(nonExistentFile)).rejects.toThrow();
    });

    test("throws error when path is a directory", async () => {
      await expect(fileReader.read(testDir)).rejects.toThrow();
    });

    test("throws error with invalid path characters", async () => {
      const invalidPath = join(testDir, "invalid\x00path.txt");

      await expect(fileReader.read(invalidPath)).rejects.toThrow();
    });

    test("handles path with dots and special directories", async () => {
      const testFile = join(testDir, "subdir", "..", "dotfile.txt");
      const content = "Content in a file with dots in path";

      // Create the actual file in the expected resolved location
      const actualFile = join(testDir, "dotfile.txt");
      await writeFile(actualFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("resolves path relative to current working directory", async () => {
      const fileName = "cwd-test.txt";
      const relativePath = `test-temp-dir/${fileName}`;
      const content = "Testing CWD resolution";

      await writeFile(join(testDir, fileName), content, "utf-8");

      const result = await fileReader.read(relativePath);
      expect(result).toBe(content);
    });

    test("handles file with only whitespace", async () => {
      const testFile = join(testDir, "whitespace.txt");
      const content = "   \n\t  \r\n  ";

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("handles file with binary-like content", async () => {
      const testFile = join(testDir, "binary-like.txt");
      const content = "\x00\x01\x02\x03\xFF"; // Some binary-like characters

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("handles file with very long lines", async () => {
      const testFile = join(testDir, "long-line.txt");
      const longLine = "x".repeat(5000);
      const content = `Short line\n${longLine}\nAnother short line`;

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
      expect(result.split("\n")[1].length).toBe(5000);
    });

    test("handles multiple file reads concurrently", async () => {
      const numFiles = 5;
      const files: string[] = [];
      const contents: string[] = [];

      // Create multiple test files
      for (let i = 0; i < numFiles; i++) {
        const testFile = join(testDir, `concurrent-${i}.txt`);
        const content = `File ${i} content - unique content for testing`;
        files.push(testFile);
        contents.push(content);
        await writeFile(testFile, content, "utf-8");
      }

      // Read all files concurrently
      const promises = files.map((file) => fileReader.read(file));
      const results = await Promise.all(promises);

      // Verify all results
      for (let i = 0; i < numFiles; i++) {
        expect(results[i]).toBe(contents[i]);
      }
    });

    test("handles file paths with spaces", async () => {
      const testFile = join(testDir, "file with spaces.txt");
      const content = "File with spaces in name";

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("handles file with Windows-style line endings", async () => {
      const testFile = join(testDir, "windows-endings.txt");
      const content = "Line 1\r\nLine 2\r\nLine 3\r\n";

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });

    test("handles file with mixed line endings", async () => {
      const testFile = join(testDir, "mixed-endings.txt");
      const content = "Unix line\nWindows line\r\nMac line\rMixed content";

      await writeFile(testFile, content, "utf-8");

      const result = await fileReader.read(testFile);
      expect(result).toBe(content);
    });
  });
});
