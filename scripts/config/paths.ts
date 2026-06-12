import path from "node:path";

export const projectRoot = process.cwd();

export const inputRoutesFilePath = path.join(
  projectRoot,
  "input",
  "Routes 01.01.2026-31.03.2026 tech test.xlsx",
);

export const parsedRoutesOutputPath = path.join(projectRoot, "src", "data", "routes.json");

export function toProjectRelativePath(filePath: string): string {
  return path.relative(projectRoot, filePath);
}
