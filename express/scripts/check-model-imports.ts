import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const MODELS_DIR = path.resolve(__dirname, "../src/models");
const ALLOWED_LOCAL_IMPORTS = new Set(["./types", "./collections"]);

const isModelFile = (filename: string): boolean =>
  filename.endsWith(".ts") && !filename.endsWith(".d.ts");

const getModelFiles = async (): Promise<string[]> => {
  const entries = await readdir(MODELS_DIR);
  return entries.filter(isModelFile).map((file) => path.join(MODELS_DIR, file));
};

const findViolations = async (filePath: string): Promise<string[]> => {
  const contents = await readFile(filePath, "utf8");
  const lines = contents.split(/\r?\n/);
  const violations: string[] = [];

  for (const line of lines) {
    const match = line.match(/from\s+["'](\.[^"']+)["']/);
    if (!match) {
      continue;
    }

    const importPath = match[1];
    if (!importPath || !importPath.startsWith("./")) {
      continue;
    }

    if (ALLOWED_LOCAL_IMPORTS.has(importPath)) {
      continue;
    }

    const resolved = path.resolve(path.dirname(filePath), importPath);
    const resolvedFile = `${resolved}.ts`;
    if (resolvedFile.startsWith(MODELS_DIR)) {
      const relative = path.relative(MODELS_DIR, filePath);
      violations.push(`${relative}: ${importPath}`);
    }
  }

  return violations;
};

const main = async (): Promise<void> => {
  const files = await getModelFiles();
  const violations: string[] = [];

  for (const file of files) {
    violations.push(...(await findViolations(file)));
  }

  if (violations.length === 0) {
    console.warn("No model-to-model imports detected.");
    return;
  }

  console.error("Model-to-model imports detected:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
};

void main();
