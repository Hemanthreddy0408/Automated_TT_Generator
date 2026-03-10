const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            require('cypress-mochawesome-reporter/plugin')(on);
        },
        baseUrl: "http://localhost:5173",
        reporter: 'cypress-mochawesome-reporter',
        reporterOptions: {
            reportDir: 'cypress/reports',
            charts: true,
            reportPageTitle: 'Automated Timetable E2E Test Report',
            embeddedScreenshots: true,
            inlineAssets: true,
            saveAllAttempts: false,
        },
        video: false,
        screenshotOnRunFailure: true,
        viewportWidth: 1280,
        viewportHeight: 720,
    },
});
