describe('YouTube Tests', () => {
  beforeEach(() => {
    // Visit YouTube with extended timeout
    cy.visit('https://www.youtube.com', { timeout: 30000 })
    
    // Handle cookie consent if it appears
    cy.get('body').then($body => {
      // Check for various cookie consent buttons
      const consentSelectors = [
        'button[aria-label*="Accept all"]',
        'button[aria-label*="Accept the use of cookies"]',
        'ytd-button-renderer:contains("Accept all")',
        'tp-yt-paper-button:contains("Accept all")',
        'button:contains("I Agree")',
        'button:contains("Accept")'
      ]
      
      for (const selector of consentSelectors) {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().click()
          break
        }
      }
    })
    
    // Wait for page to stabilize
    cy.wait(2000)
  })

  it('should load YouTube homepage', () => {
    // Check if YouTube logo is visible
    cy.get('#logo', { timeout: 10000 }).should('be.visible')
    
    // Verify we're on YouTube
    cy.url().should('include', 'youtube.com')
    
    // Check page title
    cy.title().should('include', 'YouTube')
  })

  it('should have a working search bar', () => {
    // Find and interact with search input
    cy.get('input[id="search"]', { timeout: 10000 }).should('be.visible')
    
    // Type in search
    cy.get('input[id="search"]').type('Cypress tutorial')
    
    // Click search button
    cy.get('#search-icon-legacy').click()
    
    // Wait for results
    cy.wait(3000)
    
    // Verify URL changed to search results
    cy.url().should('include', 'results?search_query=')
  })

  it('should display video thumbnails on homepage', () => {
    // Wait for video grid to load
    cy.get('ytd-rich-item-renderer', { timeout: 15000 })
      .should('exist')
      .should('have.length.greaterThan', 0)
    
    // Check that thumbnails are visible
    cy.get('ytd-thumbnail img')
      .first()
      .should('be.visible')
      .and('have.attr', 'src')
  })

  it('should navigate to a video', () => {
    // Click on first video
    cy.get('ytd-rich-item-renderer', { timeout: 15000 })
      .first()
      .find('#video-title-link')
      .click({ force: true })
    
    // Wait for navigation
    cy.wait(3000)
    
    // Verify we're on a video page
    cy.url().should('include', '/watch?v=')
    
    // Check video player exists
    cy.get('video', { timeout: 10000 }).should('exist')
  })

  it('should show trending videos', () => {
    // Click menu button
    cy.get('#guide-button', { timeout: 10000 }).click()
    
    // Wait for menu to open
    cy.wait(1000)
    
    // Click on Trending
    cy.get('ytd-guide-entry-renderer')
      .contains('Trending')
      .click({ force: true })
    
    // Wait for page load
    cy.wait(3000)
    
    // Verify URL
    cy.url().should('include', '/trending')
  })

  it('should search and find results', () => {
    const searchTerm = 'Cypress automation'
    
    // Type search query
    cy.get('input[id="search"]', { timeout: 10000 })
      .clear()
      .type(searchTerm)
      .type('{enter}')
    
    // Wait for results
    cy.wait(3000)
    
    // Check that we have search results
    cy.get('ytd-video-renderer', { timeout: 10000 })
      .should('exist')
      .should('have.length.greaterThan', 0)
    
    // Verify search term in URL
    cy.url().should('include', encodeURIComponent(searchTerm))
  })
})

// Custom command to handle YouTube's dynamic loading
Cypress.Commands.add('waitForYouTubeLoad', () => {
  cy.get('ytd-app', { timeout: 10000 }).should('be.visible')
  cy.get('#spinner', { timeout: 10000 }).should('not.exist')
})