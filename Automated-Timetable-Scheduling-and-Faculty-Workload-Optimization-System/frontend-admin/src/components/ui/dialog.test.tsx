import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './dialog';
import userEvent from '@testing-library/user-event';

describe('Dialog Component', () => {
    it('should render dialog trigger', () => {
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Test Dialog</DialogTitle>
                        <DialogDescription>This is a test dialog</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );

        expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('should open dialog when trigger is clicked', async () => {
        const user = userEvent.setup();

        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Test Dialog</DialogTitle>
                        <DialogDescription>Dialog Content Here</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );

        const trigger = screen.getByText('Open Dialog');
        await user.click(trigger);

        expect(screen.getByText('Test Dialog')).toBeInTheDocument();
        expect(screen.getByText('Dialog Content Here')).toBeInTheDocument();
    });

    it('should render dialog with title and description', async () => {
        const user = userEvent.setup();

        render(
            <Dialog>
                <DialogTrigger>Click Me</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Important Title</DialogTitle>
                        <DialogDescription>Important description text</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        );

        await user.click(screen.getByText('Click Me'));

        expect(screen.getByText('Important Title')).toBeInTheDocument();
        expect(screen.getByText('Important description text')).toBeInTheDocument();
    });

    it('should render custom content inside dialog', async () => {
        const user = userEvent.setup();

        render(
            <Dialog>
                <DialogTrigger>Open</DialogTrigger>
                <DialogContent>
                    <div data-testid="custom-content">Custom Content</div>
                </DialogContent>
            </Dialog>
        );

        await user.click(screen.getByText('Open'));

        expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
});
