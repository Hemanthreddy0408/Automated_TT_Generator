// src/tests/api/api.test.ts
// Tests API helper functions — verifies all expected functions are exported

import { describe, it, expect, vi } from 'vitest';

// Mock axios before importing API module
vi.mock('axios', () => ({
    default: {
        create: () => ({
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
        }),
    },
}));

const apiModule = await import('@/lib/api');

describe('API Helper Functions — export smoke tests', () => {
    // Timetable
    it('getTimetable is exported', () => expect(typeof apiModule.getTimetable).toBe('function'));
    it('getAllTimetableEntries is exported', () => expect(typeof apiModule.getAllTimetableEntries).toBe('function'));
    it('generateTimetable is exported', () => expect(typeof apiModule.generateTimetable).toBe('function'));
    it('generateAllTimetables is exported', () => expect(typeof apiModule.generateAllTimetables).toBe('function'));
    it('resolveConflict is exported', () => expect(typeof apiModule.resolveConflict).toBe('function'));

    // Faculty
    it('getFaculty is exported', () => expect(typeof apiModule.getFaculty).toBe('function'));
    it('createFaculty is exported', () => expect(typeof apiModule.createFaculty).toBe('function'));
    it('deleteFaculty is exported', () => expect(typeof apiModule.deleteFaculty).toBe('function'));
    it('getFacultyWorkloadSummary is exported', () => expect(typeof apiModule.getFacultyWorkloadSummary).toBe('function'));

    // Rooms
    it('getRooms is exported', () => expect(typeof apiModule.getRooms).toBe('function'));
    it('createRoom is exported', () => expect(typeof apiModule.createRoom).toBe('function'));

    // Sections
    it('getSections is exported', () => expect(typeof apiModule.getSections).toBe('function'));

    // Leave
    it('optimizeForLeave is exported', () => expect(typeof apiModule.optimizeForLeave).toBe('function'));

    // Notifications
    it('getNotifications is exported', () => expect(typeof apiModule.getNotifications).toBe('function'));
    it('markNotificationsRead is exported', () => expect(typeof apiModule.markNotificationsRead).toBe('function'));

    // Auth
    it('loginUser is exported', () => expect(typeof apiModule.loginUser).toBe('function'));
    it('logout is exported', () => expect(typeof apiModule.logout).toBe('function'));

    // Electives
    it('getElectives is exported', () => expect(typeof apiModule.getElectives).toBe('function'));
});
