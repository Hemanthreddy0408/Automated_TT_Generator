import './commands';
import 'cypress-mochawesome-reporter/register';

// Suppress uncaught exceptions from failing tests since we don't control 3rd-party component errors all the time
Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

beforeEach(() => {
    // Globally intercept the login API    // Also mock the Verify OTP response to auto-login
    cy.intercept('POST', '/api/auth/verify-otp', (req) => {
        // By intercepting this, any test that types an OTP and submits will 
        // automatically proceed as an authenticated user
        req.reply({
            statusCode: 200,
            body: {
                "token": "mock-jwt-token",
                "role": req.body.role ? req.body.role.toUpperCase() : "ADMIN",
                "userId": 1,
                "email": req.body.identifier || "admin@example.com",
                "name": "Test User"
            }
        });
    }).as('verifyOtpApi');
    cy.intercept('POST', '/api/auth/login', (req) => {
        // If it's a login request, we force a successful response with token instead of triggering OTP
        req.reply({
            statusCode: 200,
            body: {
                success: true,
                user: {
                    id: 999,
                    identifier: req.body.identifier,
                    role: req.body.role,
                    name: "Cypress Tester"
                },
                token: "fake-jwt-token"
            }
        });
    });
});
