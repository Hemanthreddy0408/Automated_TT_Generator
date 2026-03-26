import { defineConfig } from "cypress";
// @ts-expect-error - The reporter doesn't have types but this is the correct way to import in ESM
import mochawesomeReporter from 'cypress-mochawesome-reporter/plugin';

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            mochawesomeReporter(on);
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
