export function parseDecimal(value: string | null): number | null {
  const normalizedValue = value?.replace(",", ".").trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function parseInteger(value: string | null): number | null {
  const parsedValue = parseDecimal(value);

  return parsedValue !== null && Number.isInteger(parsedValue) ? parsedValue : null;
}
