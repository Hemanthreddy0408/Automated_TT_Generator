describe('Timetable Generation Workflow', () => {
    beforeEach(() => {
        cy.loginAdmin();
    });

    it('should generate a timetable successfully', () => {
        // Navigate to Timetable page
        cy.visit('/admin/timetable');

        cy.contains('h1', 'Timetable').should('be.visible');

        // Intercept the API call to generate timetable
        cy.intercept('POST', '/api/timetable/generate/*').as('generateTT');

        // Click "Generate Timetable" button (adjusting selector to match standard UI)
        cy.contains('button', 'Generate').click({ force: true });

        // Sometimes there might be a confirm dialog
        cy.get('body').then($body => {
            if ($body.find('button:contains("Confirm")').length > 0) {
                cy.contains('button', 'Confirm').click();
            }
        });

        // Wait for the backend response and verify status
        cy.wait('@generateTT', { timeout: 300000 }).its('response.statusCode').should('eq', 200);

        // Verify timetable matrix is populated
        // Checking for presence of cells
        cy.get('.timetable-grid, table, .grid').find('.bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50').should('have.length.greaterThan', 0);
    });
});
