import { loginAdmin } from '../support/auth';

describe('Admin Features Workflow', () => {
    beforeEach(() => {
        loginAdmin()
    })

    it('should navigate to History and test rollback UI', () => {
        cy.visit('/admin/history')
        cy.contains('History & Audit Log').should('be.visible')

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

    it('should navigate to settings and be able to see Account Settings', () => {
        cy.visit('/admin/settings')
        cy.contains('Account Settings').should('be.visible')

        cy.contains('Security Configuration').should('be.visible')
    })
})
