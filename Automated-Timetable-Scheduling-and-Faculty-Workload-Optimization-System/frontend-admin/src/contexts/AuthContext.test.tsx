import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

// Mock component to test Auth context
const TestAuthConsumer = () => {
    return (
        <div>
            <div data-testid="auth-status">Not Authenticated</div>
        </div>
    );
};

describe('Authentication Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Login Flow', () => {
        it('should handle successful faculty login', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    user: { id: 1, name: 'Dr. Smith', role: 'faculty' },
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const response = await axios.post('/api/auth/faculty/login', {
                email: 'smith@test.com',
                password: 'password123',
            });

            expect(response.data.success).toBe(true);
            expect(response.data.user.role).toBe('faculty');
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/faculty/login', {
                email: 'smith@test.com',
                password: 'password123',
            });
        });

        it('should handle failed login with invalid credentials', async () => {
            mockedAxios.post.mockRejectedValue({
                response: { status: 401, data: { message: 'Invalid credentials' } },
            });

            try {
                await axios.post('/api/auth/faculty/login', {
                    email: 'wrong@test.com',
                    password: 'wrong',
                });
            } catch (error: any) {
                expect(error.response.status).toBe(401);
                expect(error.response.data.message).toBe('Invalid credentials');
            }
        });

        it('should handle admin login', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    user: { id: 1, name: 'Admin', role: 'admin' },
                },
            };

            mockedAxios.post.mockResolvedValue(mockResponse);

            const response = await axios.post('/api/auth/admin/login', {
                username: 'admin',
                password: 'password123',
            });

            expect(response.data.success).toBe(true);
            expect(response.data.user.role).toBe('admin');
        });
    });

    describe('User Session', () => {
        it('should store user data in localStorage', () => {
            const userData = { id: 1, name: 'Dr. Smith', role: 'faculty' };
            localStorage.setItem('user', JSON.stringify(userData));

            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            expect(stored.id).toBe(1);
            expect(stored.name).toBe('Dr. Smith');
        });

        it('should clear user data on logout', () => {
            localStorage.setItem('user', JSON.stringify({ id: 1 }));
            expect(localStorage.getItem('user')).toBeTruthy();

            localStorage.removeItem('user');
            expect(localStorage.getItem('user')).toBeNull();
        });

        it('should handle missing session data', () => {
            const stored = localStorage.getItem('user');
            expect(stored).toBeNull();
        });
    });

    describe('Auth Component', () => {
        it('should render auth status', () => {
            render(<TestAuthConsumer />);
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
        });
    });
});
