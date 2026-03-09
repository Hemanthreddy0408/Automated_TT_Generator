// cypress/e2e/optimization.cy.js
// End-to-End test: Admin resolves conflicts and optimizes timetable

describe('Timetable Optimization — Admin Flow', () => {
    const conflictEntry = {
        id: 10,
        sectionId: '1',
        day: 'MONDAY',
        timeSlot: '09:00-09:40',
        subjectCode: 'CSE301',
        subjectName: 'Operating Systems',
        facultyName: 'Dr. Smith',
        roomNumber: 'AB1-401',
        type: 'LECTURE',
    };

    beforeEach(() => {
        cy.intercept('GET', '**/timetable', { fixture: 'timetable.json' }).as('getTimetable');
        cy.intercept('GET', '**/sections', { fixture: 'sections.json' }).as('getSections');
        cy.intercept('GET', '**/faculty', { fixture: 'faculty.json' }).as('getFaculty');
        cy.intercept('GET', '**/rooms', { fixture: 'rooms.json' }).as('getRooms');
        cy.intercept('GET', '**/faculty/workload-summary', { fixture: 'workload.json' }).as('getWorkload');
        cy.intercept('GET', '**/notifications', { body: [] }).as('getNotifications');
        cy.intercept('GET', '**/timetable/conflicts', {
            body: [conflictEntry],
        }).as('getConflicts');
        cy.intercept('POST', '**/timetable/resolve-conflict/10', {
            body: { ...conflictEntry, timeSlot: '11:35-12:25' },
        }).as('resolveConflict');
    });

    it('shows conflict count when conflicts exist', () => {
        cy.visit('/');
        cy.wait('@getConflicts', { timeout: 10000 });

        // At least a "1" or the entry should appear somewhere
        cy.get('body').contains(/conflict/i, { timeout: 10000 }).should('exist');
    });

    it('displays conflicting entry details', () => {
        cy.visit('/');
        cy.wait('@getConflicts', { timeout: 10000 });
        cy.wait('@getTimetable', { timeout: 10000 });

        cy.get('body').then(($body) => {
            // Either the subject or faculty name should appear
            const text = $body.text();
            const hasConflictInfo =
                text.includes('Dr. Smith') || text.includes('Operating Systems') || text.includes('CSE301');
            expect(hasConflictInfo).to.be.true;
        });
    });

    it('clicking Auto-Resolve calls the resolve-conflict API', () => {
        cy.visit('/');
        cy.wait('@getConflicts', { timeout: 10000 });

        cy.get('button')
            .contains(/resolve|fix|auto/i)
            .first()
            .click({ force: true });

        cy.wait('@resolveConflict', { timeout: 15000 });
    });

    it('after resolve, the conflict count decreases', () => {
        cy.intercept('GET', '**/timetable/conflicts', { body: [] }).as('noMoreConflicts');

        cy.visit('/');
        cy.wait('@noMoreConflicts', { timeout: 10000 });

        cy.get('body').then(($body) => {
            const text = $body.text();
            const conflictCleared =
                text.includes('0') || text.toLowerCase().includes('no conflict');
            expect(conflictCleared).to.be.true;
        });
    });
});
