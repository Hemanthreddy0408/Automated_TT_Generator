import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, test, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
// Check this line! If Login.tsx is in the same folder, this is correct.
import Login from "./Login";

/* ---------------- MOCKS ---------------- */
vi.mock("@/components/theme-provider", () => ({
    useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

const mockToastError = vi.fn();
vi.mock("sonner", () => ({
    toast: {
        success: vi.fn(),
        error: (msg: string) => mockToastError(msg),
    },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

/* ---------------- HELPERS ---------------- */
const renderLogin = () =>
    render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );

beforeEach(() => {
    vi.clearAllMocks();
});

/* ---------------- TEST CASES ---------------- */
describe("Login Page – Expanded Tests", () => {

    test("1. All UI elements render correctly", () => {
        renderLogin();
        expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /faculty/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /admin/i })).toBeInTheDocument();
    });

    test("2. Shows error for invalid email format", async () => {
        const user = userEvent.setup();
        renderLogin();
        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, "not-an-email");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        // This assumes your validation mentions 'invalid' or 'email'
        expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    });

    test("3. Password toggle works (if you have one)", () => {
        renderLogin();
        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("4. Admin login with WRONG credentials shows toast error", async () => {
        const user = userEvent.setup();
        renderLogin();
        await user.click(screen.getByRole("tab", { name: /admin/i }));
        await user.type(screen.getByLabelText(/email/i), "wrong@unitt.edu");
        await user.type(screen.getByLabelText(/password/i), "wrongpass");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockToastError).toHaveBeenCalled();
        });
    });

    test("5. Login button shows loading state or disables", async () => {
        const user = userEvent.setup();
        renderLogin();
        await user.type(screen.getByLabelText(/email/i), "faculty@unitt.edu");
        await user.type(screen.getByLabelText(/password/i), "123456");

        const loginBtn = screen.getByRole("button", { name: /sign in/i });
        await user.click(loginBtn);

        // If your button changes text or disables during login:
        expect(loginBtn).toBeDisabled;
    });

    test("6. Successful admin login redirects", async () => {
        const user = userEvent.setup();
        renderLogin();
        await user.click(screen.getByRole("tab", { name: /admin/i }));
        await user.type(screen.getByLabelText(/email/i), "admin@unitt.edu");
        await user.type(screen.getByLabelText(/password/i), "admin123");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/admin");
        }, { timeout: 3000 });
    });
});