export const loginAdmin = (email = 'pattemhemanth.04@gmail.com', password = 'password123') => {
    cy.visit('/login');
    // Check if we need to switch to admin tab
    cy.get('body').then(($body) => {
        // Find the button for Admin and click it if it exists
        if ($body.find('button:contains("Admin")').length > 0) {
            cy.contains('button', 'Admin').click();
        }
    });

    cy.get('[data-testid="login-identifier"]').clear().type(email);
    cy.get('[data-testid="login-password"]').clear().type(password);
    cy.get('button[type="submit"]').click();

    // Since OTP is currently required for all, we wait for the OTP field
    cy.get('input[placeholder="123456"]', { timeout: 10000 }).type('123456');
    cy.contains('button', 'Verify OTP').click();

    // Final check for dashboard
    cy.url({ timeout: 15000 }).should('include', '/admin');
};

export const loginFaculty = (email = 'ravikarthikeya1825@gmail.com', password = 'faculty123') => {
    cy.visit('/login');
    // Switch to faculty tab
    cy.contains('button', 'Faculty').click();

    cy.get('[data-testid="login-identifier"]').clear().type(email);
    cy.get('[data-testid="login-password"]').clear().type(password);
    cy.get('button[type="submit"]').click();

    // Handle OTP
    cy.get('input[placeholder="123456"]', { timeout: 10000 }).type('123456');
    cy.contains('button', 'Verify OTP').click();

    // Final check for dashboard (faculty redirect to dashboard)
    cy.url({ timeout: 15000 }).should('include', '/faculty');
};
