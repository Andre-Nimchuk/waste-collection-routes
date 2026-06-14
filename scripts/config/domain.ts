import type { ServiceDayName } from "../domain/routeTypes";

export const serviceDayPositions: Array<{
  marker: string;
  day: ServiceDayName;
}> = [
  { marker: "1", day: "Monday" },
  { marker: "2", day: "Tuesday" },
  { marker: "3", day: "Wednesday" },
  { marker: "4", day: "Thursday" },
  { marker: "5", day: "Friday" },
  { marker: "6", day: "Saturday" },
  { marker: "7", day: "Sunday" },
];

export const knownFrequencyLabels = new Map<number, string>([
  [1, "Once a week"],
  [2, "Once every two weeks"],
  [4, "Once every four weeks"],
  [8, "Once every eight weeks"],
  [12, "Once every twelve weeks"],
]);
