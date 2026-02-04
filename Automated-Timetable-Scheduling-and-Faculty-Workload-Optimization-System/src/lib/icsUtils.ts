export interface CalendarEvent {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
}

export const formatDateDocs = (date: Date): string => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
};

export const generateICS = (event: CalendarEvent): string => {
    const start = formatDateDocs(event.startDate);
    const end = formatDateDocs(event.endDate);
    const now = formatDateDocs(new Date());

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timetable System//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
};
