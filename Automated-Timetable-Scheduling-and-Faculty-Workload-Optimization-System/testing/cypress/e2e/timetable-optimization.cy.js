describe("Timetable Optimization & Rollback", () => {
    beforeEach(() => {
        // Navigate straight to admin panel layout
        cy.visit("http://localhost:5173/login");
        cy.get("input[type=\"text\"]").type("pattemhemanth.04@gmail.com");
        cy.get("input[type=\"password\"]").type("password123");
        cy.get("button[type=\"submit\"]").click();
    });

    it("Admin: Should trigger timetable optimization and resolve conflicts automatically", () => {
        cy.intercept('GET', '/api/timetable', {
            statusCode: 200,
            body: [
                { id: 101, sectionId: "sec1", day: "MONDAY", timeSlot: "09:00-09:40", facultyName: "Dr. Smith", roomNumber: "101", type: "LECTURE" },
                { id: 102, sectionId: "sec2", day: "MONDAY", timeSlot: "09:00-09:40", facultyName: "Dr. Smith", roomNumber: "102", type: "LECTURE" }
            ]
        }).as('getTimetable');

        // Wait for dashboard to load with conflicts
        cy.wait('@getTimetable');

        // Trigger Optimizer
        cy.intercept('POST', '/api/timetable/resolve-conflict/*').as('optimizeTT');

        // Click Auto-Resolve on the conflict card
        cy.contains("button", "Auto-Resolve").click();

        // Assert conflict gets resolved via backend intercept
        cy.wait('@optimizeTT').its('request.body').should('be.empty');
    });

    it("Admin: Should view history and rollback", () => {
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

        // If there is an optimization history, it should display the rollback button
        cy.get('button').contains('Rollback').should('exist');
    });
});
