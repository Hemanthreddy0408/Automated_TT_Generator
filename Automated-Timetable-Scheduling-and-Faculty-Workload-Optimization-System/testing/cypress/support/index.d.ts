declare namespace Cypress {
    interface Chainable {
        loginAdmin(email?: string, password?: string): Chainable<Element>;
    }
}
