import { serviceDayPositions } from "../config/domain";
import { normalizeOptionalText } from "../utils/text";
import type { ParsedServiceDays, ServiceDayName } from "./routeTypes";

export function parseServiceDays(value: string | null): ParsedServiceDays {
  const original = normalizeOptionalText(value);

  if (!original) {
    return {
      original,
      status: "unknown",
      days: [],
      label: "Unknown",
    };
  }

  if (original.length !== serviceDayPositions.length) {
    return toUnknownServiceDays(original);
  }

  const days: ServiceDayName[] = [];

  for (const [index, character] of [...original].entries()) {
    const expected = serviceDayPositions[index];

    if (!expected) {
      return toUnknownServiceDays(original);
    }

    if (character === expected.marker) {
      days.push(expected.day);
      continue;
    }

    if (character !== "x") {
      return toUnknownServiceDays(original);
    }
  }

  if (days.length === 0) {
    return toUnknownServiceDays(original);
  }

  return {
    original,
    status: "known",
    days,
    label: days.join(", "),
  };
}

function toUnknownServiceDays(original: string): ParsedServiceDays {
  return {
    original,
    status: "unknown",
    days: [],
    label: `Unknown (${original})`,
  };
}
