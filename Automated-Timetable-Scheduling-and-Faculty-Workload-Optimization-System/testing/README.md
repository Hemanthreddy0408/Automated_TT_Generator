# E2E Cypress Testing Suite

This folder contains the complete, automated End-to-End browser testing suite for the **Automated Timetable Scheduling and Faculty Workload Optimization System**.

## Prerequisites
- The Spring Boot backend must be running locally on `http://localhost:8080`.
- The Admin frontend must be running locally on `http://localhost:5173`.
- The Faculty frontend must be running locally on `http://localhost:5174`.

## Running the Tests

To open the interactive Cypress GUI (recommended for debugging):
```bash
npx cypress open
```

To run all tests headlessly in the terminal:
```bash
npx cypress run
```

## Folder Structure
- `/cypress/e2e`: Contains the actual test specifications covering all core system features (Login, Generation, Optimization, Faculty Leaves, Notifications, etc.)
- `/cypress/fixtures`: Contains mock data (`test-data.json`) injected into tests.
- `/cypress/support`: Contains custom Cypress commands (e.g. `cy.loginAdmin()` overrides).
- `/cypress.config.js`: The central configuration mapping baseUrl and the Mochawesome reporter.

## Test Reports
After running the tests headlessly, Cypress will automatically generate an HTML report using `cypress-mochawesome-reporter`.
You can find the interactive test results in:
`cypress/reports/index.html`
