import { Fragment } from "react";
import { Card } from "@/components/ui/card";

/* =========================
   TYPES
   ========================= */
export type TimetableEntry = {
  id?: number;
  day: string;
  timeSlot: string;
  subjectCode?: string;
  facultyName?: string;
  roomNumber?: string;
  type: "LECTURE" | "LAB" | "BREAK" | "LUNCH";
};

type Props = {
  entries?: TimetableEntry[];
};

/* =========================
   COMPONENT
   ========================= */
export function TimetableGrid({ entries = [] }: Props) {
  const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  const TIME_SLOTS = [
    "08:00-08:50",
    "09:00-09:50",
    "10:00-10:50",
    "10:30-10:45",
    "11:00-11:50",
    "12:00-12:50",
    "01:15-02:05",
    "02:10-03:00",
    "03:10-04:00",
    "04:10-05:00",
  ];

  const findEntry = (day: string, slot: string) =>
    entries.find(e => e.day === day && e.timeSlot === slot);

  return (
    <div className="overflow-x-auto border rounded-lg bg-white">
      <div className="grid grid-cols-[120px_repeat(10,minmax(120px,1fr))] gap-px bg-muted">

        {/* HEADER */}
        <div className="bg-white" />
        {TIME_SLOTS.map(slot => (
          <div
            key={`header-${slot}`}
            className="bg-white text-xs font-semibold text-center p-2"
          >
            {slot}
          </div>
        ))}

        {/* GRID */}
        {DAYS.map(day => (
          <Fragment key={day}>
            <div className="bg-white font-semibold text-sm p-2">
              {day}
            </div>

            {TIME_SLOTS.map(slot => {
              const entry = findEntry(day, slot);

              return (
                <Card
                  key={`${day}-${slot}`}
                  className={`rounded-none p-2 text-xs text-center h-[90px] flex flex-col justify-center
                    ${
                      entry?.type === "LAB"
                        ? "bg-purple-100"
                        : entry?.type === "LUNCH"
                        ? "bg-yellow-100"
                        : entry?.type === "BREAK"
                        ? "bg-gray-200"
                        : entry
                        ? "bg-blue-100"
                        : "bg-white"
                    }`}
                >
                  {entry ? (
                    <>
                      <div className="font-semibold">
                        {entry.type === "BREAK" || entry.type === "LUNCH"
                          ? entry.type
                          : entry.subjectCode}
                      </div>

                      {entry.facultyName && <div>{entry.facultyName}</div>}

                      {entry.roomNumber && (
                        <div className="text-muted-foreground">
                          {entry.roomNumber}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Card>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
