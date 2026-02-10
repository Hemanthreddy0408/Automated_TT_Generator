import { TimetableEntry } from "@/components/timetable/TimetableGrid";

export function buildTimetableMatrix(entries: TimetableEntry[]) {
  const matrix: Record<string, Record<string, TimetableEntry>> = {};

  entries.forEach(entry => {
    if (!matrix[entry.day]) matrix[entry.day] = {};
    matrix[entry.day][entry.timeSlot] = entry;
  });

  return matrix;
}
