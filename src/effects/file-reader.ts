import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { FileReader } from "../adapters/contract-adapter.js";

/**
 * Node.js file reader implementation
 */
export class NodeFileReader implements FileReader {
  async read(path: string): Promise<string> {
    const absolutePath = resolve(process.cwd(), path);
    return await readFile(absolutePath, "utf-8");
  }
}
