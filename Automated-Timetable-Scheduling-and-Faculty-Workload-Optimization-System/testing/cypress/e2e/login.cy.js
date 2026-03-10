describe("Authentication and Login Tests", () => {
    beforeEach(() => {
        cy.fixture('test-data').as('testData');
    });

    it("Admin: should login as admin successfully", function () {
        cy.visit("http://localhost:5173/login");

        // Intercept login request
        cy.intercept('POST', '/api/auth/login').as('adminLogin');

        cy.get("input[type=\"text\"]").type(this.testData.admin.email);
        cy.get("input[type=\"password\"]").type(this.testData.admin.password);

        cy.get("button[type=\"submit\"]").click();

        // Verify backend API hit
        cy.wait('@adminLogin').its('response.statusCode').should('eq', 200);

        // Verify UI redirection
        cy.contains("Dashboard", { timeout: 10000 }).should("exist");
        cy.contains("Overview of your academic scheduling system").should("exist");
    });

    it("Faculty: should login as faculty successfully", function () {
        // Navigate to faculty frontend (Assuming Admin and Faculty share same frontend but different routes/views)
        cy.visit("http://localhost:5173/login"); // Was 5174, but there's only one UI running now

        // Select Faculty role
        cy.contains('button', 'Faculty').click();

        cy.intercept('POST', '/api/auth/login').as('facultyLogin');

        cy.get("input[type=\"text\"]").type(this.testData.faculty.email);
        cy.get("input[type=\"password\"]").type(this.testData.faculty.password);

        cy.get("button[type=\"submit\"]").click();

        // Verify backend authentication succeeds
        cy.wait('@facultyLogin').its('response.statusCode').should('eq', 200);

        // Assuming Faculty dashboard title
        cy.contains("Faculty Portal", { timeout: 10000 }).should("exist");
    });
});
