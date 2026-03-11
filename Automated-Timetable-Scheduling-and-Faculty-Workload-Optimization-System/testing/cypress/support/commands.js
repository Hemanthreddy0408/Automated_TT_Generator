// cypress/support/commands.js
// Reusable Cypress commands for all E2E tests

/**
 * cy.navigateTo(path) — navigate to a page and wait for it to be visible
 */
Cypress.Commands.add('navigateTo', (path) => {
    cy.visit(path);
    cy.get('body').should('be.visible');
});

/**
 * cy.waitForApiCall(alias) — wait for an intercepted network call
 */
Cypress.Commands.add('waitForApiCall', (alias) => {
    cy.wait(`@${alias}`, { timeout: 15000 });
});

/**
 * cy.interceptGenerateAll() — stub the generate-all endpoint
 */
Cypress.Commands.add('interceptGenerateAll', (fixture = 'timetable.json') => {
    cy.intercept('POST', '**/timetable/generate-all', { fixture }).as('generateAll');
});

/**
 * cy.interceptGetTimetable(sectionId) — stub timetable GET
 */
Cypress.Commands.add('interceptGetTimetable', (sectionId = '*') => {
    cy.intercept('GET', `**/timetable/${sectionId}`, { fixture: 'timetable.json' }).as('getTimetable');
});

/**
 * cy.interceptGetFaculty() — stub GET /faculty
 */
Cypress.Commands.add('interceptGetFaculty', () => {
    cy.intercept('GET', '**/faculty', { fixture: 'faculty.json' }).as('getFaculty');
});

/**
 * cy.interceptLeaveApprove(id) — stub leave approval
 */
Cypress.Commands.add('interceptLeaveApprove', (id) => {
    cy.intercept('PUT', `**/leaves/approve/${id}`, { statusCode: 200, body: {} }).as('approveLeave');
});
