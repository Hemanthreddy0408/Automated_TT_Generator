import React from 'react';
import { Calendar } from 'lucide-react';
import { generateICS, CalendarEvent } from '../../lib/icsUtils';

interface AddToOutlookButtonProps {
    event: CalendarEvent;
}

export const AddToOutlookButton: React.FC<AddToOutlookButtonProps> = ({ event }) => {
    const handleDownload = () => {
        const icsContent = generateICS(event);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Add to Outlook Calendar"
        >
            <Calendar className="w-4 h-4" />
            Add to Outlook
        </button>
    );
};
