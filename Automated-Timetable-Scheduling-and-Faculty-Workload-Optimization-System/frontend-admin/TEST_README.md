# Frontend Testing Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Test Commands](#test-commands)
- [Test Cases](#test-cases)
- [Running Tests](#running-tests)

---

## Overview

This project uses **Vitest** with **React Testing Library** for comprehensive frontend testing.

### Testing Stack
- **Test Runner**: Vitest (Jest-compatible API)
- **Testing Library**: React Testing Library
- **Environment**: jsdom (browser simulation)
- **Assertion Library**: Vitest expect (Jest-compatible)

---

## Quick Start

### Prerequisites
```bash
cd frontend-admin
npm install
```

### Configuration
Tests are configured in `vitest.config.ts`:
- Environment: jsdom
- Setup file: `src/test/setup.ts`
- Test pattern: `**/*.{test,spec}.{ts,tsx}`

---

## Test Commands

```bash
# Run all tests once
npm run test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test -- --coverage

# Run specific test file
npm run test src/components/Button.test.tsx

# Run tests matching a pattern
npm run test -- --grep "should render"

# Run tests in UI mode (interactive browser interface)
npx vitest --ui

# Run tests with verbose output
npm run test -- --reporter=verbose
```

---

## Test Cases

### Test Case 1: Button Component Rendering

**Location**: `src/components/ui/button.test.tsx`

**Purpose**: Verify that the Button component renders correctly with different variants and sizes.

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from './button';
import { describe, it, expect } from 'vitest';

describe('Button Component', () => {
  it('should render button with default variant', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should render button with primary variant', () => {
    render(<Button variant="default">Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('bg-primary');
  });

  it('should render disabled button', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
  });
});
```

**Run this test**:
```bash
npm run test src/components/ui/button.test.tsx
```

---

### Test Case 2: User Interaction - Click Handler

**Location**: `src/components/ui/button-click.test.tsx`

**Purpose**: Test user interactions and event handlers.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';
import { describe, it, expect, vi } from 'vitest';

describe('Button Click Interaction', () => {
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
});
```

**Run this test**:
```bash
npm run test src/components/ui/button-click.test.tsx
```

---

### Test Case 3: Form Input Validation

**Location**: `src/components/forms/login-form.test.tsx`

**Purpose**: Test form input validation and submission.

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './login-form';
import { describe, it, expect, vi } from 'vitest';

describe('Login Form Validation', () => {
  it('should show validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid credentials', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'admin@acadschedule.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'admin@acadschedule.com',
        password: 'password123',
      });
    });
  });
});
```

**Run this test**:
```bash
npm run test src/components/forms/login-form.test.tsx
```

---

### Test Case 4: API Integration with Mocking

**Location**: `src/services/faculty.test.tsx`

**Purpose**: Test API calls with mocked responses.

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { FacultyList } from '../components/FacultyList';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('Faculty API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and display faculty list', async () => {
    const mockFaculty = [
      { id: 1, name: 'Dr. Smith', department: 'Computer Science' },
      { id: 2, name: 'Dr. Jones', department: 'Mathematics' },
    ];

    axios.get.mockResolvedValue({ data: mockFaculty });

    render(<FacultyList />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
      expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalledWith('/api/faculty');
  });

  it('should display error message when API fails', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    render(<FacultyList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load faculty/i)).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));

    render(<FacultyList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

**Run this test**:
```bash
npm run test src/services/faculty.test.tsx
```

---

### Test Case 5: React Router Navigation

**Location**: `src/components/navigation/sidebar.test.tsx`

**Purpose**: Test routing and navigation components.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { describe, it, expect } from 'vitest';

describe('Sidebar Navigation', () => {
  it('should render navigation links', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/faculty/i)).toBeInTheDocument();
    expect(screen.getByText(/timetable/i)).toBeInTheDocument();
  });

  it('should navigate to faculty page on link click', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar />
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/faculty" element={<div>Faculty Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const facultyLink = screen.getByRole('link', { name: /faculty/i });
    await user.click(facultyLink);

    expect(screen.getByText('Faculty Page')).toBeInTheDocument();
  });

  it('should highlight active navigation item', () => {
    render(
      <MemoryRouter initialEntries={['/faculty']}>
        <Sidebar />
      </MemoryRouter>
    );

    const facultyLink = screen.getByRole('link', { name: /faculty/i });
    expect(facultyLink).toHaveClass('active');
  });
});
```

**Run this test**:
```bash
npm run test src/components/navigation/sidebar.test.tsx
```

---

### Test Case 6: Data Table Rendering and Filtering

**Location**: `src/components/tables/data-table.test.tsx`

**Purpose**: Test table rendering, pagination, and filtering.

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './data-table';
import { describe, it, expect } from 'vitest';

describe('Data Table Component', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Faculty' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Faculty' },
  ];

  it('should render table with data', () => {
    render(<DataTable data={mockData} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should filter data based on search input', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'Jane');

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('should sort table by column', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} />);

    const nameHeader = screen.getByRole('button', { name: /name/i });
    await user.click(nameHeader);

    const rows = screen.getAllByRole('row');
    const firstRow = within(rows[1]).getByText('Bob Johnson');
    expect(firstRow).toBeInTheDocument();
  });

  it('should display empty state when no data', () => {
    render(<DataTable data={[]} />);
    expect(screen.getByText(/no results/i)).toBeInTheDocument();
  });
});
```

**Run this test**:
```bash
npm run test src/components/tables/data-table.test.tsx
```

---

### Test Case 7: Custom Hooks Testing

**Location**: `src/hooks/useAuth.test.tsx`

**Purpose**: Test custom React hooks.

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios');

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user successfully', async () => {
    const mockUser = { id: 1, name: 'Admin', role: 'admin' };
    axios.post.mockResolvedValue({ data: { success: true, user: mockUser } });

    const { result } = renderHook(() => useAuth());

    await waitFor(async () => {
      await result.current.login('admin@test.com', 'password123');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should logout user', async () => {
    const { result } = renderHook(() => useAuth());

    // Set initial authenticated state
    result.current.user = { id: 1, name: 'Admin' };
    
    await waitFor(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login failure', async () => {
    axios.post.mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth());

    await expect(
      result.current.login('wrong@test.com', 'wrong')
    ).rejects.toThrow('Invalid credentials');

    expect(result.current.user).toBeNull();
  });
});
```

**Run this test**:
```bash
npm run test src/hooks/useAuth.test.tsx
```

---

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test Suite
```bash
npm run test button.test.tsx
```

### Generate Coverage Report
```bash
npm run test -- --coverage
```

This will generate a coverage report showing:
- Line coverage
- Function coverage
- Branch coverage
- Statement coverage

---

## Best Practices

1. **Test user behavior, not implementation details**
2. **Use semantic queries** (`getByRole`, `getByLabelText`)
3. **Mock external dependencies** (API calls, localStorage)
4. **Keep tests isolated** - each test should run independently
5. **Use descriptive test names** - clearly state what's being tested
6. **Follow AAA pattern** - Arrange, Act, Assert

---

## Troubleshooting

### Tests not running?
- Ensure you're in the `frontend-admin` directory
- Run `npm install` to install dependencies

### Mock not working?
- Clear mock calls with `vi.clearAllMocks()` in `beforeEach`
- Verify mock is defined before the component renders

### Timeout errors?
- Increase timeout: `npm run test -- --testTimeout=10000`
- Check for infinite loops or missing async/await

---

**Version**: 1.0.0  
**Last Updated**: February 2026
