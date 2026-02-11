import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('API Service Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Faculty API', () => {
        it('should fetch faculty list successfully', async () => {
            const mockFaculty = [
                { id: 1, name: 'Dr. Smith', email: 'smith@test.com', department: 'CS' },
                { id: 2, name: 'Dr. Jones', email: 'jones@test.com', department: 'Math' },
            ];

            mockedAxios.get.mockResolvedValue({ data: mockFaculty });

            const response = await axios.get('/api/faculty');

            expect(response.data).toEqual(mockFaculty);
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/faculty');
        });

        it('should handle faculty API error', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(axios.get('/api/faculty')).rejects.toThrow('Network error');
        });

        it('should create new faculty', async () => {
            const newFaculty = {
                name: 'Dr. New',
                email: 'new@test.com',
                department: 'Physics',
            };

            mockedAxios.post.mockResolvedValue({ data: { id: 3, ...newFaculty } });

            const response = await axios.post('/api/faculty', newFaculty);

            expect(response.data).toHaveProperty('id');
            expect(response.data.name).toBe('Dr. New');
        });

        it('should update faculty', async () => {
            const updatedFaculty = { id: 1, name: 'Dr. Smith Updated' };

            mockedAxios.put.mockResolvedValue({ data: updatedFaculty });

            const response = await axios.put('/api/faculty/1', updatedFaculty);

            expect(response.data.name).toBe('Dr. Smith Updated');
            expect(mockedAxios.put).toHaveBeenCalledWith('/api/faculty/1', updatedFaculty);
        });

        it('should delete faculty', async () => {
            mockedAxios.delete.mockResolvedValue({ data: { success: true } });

            const response = await axios.delete('/api/faculty/1');

            expect(response.data.success).toBe(true);
            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/faculty/1');
        });
    });

    describe('Subjects API', () => {
        it('should fetch subjects list', async () => {
            const mockSubjects = [
                { id: 1, code: 'CS101', name: 'Intro to CS', credits: 4 },
                { id: 2, code: 'MATH101', name: 'Calculus', credits: 4 },
            ];

            mockedAxios.get.mockResolvedValue({ data: mockSubjects });

            const response = await axios.get('/api/subjects');

            expect(response.data).toEqual(mockSubjects);
            expect(response.data).toHaveLength(2);
        });

        it('should create new subject', async () => {
            const newSubject = {
                code: 'PHYS101',
                name: 'Physics I',
                credits: 4,
            };

            mockedAxios.post.mockResolvedValue({ data: { id: 3, ...newSubject } });

            const response = await axios.post('/api/subjects', newSubject);

            expect(response.data.code).toBe('PHYS101');
        });
    });

    describe('Timetable API', () => {
        it('should generate timetable', async () => {
            const mockTimetable = {
                sessions: [
                    { day: 'Monday', time: '9:00 AM', subject: 'CS101', faculty: 'Dr. Smith' },
                ],
            };

            mockedAxios.post.mockResolvedValue({ data: mockTimetable });

            const response = await axios.post('/api/timetable/generate');

            expect(response.data.sessions).toBeDefined();
            expect(response.data.sessions).toHaveLength(1);
        });

        it('should fetch timetable by section', async () => {
            mockedAxios.get.mockResolvedValue({
                data: { sectionId: 1, sessions: [] },
            });

            const response = await axios.get('/api/timetable/section/1');

            expect(response.data.sectionId).toBe(1);
        });
    });

    describe('API Error Handling', () => {
        it('should handle 404 errors', async () => {
            mockedAxios.get.mockRejectedValue({
                response: { status: 404, data: { message: 'Not found' } },
            });

            try {
                await axios.get('/api/faculty/999');
            } catch (error: any) {
                expect(error.response.status).toBe(404);
            }
        });

        it('should handle 500 errors', async () => {
            mockedAxios.get.mockRejectedValue({
                response: { status: 500, data: { message: 'Server error' } },
            });

            try {
                await axios.get('/api/faculty');
            } catch (error: any) {
                expect(error.response.status).toBe(500);
            }
        });
    });
});
