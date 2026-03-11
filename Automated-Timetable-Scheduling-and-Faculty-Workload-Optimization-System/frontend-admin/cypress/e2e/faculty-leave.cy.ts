import { loginAdmin, loginFaculty } from '../support/auth';

describe('Faculty Leave Management', () => {
    it('should allow faculty to submit leave and admin to approve', () => {
        // 1. Faculty applies for leave
        loginFaculty()

        cy.contains('Faculty Portal').should('be.visible')

        cy.contains('Leave').click({ force: true }) // Navigate to leave

        // Intercept post
        cy.intercept('POST', '/api/leaves').as('applyLeave')

        // Fill form (Assuming standard form fields)
        cy.get('button').contains('Apply Leave', { matchCase: false }).click({ force: true })
        cy.get('input[type="date"]').first().type('2024-11-20') // Example dates
        cy.get('input[type="date"]').last().type('2024-11-21')
        cy.get('textarea').type('Medical leave')
        cy.get('button').contains('Submit', { matchCase: false }).click({ force: true })

        // 2. Admin logs in and approves
        cy.clearCookies()
        // Admin Side: Check approval
        loginAdmin()
        cy.visit('/admin/leaves')
        cy.url().should('include', '/admin/leaves')
        cy.contains('Ravi').first().scrollIntoView().should('be.visible')

        cy.contains('Ravi').first().parents('tr').within(() => {
            cy.get('span').contains(/pending/i).should('be.visible')
            cy.get('button').contains('Approve').click({ force: true })
        })

        // Wait for the UI toast instead of brittle network intercept
        cy.contains('Leave request approved successfully', { timeout: 10000 }).should('be.visible')
    })
})
