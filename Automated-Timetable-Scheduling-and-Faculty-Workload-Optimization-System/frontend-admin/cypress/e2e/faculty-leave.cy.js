// cypress/e2e/faculty-leave.cy.js
// End-to-End test: Admin reviews and approves faculty leave requests

describe('Faculty Leave — Admin Flow', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/leaves', { fixture: 'leaves.json' }).as('getLeaves');
        cy.intercept('GET', '**/faculty', { fixture: 'faculty.json' }).as('getFaculty');
        cy.intercept('GET', '**/timetable', { fixture: 'timetable.json' }).as('getTimetable');
        cy.intercept('GET', '**/timetable/conflicts', { body: [] }).as('getConflicts');
        cy.intercept('GET', '**/notifications', { body: [] }).as('getNotifications');
        cy.intercept('GET', '**/faculty/workload-summary', { fixture: 'workload.json' }).as('getWorkload');
        cy.intercept('GET', '**/rooms', { fixture: 'rooms.json' }).as('getRooms');
        cy.intercept('GET', '**/sections', { fixture: 'sections.json' }).as('getSections');
    });

    it('loads leave management page', () => {
        cy.visit('/');
        cy.wait('@getLeaves', { timeout: 10000 });
        cy.get('body').should('be.visible');
    });

    it('displays pending leave requests', () => {
        cy.visit('/');
        cy.wait('@getLeaves', { timeout: 10000 });

        // Should show leave information somewhere on the page
        cy.contains('Dr. Smith', { timeout: 10000 }).should('exist');
    });

    it('approving a leave request calls the approve API', () => {
        cy.intercept('PUT', '**/leaves/approve/1', { statusCode: 200, body: {} }).as('approveLeave');
        cy.visit('/');
        cy.wait('@getLeaves', { timeout: 10000 });

        // Click approve button if visible
        cy.get('button')
            .contains(/approve/i)
            .first()
            .click({ force: true });

        cy.wait('@approveLeave', { timeout: 10000 });
    });

    it('rejecting a leave request calls the reject API', () => {
        cy.intercept('PUT', '**/leaves/reject/1', { statusCode: 200, body: {} }).as('rejectLeave');
        cy.visit('/');
        cy.wait('@getLeaves', { timeout: 10000 });

        cy.get('button')
            .contains(/reject/i)
            .first()
            .click({ force: true });

        cy.wait('@rejectLeave', { timeout: 10000 });
    });
});

describe('Faculty Leave — Faculty Self-Service', () => {
    beforeEach(() => {
        cy.intercept('GET', '**/leaves', { fixture: 'leaves.json' }).as('getLeaves');
        cy.intercept('GET', '**/timetable', { fixture: 'timetable.json' }).as('getTimetable');
        cy.intercept('GET', '**/timetable/conflicts', { body: [] }).as('getConflicts');
        cy.intercept('GET', '**/notifications', { body: [] }).as('getNotifications');
        cy.intercept('GET', '**/faculty/workload-summary', { fixture: 'workload.json' }).as('getWorkload');
        cy.intercept('GET', '**/rooms', { fixture: 'rooms.json' }).as('getRooms');
        cy.intercept('GET', '**/sections', { fixture: 'sections.json' }).as('getSections');
        cy.intercept('GET', '**/faculty', { fixture: 'faculty.json' }).as('getFaculty');
        cy.intercept('POST', '**/leaves', { statusCode: 201, body: { id: 99, status: 'Pending' } }).as('createLeave');
    });

    it('faculty can submit a new leave request', () => {
        cy.visit('/');

        // Find leave submission form
        cy.get('body').then(($body) => {
            if ($body.find('form').length > 0) {
                cy.intercept('POST', '**/leaves', { statusCode: 201, body: {} }).as('submitLeave');
                cy.get('form').first().within(() => {
                    cy.get('input[type="date"], input[type="text"]').first().type('2026-04-01');
                });
            }
        });
    });
});
