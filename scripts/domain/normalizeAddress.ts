export function normalizeAddress(originalAddress: string): string {
  return originalAddress
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\([^)]*\)/g, "")
    .replace(/\/.*$/g, "")
    .replace(/[;,\s/]+$/g, "")
    .trim();
}
