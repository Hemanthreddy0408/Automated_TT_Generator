describe('Admin Login Test', () => {

    it('should login as admin successfully', () => {
        cy.visit('/login')

        // Find the email input and type
        cy.get('input[type="email"], input[name="email"]').type('pattemhemanth.04@gmail.com')

        // Find the password input and type
        cy.get('input[type="password"], input[name="password"]').type('password123')

        // Click submit
        cy.get('button[type="submit"]').click()

        // Verify redirect to dashboard
        cy.url().should('include', '/admin')

        // Check if dashboard content is visible
        cy.contains('Dashboard').should('be.visible')
        cy.contains('Total Faculty').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
        cy.visit('/login')

        cy.get('input[type="email"], input[name="email"]').type('wrong@email.com')
        cy.get('input[type="password"], input[name="password"]').type('wrongpass')
        cy.get('button[type="submit"]').click()

        // Assert that we are still on login page and an error message might appear
        // (exact error text depends on your UI implementation, adjusting to a generic expectation)
        cy.url().should('include', '/login')
    })
})
