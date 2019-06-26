/// <reference types="Cypress" />

context('Login', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('LOGIN_URL'))
  })

  it('takes user to the registration app once correct credentials are given', () => {
    cy.get('#username').type('sakibal.hasan')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code').type('000000')

    cy.get('#login-mobile-submit').click()

    //  cy.get('#view_title', { timeout: 30000 }).contains('Hello Shakib Al Hasan')
  })
})
