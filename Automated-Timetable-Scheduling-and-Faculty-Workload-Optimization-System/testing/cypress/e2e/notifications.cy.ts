describe('Notification System', () => {
    beforeEach(() => {
        cy.loginAdmin()
    })

    it('should display unread notifications to admin', () => {
        // Click notification bell
        cy.get('[data-testid="notifications-trigger"]').click()

        // Check if notification dropdown appears
        cy.contains('Notifications').should('be.visible')

        // Intercept read-all
        cy.intercept('PUT', '/api/notifications/admin/read-all').as('markAllRead')

        // Click mark all as read
        cy.get('body').then($body => {
            // Find the tab trigger for Admin and click it if it exists
            if ($body.find('a:contains("Mark all read")').length > 0) {
                cy.contains('a', 'Mark all read').click();
                cy.wait('@markAllRead').its('response.statusCode').should('eq', 200)
            }
        });
    })
})
