# End-to-End Testing Documentation

This directory contains the automated End-to-End (E2E) testing framework for the Automated Timetable Scheduling and Faculty Workload Optimization System.

## Architecture Let
We use **Cypress** to perform full browser-based testing, validating the actual user workflows from the frontend UI to the backend API and Database. Tests are written in TypeScript for type safety and maintainability.

## Directory Structure
- `cypress/e2e/`: Contains all the individual test specifications.
  - `login.cy.ts`: Admin login tests
  - `faculty-login.cy.ts`: Faculty login tests
  - `timetable-generation.cy.ts`: Tests the core generation workflow
  - `faculty-leave.cy.ts`: Tests the leave request and approval flow
  - `timetable-optimization.cy.ts`: Tests timetable adjusting after a leave
  - `admin-features.cy.ts`: Tests history, rollback, and settings
  - `download-timetable.cy.ts`: Tests timetable export features
  - `notifications.cy.ts`: Tests the notification delivery system
- `cypress/support/`: Contains custom Cypress commands (`loginAdmin`), globals, and event listeners.
- `cypress/fixtures/`: Auto-generated stubs or test data JSON files.
- `cypress/reports/`: (Generated upon run) Contains Mochawesome HTML reports.

## Prerequisites
To run the tests, the frontend development server and backend Spring Boot server MUST be running.

```bash
# Start Backend
cd backend/scheduler
mvn spring-boot:run

# Start Frontend
cd frontend-admin
npm run dev
```

## Running the Tests

1. Navigate to the frontend-admin directory:
   ```bash
   cd frontend-admin
   ```

2. To run tests in **headless mode** (ideal for CI/CD):
   ```bash
   npx cypress run
   ```
   *Reports will be automatically generated in `frontend-admin/cypress/reports/html/index.html`.*

3. To open the **Cypress UI Test Runner** (ideal for development/debugging):
   ```bash
   npx cypress open
   ```
   *Select E2E Testing, choose your preferred browser, and click on any test file to watch it execute.*

## Reporting
We use `cypress-mochawesome-reporter`. After running `npx cypress run`, a full HTML report with embedded screenshots (for failed tests) will be generated. Open `cypress/reports/html/index.html` in your browser to view it.
