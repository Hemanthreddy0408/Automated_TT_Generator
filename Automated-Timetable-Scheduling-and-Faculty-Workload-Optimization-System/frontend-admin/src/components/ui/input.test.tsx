import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input Component', () => {
    it('should render input field', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText(/enter text/i);
        expect(input).toBeInTheDocument();
    });

    it('should accept user input', async () => {
        const user = userEvent.setup();
        render(<Input placeholder="Type here" />);

        const input = screen.getByPlaceholderText(/type here/i);
        await user.type(input, 'Hello World');

        expect(input).toHaveValue('Hello World');
    });

    it('should render disabled input', () => {
        render(<Input disabled placeholder="Disabled" />);
        const input = screen.getByPlaceholderText(/disabled/i);
        expect(input).toBeDisabled();
    });

    it('should not accept input when disabled', async () => {
        const user = userEvent.setup();
        render(<Input disabled placeholder="Disabled" />);

        const input = screen.getByPlaceholderText(/disabled/i);
        await user.type(input, 'Test');

        expect(input).toHaveValue('');
    });

    it('should call onChange handler', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();

        render(<Input onChange={handleChange} placeholder="Change test" />);

        const input = screen.getByPlaceholderText(/change test/i);
        await user.type(input, 'A');

        expect(handleChange).toHaveBeenCalled();
    });

    it('should render with specific type', () => {
        render(<Input type="email" placeholder="Email" />);
        const input = screen.getByPlaceholderText(/email/i);
        expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
        render(<Input type="password" placeholder="Password" />);
        const input = screen.getByPlaceholderText(/password/i);
        expect(input).toHaveAttribute('type', 'password');
    });
});
