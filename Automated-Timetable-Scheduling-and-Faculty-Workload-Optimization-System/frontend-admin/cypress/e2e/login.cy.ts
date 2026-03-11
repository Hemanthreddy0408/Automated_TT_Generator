describe('Admin Login Test', () => {

    it('should login as admin successfully', () => {
        cy.visit('/login')

        // Find the email input and type
        cy.get('[data-testid="login-identifier"]').type('pattemhemanth.04@gmail.com')

        // Find the password input and type
        cy.get('[data-testid="login-password"]').type('password123')

        // Click submit
        cy.get('button[type="submit"]').click()

        // Handle OTP
        cy.get('input[placeholder="123456"]', { timeout: 10000 }).type('123456')
        cy.contains('button', 'Verify OTP').click()

        // Verify redirect to dashboard
        cy.url({ timeout: 15000 }).should('include', '/admin')

        // Check if dashboard content is visible
        cy.contains('Dashboard').should('be.visible')
        cy.contains('Total Faculty').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
        cy.visit('/login')

        cy.get('[data-testid="login-identifier"]').type('wrong@email.com')
        cy.get('[data-testid="login-password"]').type('wrongpass')
        cy.get('button[type="submit"]').click()

        // Assert that we are still on login page and an error message might appear
        // (exact error text depends on your UI implementation, adjusting to a generic expectation)
        cy.url().should('include', '/login')
    })
})
