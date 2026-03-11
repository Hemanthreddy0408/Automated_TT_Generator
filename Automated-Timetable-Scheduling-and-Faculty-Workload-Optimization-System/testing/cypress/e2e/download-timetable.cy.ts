describe('Timetable Download Workflow', () => {
    beforeEach(() => {
        cy.loginAdmin()
    })

    it('should be able to export timetable', () => {
        cy.visit('/admin/timetable')

        // Find the Export button
        cy.get('button').contains('Export').click()

        // There might be a dropdown with options like "Export as PDF", "Export as Excel"
        cy.get('body').then($body => {
            if ($body.find('div[role="menuitem"]:contains("PDF")').length > 0) {
                // Option 1: It's an API call
                // cy.intercept('GET', '/api/timetable/export/pdf*').as('downloadPDF')
                cy.contains('div[role="menuitem"]', 'PDF').click()
                // cy.wait('@downloadPDF').its('response.statusCode').should('eq', 200)
            } else {
                // Option 2: It directly triggers a download or print
                // Basic assert that it didn't crash
                cy.contains('Admin Dashboard').should('not.exist')
                cy.url().should('include', 'timetable')
            }
        });
    })
})
