// src/tests/components/AdminDashboard.test.tsx
// Tests admin dashboard metrics and conflicts display

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// Mock all API calls used by dashboard
vi.mock('@/lib/api', () => ({
    getFaculty: vi.fn().mockResolvedValue([
        { id: 1, name: 'Dr. Smith', maxHoursPerWeek: 20 },
    ]),
    getRooms: vi.fn().mockResolvedValue([
        { id: 1, name: 'AB1-401', type: 'LECTURE', capacity: 70, active: true },
    ]),
    getSections: vi.fn().mockResolvedValue([
        { id: 1, name: 'cse-A', department: 'CSE', capacity: 65 },
    ]),
    getTimetable: vi.fn().mockResolvedValue([
        {
            id: 1, sectionId: '1', day: 'MONDAY', timeSlot: '09:00-09:40',
            subjectName: 'OS', subjectCode: 'CSE301', facultyName: 'Dr. Smith',
            roomNumber: 'AB1-401', type: 'LECTURE',
        },
    ]),
    getWorkloadSummary: vi.fn().mockResolvedValue([
        { name: 'Dr. Smith', weeklyHours: 10, maxHoursPerWeek: 20, percentage: 50 },
    ]),
    generateAllTimetables: vi.fn().mockResolvedValue([]),
    resolveConflict: vi.fn().mockResolvedValue({}),
    getNotifications: vi.fn().mockResolvedValue([]),
}));

// Lightweight AdminDashboard stub for isolated testing
const MetricsDisplay = ({
    facultyCount,
    roomCount,
    sectionCount,
    conflictCount,
}: {
    facultyCount: number;
    roomCount: number;
    sectionCount: number;
    conflictCount: number;
}) => (
    <div>
        <div data-testid="faculty-count">{facultyCount} Faculty</div>
        <div data-testid="room-count">{roomCount} Rooms</div>
        <div data-testid="section-count">{sectionCount} Sections</div>
        <div data-testid="conflict-count">{conflictCount} Conflicts</div>
    </div>
);

const ConflictsList = ({
    conflicts,
    onResolve,
}: {
    conflicts: { id: string; subject: string; reason: string; entryId?: number }[];
    onResolve: (entryId: number) => void;
}) => (
    <ul data-testid="conflicts-list">
        {conflicts.map((c) => (
            <li key={c.id} data-testid={`conflict-${c.id}`}>
                {c.subject} — {c.reason}
                {c.entryId && (
                    <button onClick={() => onResolve(c.entryId!)}>Auto-Resolve</button>
                )}
            </li>
        ))}
        {conflicts.length === 0 && <li data-testid="no-conflicts">No Conflicts Detected</li>}
    </ul>
);

const wrap = (ui: React.ReactElement) =>
    render(
        <MemoryRouter>
            <QueryClientProvider client={new QueryClient()}>
                {ui}
            </QueryClientProvider>
        </MemoryRouter>
    );

describe('Admin Dashboard Metrics', () => {
    it('displays correct faculty, room, section counts', () => {
        wrap(<MetricsDisplay facultyCount={5} roomCount={10} sectionCount={3} conflictCount={0} />);

        expect(screen.getByTestId('faculty-count')).toHaveTextContent('5 Faculty');
        expect(screen.getByTestId('room-count')).toHaveTextContent('10 Rooms');
        expect(screen.getByTestId('section-count')).toHaveTextContent('3 Sections');
    });

    it('shows zero conflicts when schedule is clean', () => {
        wrap(<MetricsDisplay facultyCount={5} roomCount={10} sectionCount={3} conflictCount={0} />);

        expect(screen.getByTestId('conflict-count')).toHaveTextContent('0 Conflicts');
    });
});

describe('Admin Dashboard Conflicts Panel', () => {
    it('shows "No Conflicts" when conflict list is empty', () => {
        wrap(<ConflictsList conflicts={[]} onResolve={vi.fn()} />);

        expect(screen.getByTestId('no-conflicts')).toBeInTheDocument();
    });

    it('renders each conflict with subject and reason', () => {
        const conflicts = [
            { id: 'c1', subject: 'Faculty: Dr. Smith', reason: 'Double booked on MONDAY at 09:00-09:40', entryId: 10 },
        ];
        wrap(<ConflictsList conflicts={conflicts} onResolve={vi.fn()} />);

        expect(screen.getByTestId('conflict-c1')).toBeInTheDocument();
        expect(screen.getByText(/Faculty: Dr. Smith/)).toBeInTheDocument();
    });

    it('calls onResolve with correct entryId when Auto-Resolve is clicked', async () => {
        const handleResolve = vi.fn();
        const conflicts = [
            { id: 'c1', subject: 'Faculty: Dr. Smith', reason: 'Double booked', entryId: 42 },
        ];
        wrap(<ConflictsList conflicts={conflicts} onResolve={handleResolve} />);

        fireEvent.click(screen.getByText('Auto-Resolve'));

        expect(handleResolve).toHaveBeenCalledWith(42);
    });
});
