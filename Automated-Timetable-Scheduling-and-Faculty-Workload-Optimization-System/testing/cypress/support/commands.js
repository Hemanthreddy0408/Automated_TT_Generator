import 'cypress-file-upload';
import '@testing-library/cypress/add-commands';

Cypress.Commands.add('loginAdmin', (email, password) => {
    cy.visit('/login');
    cy.get('input[type="text"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('loginFaculty', (email, password) => {
    cy.visit('http://localhost:5174/login'); // Default faculty port
    cy.get('input[type="text"], input[name="email"]').type(email);
    cy.get('input[type="password"], input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
});
