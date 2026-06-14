import { knownFrequencyLabels } from "../config/domain";
import { normalizeOptionalText } from "../utils/text";
import type { ParsedFrequency } from "./routeTypes";

export function parseFrequency(value: string | null): ParsedFrequency {
  const original = normalizeOptionalText(value);

  if (!original) {
    return {
      original,
      status: "unknown",
      intervalWeeks: null,
      label: "Unknown",
    };
  }

  const match = /^1x(?:(\d+))?n$/i.exec(original);

  if (!match) {
    return {
      original,
      status: "custom",
      intervalWeeks: null,
      label: `Custom (${original})`,
    };
  }

  const intervalWeeks = match[1] ? Number(match[1]) : 1;
  const label = knownFrequencyLabels.get(intervalWeeks);

  if (!label) {
    return {
      original,
      status: "custom",
      intervalWeeks,
      label: `Every ${intervalWeeks} weeks`,
    };
  }

  return {
    original,
    status: "known",
    intervalWeeks,
    label,
  };
}
