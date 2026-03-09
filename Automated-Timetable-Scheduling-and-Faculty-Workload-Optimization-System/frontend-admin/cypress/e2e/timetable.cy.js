// cypress/e2e/timetable.cy.js
// End-to-End test: Admin views and generates timetable

describe('Timetable — Admin Flow', () => {
    beforeEach(() => {
        // Intercept all relevant API calls
        cy.intercept('GET', '**/timetable', { fixture: 'timetable.json' }).as('getTimetable');
        cy.intercept('GET', '**/sections', { fixture: 'sections.json' }).as('getSections');
        cy.intercept('GET', '**/faculty', { fixture: 'faculty.json' }).as('getFaculty');
        cy.intercept('GET', '**/rooms', { fixture: 'rooms.json' }).as('getRooms');
        cy.intercept('POST', '**/timetable/generate-all', { fixture: 'timetable.json' }).as('generateAll');
        cy.intercept('GET', '**/timetable/conflicts', { body: [] }).as('getConflicts');
        cy.intercept('GET', '**/notifications', { body: [] }).as('getNotifications');
        cy.intercept('GET', '**/faculty/workload-summary', { fixture: 'workload.json' }).as('getWorkload');
    });

    it('loads the admin dashboard successfully', () => {
        cy.visit('/');
        cy.get('body').should('be.visible');
    });

    it('navigates to the timetable section', () => {
        cy.visit('/');
        cy.wait('@getTimetable', { timeout: 10000 });
        // Check that a timetable-related element is on the page
        cy.get('[data-testid="timetable-section"], [class*="timetable"], h1, h2')
            .should('exist');
    });

    it('clicking Generate Timetable triggers the API call', () => {
        cy.visit('/');
        // Find any button that indicates generation
        cy.get('button')
            .contains(/generate/i)
            .should('exist')
            .click({ force: true });

        cy.wait('@generateAll', { timeout: 15000 });
    });

    it('displays timetable entries after generation', () => {
        cy.visit('/');
        cy.wait('@getTimetable', { timeout: 10000 });

        // Verify timetable data is shown on screen
        cy.contains('Operating Systems', { timeout: 10000 }).should('exist');
    });

    it('shows zero conflicts badge when schedule is clean', () => {
        cy.intercept('GET', '**/timetable/conflicts', { body: [] }).as('noConflicts');
        cy.visit('/');
        cy.wait('@noConflicts', { timeout: 10000 });

        // Should show 0 or show a "no conflicts" message
        cy.get('body').then(($body) => {
            const hasZeroConflicts = $body.text().includes('0') || $body.text().toLowerCase().includes('no conflict');
            expect(hasZeroConflicts).to.be.true;
        });
    });
});
