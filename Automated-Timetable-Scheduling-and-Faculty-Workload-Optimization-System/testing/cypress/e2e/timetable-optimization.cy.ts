describe('Timetable Optimization Workflow', () => {
    beforeEach(() => {
        cy.loginAdmin();
    });

    it('should optimize the timetable and view changes', () => {
        // Note: Assuming a faculty has already taken leave in DB for this test
        cy.visit('/admin/dashboard');

        // Intercept the API call to get optimization changes
        cy.intercept('GET', '/api/timetable/optimization-changes').as('getChanges');

        // Look for a generate or optimize button or view changes
        cy.get('button').contains('View Changes').click({ force: true });

        cy.wait('@getChanges').its('response.statusCode').should('eq', 200);

        // Verify changes modal shows some data
        cy.contains('Optimization Changes').should('be.visible');
        // Ensure the table contains "New Faculty" assignment
        cy.contains('th', 'New Faculty').should('be.visible');
    });
});
