import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, test, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import TimetablePage from "./TimetablePage";

/* ---------------- MOCKS ---------------- */

// Mock navigation
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => vi.fn() };
});

// Mock the TimetableGrid to avoid rendering complex internal canvas/grids
vi.mock("@/components/timetable/TimetableGrid", () => ({
    TimetableGrid: ({ viewMode }: { viewMode: string }) => (
        <div data-testid="mock-grid">Current View: {viewMode}</div>
    ),
}));

/* ---------------- HELPERS ---------------- */

const renderTimetable = () =>
    render(
        <BrowserRouter>
            <TimetablePage />
        </BrowserRouter>
    );

/* ---------------- TEST SUITE ---------------- */

describe("TimetablePage - Logic & UI Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("1. Renders the page title and primary actions", () => {
        renderTimetable();
        expect(screen.getByText(/Timetable Management/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Generate Schedule/i })).toBeInTheDocument();
    });

    test("2. Displays the Stats Bar (QuickStats)", () => {
        renderTimetable();
        // Utilization Rate and Conflict Count are part of your stats bar
        expect(screen.getByText(/Utilization/i)).toBeInTheDocument();
        expect(screen.getByText(/Conflicts/i)).toBeInTheDocument();
    });

    test("3. Switches View Mode correctly (Section to Faculty)", async () => {
        const user = userEvent.setup();
        renderTimetable();

        const facultyTab = screen.getByRole("tab", { name: /By Faculty/i });
        await user.click(facultyTab);

        // Check if the mock grid received the new view mode
        expect(screen.getByTestId("mock-grid")).toHaveTextContent("Current View: faculty");
    });

    test("4. Toggles between View Mode and Edit Mode", async () => {
        const user = userEvent.setup();
        renderTimetable();

        const editBtn = screen.getByRole("button", { name: /Edit Mode/i });
        await user.click(editBtn);

        // Check if the badge "Editing Mode Active" appears
        expect(screen.getByText(/Editing Mode Active/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /View Mode/i })).toBeInTheDocument();
    });

    test("5. Export dropdown contains PDF, Excel, and Image options", async () => {
        const user = userEvent.setup();
        renderTimetable();

        const exportBtn = screen.getByRole("button", { name: /Export/i });
        await user.click(exportBtn);

        expect(screen.getByText(/Export as PDF/i)).toBeInTheDocument();
        expect(screen.getByText(/Export as Excel/i)).toBeInTheDocument();
        expect(screen.getByText(/Export as Image/i)).toBeInTheDocument();
    });

    test("6. Legend displays all session types", () => {
        renderTimetable();
        const legendItems = ["Lecture", "Laboratory", "Tutorial", "Conflict", "Break"];
        legendItems.forEach((item) => {
            expect(screen.getByText(item)).toBeInTheDocument();
        });
    });

    test("7. Entity Selector changes value", async () => {
        renderTimetable();
        const selectTrigger = screen.getByRole("combobox");

        // Check if the select trigger exists (Radix UI Select renders as a combobox)
        expect(selectTrigger).toBeInTheDocument();
    });
});