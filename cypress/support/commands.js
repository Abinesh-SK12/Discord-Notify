// ***********************************************
// This file allows you to create custom commands
// and overwrite existing commands.
// ***********************************************

// Custom command to wait for YouTube to load
Cypress.Commands.add('waitForYouTube', () => {
    cy.get('ytd-app', { timeout: 10000 }).should('be.visible');
    cy.wait(1000); // Additional wait for dynamic content
  });
  
  // Custom command to search on YouTube
  Cypress.Commands.add('searchYouTube', (searchTerm) => {
    cy.get('input#search').clear().type(searchTerm);
    cy.get('button#search-icon-legacy').click();
    cy.wait(2000); // Wait for search results
  });
  
  // Custom command to accept cookies if prompted
  Cypress.Commands.add('acceptCookies', () => {
    cy.get('body').then($body => {
      if ($body.find('button:contains("Accept all")').length > 0) {
        cy.contains('button', 'Accept all').click();
      }
    });
  });