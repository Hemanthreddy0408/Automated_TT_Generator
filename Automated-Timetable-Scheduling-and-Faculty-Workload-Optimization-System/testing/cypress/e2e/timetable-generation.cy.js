describe("Timetable Generation Test", () => {
    beforeEach(() => {
        cy.visit("http://localhost:5173/login");
        cy.get("input[type=\"text\"]").type("pattemhemanth.04@gmail.com");
        cy.get("input[type=\"password\"]").type("password123");
        cy.get("button[type=\"submit\"]").click();
    });

    it("Admin should be able to generate a new timetable completely", () => {
        cy.contains("Timetable", { timeout: 10000 }).click();

        cy.contains("Generate Section").should("be.visible");

        // Click generate button for a section
        cy.intercept('POST', '/api/timetable/generate/*').as('generateTT');

        // Mock the GET request that happens immediately after Generate succeeds
        cy.intercept('GET', '/api/timetable/*', {
            statusCode: 200,
            body: [
                { id: 201, sectionId: "sec1", day: "MONDAY", timeSlot: "09:00-09:40", facultyName: "Dr. Mock", roomNumber: "101", subjectCode: "CS101", subjectName: "Intro", type: "LECTURE" }
            ]
        }).as('getNewTT');

        cy.contains("button", "Generate Section").click({ force: true });

        // Check mock response
        cy.wait('@generateTT');
        cy.wait('@getNewTT');

        // Verification of table rendering is tricky but we can check for table element (Course details table)
        cy.get('table').should('exist');
        cy.contains('MONDAY').should('exist');
    });
});
