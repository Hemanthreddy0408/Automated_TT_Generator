describe("Admin Features", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173/login");
        cy.get("input[type=\"text\"]").type("pattemhemanth.04@gmail.com");
        cy.get("input[type=\"password\"]").type("password123");
        cy.get("button[type=\"submit\"]").click();
    });

    it("Admin: Should view Optimization history and perform rollback", () => {
        cy.intercept('GET', '/api/audit-logs', {
            statusCode: 200,
            body: [{
                id: 1, userEmail: "System", actionType: "OPTIMIZATION", entityType: "Timetable",
                description: "Auto-resolved conflicts", timestamp: new Date().toISOString(), status: "SUCCESS"
            }]
        }).as('getLogs');
        cy.contains("History").click();
        cy.wait('@getLogs');

        cy.contains("History & Audit Log").should("be.visible");
        cy.contains("Rollback").should("exist");

        // Test Rollback
        cy.intercept('POST', '/api/audit-logs/rollback/*').as('rollbackTT');
        cy.get("button").contains("Rollback").first().click();
        cy.wait('@rollbackTT').its('request.body').should('be.empty');
    });
});
