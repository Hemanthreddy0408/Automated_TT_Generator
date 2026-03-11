describe('Faculty Login Test', () => {

    it('should login as faculty successfully', () => {
        cy.visit('/login')

        // Find the faculty tab and click it
        cy.contains('button', 'Faculty').click()

        // Find the email input and type
        cy.get('[data-testid="login-identifier"]').type('ravikarthikeya1825@gmail.com')

        // Find the password input and type
        cy.get('[data-testid="login-password"]').type('faculty123')

        // Click submit
        cy.get('button[type="submit"]').click()

        // Handle OTP
        cy.get('input[placeholder="123456"]', { timeout: 10000 }).type('123456')
        cy.contains('button', 'Verify OTP').click()

        // Verify redirect to dashboard
        cy.url({ timeout: 15000 }).should('include', '/faculty')

        // Check if dashboard content is visible
        cy.contains('Faculty Portal').should('be.visible')
    })

    it('should show error for invalid faculty credentials', () => {
        cy.visit('/login')

        cy.contains('button', 'Faculty').click()
        cy.get('[data-testid="login-identifier"]').type('wrong@email.com')
        cy.get('[data-testid="login-password"]').type('wrongpass')
        cy.get('button[type="submit"]').click()

        cy.url().should('include', '/login')
    })
})
