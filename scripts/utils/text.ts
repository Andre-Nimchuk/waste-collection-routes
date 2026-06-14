export function normalizeOptionalText(value: string | null): string | null {
  const text = value?.trim();

  return text ? text : null;
}
