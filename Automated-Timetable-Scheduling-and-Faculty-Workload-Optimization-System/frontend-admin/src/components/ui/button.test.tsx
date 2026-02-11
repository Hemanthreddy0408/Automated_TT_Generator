import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button Component', () => {
    it('should render button with text', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('should render button with default variant', () => {
        render(<Button variant="default">Default Button</Button>);
        const button = screen.getByRole('button', { name: /default button/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-primary');
    });

    it('should render button with destructive variant', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button', { name: /delete/i });
        expect(button).toHaveClass('bg-destructive');
    });

    it('should render disabled button', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button', { name: /disabled/i });
        expect(button).toBeDisabled();
    });

    it('should call onClick handler when clicked', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button', { name: /click me/i });
        await user.click(button);

        expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should not call onClick when disabled', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<Button onClick={handleClick} disabled>Disabled</Button>);

        const button = screen.getByRole('button', { name: /disabled/i });
        await user.click(button);

        expect(handleClick).not.toHaveBeenCalled();
    });

    it('should render button with small size', () => {
        render(<Button size="sm">Small Button</Button>);
        const button = screen.getByRole('button', { name: /small button/i });
        expect(button).toHaveClass('h-9');
    });

    it('should render button with large size', () => {
        render(<Button size="lg">Large Button</Button>);
        const button = screen.getByRole('button', { name: /large button/i });
        expect(button).toHaveClass('h-11');
    });
});
