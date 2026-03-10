describe("Faculty Leave Management", () => {
    beforeEach(() => {
        cy.fixture('test-data').as('testData');
    });

    it("Faculty should apply for leave and Admin should approve it", function () {
        // Step 0: Mock Login for both
        cy.intercept('POST', '**/api/auth/login', (req) => {
            const { role, identifier } = req.body;
            if (role === 'admin') {
                req.reply({
                    statusCode: 200,
                    body: { success: true, user: { id: 1, name: 'Admin User', email: identifier, role: 'admin' } }
                });
            } else {
                req.reply({
                    statusCode: 200,
                    body: { success: true, user: { id: 2, name: 'Dr. Smith', email: identifier, role: 'faculty' } }
                });
            }
        }).as('login');

        // Step 1: Faculty logs in and requests leave
        cy.visit("http://localhost:5173/login");
        cy.contains('button', 'Faculty').click();
        cy.get('input[type="text"]').type(this.testData.faculty.email);
        cy.get('input[type="password"]').type(this.testData.faculty.password);
        cy.get('button[type="submit"]').click();
        cy.wait('@login');

        // Navigate to Leave Section (Faculty Portal) directly to bypass sidebar visibility issues
        cy.visit("http://localhost:5173/faculty/leave");

        // Click on Apply Leave to open Modal
        cy.contains("button", "Apply Leave").click({ force: true });

        // Fill out leave request form inside modal
        cy.contains('label', 'Start Date').parent().find('input[type="date"]').type('2026-10-10');
        cy.contains('label', 'End Date').parent().find('input[type="date"]').type('2026-10-12');
        cy.contains('label', 'Reason').parent().find('textarea').type('Medical checkup');

        cy.intercept('POST', '**/api/leaves*', { statusCode: 201 }).as('applyLeave');
        cy.contains("button", "Submit Request").click();
        cy.wait('@applyLeave');

        // Step 2: Admin approves leave
        cy.clearCookies();
        cy.clearLocalStorage();

        cy.visit("http://localhost:5173/login");
        cy.contains('button', 'Admin').click(); // Explicitly select Admin role
        cy.get('input[type="text"]').type(this.testData.admin.email);
        cy.get('input[type="password"]').type(this.testData.admin.password);
        cy.get('button[type="submit"]').click();
        cy.wait('@login');

        // Admin intercepts the fetch for leaves to include our dummy request
        cy.intercept('GET', '**/api/leaves*', {
            statusCode: 200,
            body: [
                { id: 99, facultyName: 'Dr. Smith', leaveType: 'Casual Leave', startDate: '2026-10-10', endDate: '2026-10-12', status: 'Pending', reason: 'Medical Checkup', appliedDate: '2026-10-01' }
            ]
        }).as('getLeaves');

        // Navigate to the leave application page directly to bypass sidebar visibility issues
        cy.visit("http://localhost:5173/admin/leaves");
        cy.wait('@getLeaves');

        // Find the specific request and approve
        cy.intercept('PATCH', '**/api/leaves/*/status*').as('approveLeave');
        cy.contains('Dr. Smith').parents('tr').find('button').contains('Approve').click();
        cy.wait('@approveLeave');
    });
});
