describe('Example Test Suite', () => {
  it('should visit example.com and verify title', () => {
    cy.visit('https://example.com')
    cy.title().should('include', 'Example Domain')
  })

  it('should contain expected text', () => {
    cy.visit('https://example.com')
    cy.contains('This domain is for use in illustrative examples').should('be.visible')
  })

  it('should have a valid link', () => {
    cy.visit('https://example.com')
    cy.get('a').should('have.attr', 'href').and('include', 'iana.org')
  })
})