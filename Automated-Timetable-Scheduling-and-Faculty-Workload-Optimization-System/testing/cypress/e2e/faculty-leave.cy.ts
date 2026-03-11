describe('Faculty Leave Management', () => {
    it('should allow faculty to submit leave and admin to approve', () => {
        // 1. Faculty applies for leave
        cy.visit('/login')
        cy.get('button[role="tab"]').contains('Faculty').click()
        cy.get('input[type="email"], input[name="email"]').type('ravi.kumar@university.edu')
        cy.get('input[type="password"], input[name="password"]').type('faculty123')
        cy.get('button[type="submit"]').click()

        cy.url().should('include', '/faculty')

        cy.contains('Leave').click({ force: true }) // Navigate to leave

        // Intercept post
        cy.intercept('POST', '/api/leaves').as('applyLeave')

        // Fill form (Assuming standard form fields)
        cy.get('button').contains('Apply for Leave', { matchCase: false }).click({ force: true })
        cy.get('input[type="date"]').first().type('2024-11-20') // Example dates
        cy.get('input[type="date"]').last().type('2024-11-21')
        cy.get('textarea').type('Medical leave')
        cy.get('button').contains('Submit', { matchCase: false }).click({ force: true })

        // 2. Admin logs in and approves
        cy.clearCookies()
        cy.loginAdmin()
        cy.visit('/admin/leave-requests')

        cy.contains('ravi.kumar@university.edu', { matchCase: false }).should('be.visible')

        cy.intercept('PUT', '/api/leaves/*/status').as('approveLeave')

        // Click approve button on the first pending request
        cy.get('button').contains('Approve').first().click({ force: true })
        cy.wait('@approveLeave').its('response.statusCode').should('eq', 200)

        cy.contains('Approved').should('be.visible')
    })
})
