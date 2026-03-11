import { loginAdmin } from '../support/auth';

describe('Timetable Generation Workflow', () => {
    beforeEach(() => {
        loginAdmin();
    });

    it('should generate a timetable successfully', () => {
        cy.visit('/admin/timetable');
        cy.url().should('include', 'sectionId=');

        cy.intercept('POST', '**/api/timetable/generate/**').as('generateTT');

        cy.get('button').contains('Generate Section').not(':contains("All")').should('not.be.disabled').scrollIntoView().click();

        // Wait for the generation API call to complete (with a 5 min timeout)
        cy.wait('@generateTT', { timeout: 300000 }).then((interception) => {
            expect(interception.response?.statusCode).to.eq(200);
        });

        // Verify timetable matrix is populated
        // Checking for presence of cells
        cy.get('.timetable-grid, table, .grid').find('.bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50').should('have.length.greaterThan', 0);
    });
});
