const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
        supportFile: 'cypress/support/e2e.js',
        viewportWidth: 1280,
        viewportHeight: 800,
        defaultCommandTimeout: 10000,
        requestTimeout: 15000,
        env: {
            apiUrl: 'http://localhost:8083/api',
        },
        setupNodeEvents(on, config) {
            // Add custom Node event listeners here if needed
        },
    },
});
