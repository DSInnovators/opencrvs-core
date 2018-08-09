/// <reference types="Cypress" />

context('Login', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('REGISTER_URL'))
  })

  it('takes user to the registration app once correct credentials are given', () => {
    cy.get('#mobile').type('07111111111')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#code1').type('0')
    cy.get('#code2').type('0')
    cy.get('#code3').type('0')
    cy.get('#code4').type('0')
    cy.get('#code5').type('0')
    cy.get('#code6').type('0')

    cy.get('#login-mobile-submit').click()
    cy.get('#registration-form-box').should('be.visible')
  })
})
