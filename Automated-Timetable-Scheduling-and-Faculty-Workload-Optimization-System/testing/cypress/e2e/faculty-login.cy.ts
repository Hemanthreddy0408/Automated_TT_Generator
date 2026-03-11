describe('Faculty Login Test', () => {

    it('should login as faculty successfully', () => {
        cy.visit('/login')

        // Find the faculty tab and click it
        cy.get('button[role="tab"]').contains('Faculty').click()

        // Find the email input and type
        cy.get('input[type="email"], input[name="email"]').type('ravi.kumar@university.edu')

        // Find the password input and type
        cy.get('input[type="password"], input[name="password"]').type('faculty123')

        // Click submit
        cy.get('button[type="submit"]').click()

        // Verify redirect to dashboard
        cy.url().should('include', '/faculty')

        // Check if dashboard content is visible
        cy.contains('Faculty Dashboard').should('be.visible')
    })

    it('should show error for invalid faculty credentials', () => {
        cy.visit('/login')

        cy.get('button[role="tab"]').contains('Faculty').click()
        cy.get('input[type="email"], input[name="email"]').type('wrong@email.com')
        cy.get('input[type="password"], input[name="password"]').type('wrongpass')
        cy.get('button[type="submit"]').click()

        cy.url().should('include', '/login')
    })
})
