// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/// <reference types="cypress" />

Cypress.Commands.add('loginAdmin', (email = 'pattemhemanth.04@gmail.com', password = 'password123') => {
    cy.visit('/login');
    // Check if we need to switch to admin tab
    cy.get('body').then(($body) => {
        // Find the tab trigger for Admin and click it if it exists
        if ($body.find('button[role="tab"]:contains("Admin")').length > 0) {
            cy.contains('button[role="tab"]', 'Admin').click();
        }
    });

    cy.get('input[type="email"], input[name="email"]').clear().type(email);
    cy.get('input[type="password"], input[name="password"]').clear().type(password);
    cy.get('button[type="submit"]').click();
    // Wait for dashboard to load
    cy.url({ timeout: 10000 }).should('include', '/admin');
});
