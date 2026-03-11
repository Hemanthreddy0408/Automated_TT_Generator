describe('Admin Features Workflow', () => {
    beforeEach(() => {
        cy.loginAdmin()
    })

    it('should navigate to History and test rollback UI', () => {
        cy.visit('/admin/history')
        cy.contains('Timetable Generation History').should('be.visible')

        cy.get('body').then($body => {
            if ($body.find('button:contains("Rollback")').length > 0) {
                cy.intercept('POST', '/api/history/rollback/*').as('rollback')
                cy.contains('button', 'Rollback').first().click()
                // Handle confirm dialog if present
                cy.contains('button', 'Confirm').click()
                cy.wait('@rollback').its('response.statusCode').should('be.oneOf', [200, 400]) // 400 if already checking out
            }
        });

    })

    it('should navigate to settings and be able to update admin profile', () => {
        cy.visit('/admin/settings')
        cy.contains('Admin Settings').should('be.visible')

        cy.get('input[name="name"]').clear().type('System Administrator')
        cy.get('button').contains('Save Changes').click()
    })
})
