// cypress/support/e2e.js
// Global test lifecycle and custom commands
import './commands';

// Suppress known Vite HMR WebSocket errors in test output
Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('WebSocket') || err.message.includes('ResizeObserver')) {
        return false;
    }
    return true;
});
