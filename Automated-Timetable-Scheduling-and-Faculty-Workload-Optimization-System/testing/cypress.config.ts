import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            require('cypress-mochawesome-reporter/plugin')(on);
        },
        baseUrl: "http://localhost:5173", // Assuming default Vite port for React
        supportFile: "cypress/support/e2e.ts",
        specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
        video: false,
        screenshotOnRunFailure: true,
    },
    reporter: "cypress-mochawesome-reporter",
    reporterOptions: {
        reportDir: "cypress/reports",
        charts: true,
        reportPageTitle: "E2E Test Report",
        embeddedScreenshots: true,
        inlineAssets: true,
    },
});
