describe("System Notifications", () => {
    beforeEach(() => {
        cy.fixture('test-data').as('testData');

        // Mock Login for all tests in this spec
        cy.intercept('POST', '**/api/auth/login', (req) => {
            const { role, identifier } = req.body;
            req.reply({
                statusCode: 200,
                body: {
                    success: true,
                    user: {
                        id: role === 'admin' ? 1 : 2,
                        name: role === 'admin' ? 'Admin User' : 'Dr. Smith',
                        email: identifier,
                        role: role
                    }
                }
            });
        }).as('login');
    });

    it("Faculty should receive notification upon leave approval and schedule optimization", function () {
        cy.visit("http://localhost:5173/login");
        cy.contains('button', 'Faculty').click();
        cy.get("input[type=\"text\"]").type(this.testData.faculty.email);
        cy.get("input[type=\"password\"]").type(this.testData.faculty.password);

        // Expecting an unread notification matching the leave request inline on Dashboard-Faculty
        cy.intercept('GET', '**/api/notifications/faculty/*', {
            statusCode: 200,
            body: [
                { id: 1, title: 'Leave Approved', message: 'Your leave has been approved.', read: false, createdAt: new Date().toISOString() }
            ]
        }).as('getNotifs');

        cy.get("button[type=\"submit\"]").click();
        cy.wait('@login');
        cy.wait('@getNotifs');

        // Verify UI mapping (inline on faculty dashboard)
        cy.contains("Leave Approved").should("be.visible");
    });

    it("Admin should receive notification upon faculty leave request", () => {
        cy.visit("http://localhost:5173/login");
        cy.contains('button', 'Admin').click(); // Explicitly select Admin role
        cy.get("input[type=\"text\"]").type("pattemhemanth.04@gmail.com");
        cy.get("input[type=\"password\"]").type("password123");

        cy.intercept('GET', '**/api/admin/notifications/unread-count', {
            statusCode: 200,
            body: { count: 1 }
        }).as('getAdminCount');

        cy.intercept('GET', '**/api/admin/notifications', {
            statusCode: 200,
            body: [
                { id: 10, title: 'New Leave Request', message: 'Dr. Smith has requested leave.', read: false, createdAt: new Date().toISOString() }
            ]
        }).as('getAdminNotifs');

        cy.get("button[type=\"submit\"]").click();
        cy.wait('@login');
        cy.wait('@getAdminCount');

        // Admin notifications is a Dropdown Menu Trigger in AdminLayout
        cy.get('[data-testid="notifications-trigger"]').click({ force: true });

        cy.contains("New Leave Request").should("be.visible");
    });
});
