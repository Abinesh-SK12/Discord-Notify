describe('YouTube E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000); // Wait for page to load
  });

  context('Homepage Tests', () => {
    it('should load YouTube homepage successfully', () => {
      cy.title().should('contain', 'YouTube');
      cy.get('#logo-icon').should('be.visible');
      cy.url().should('include', 'youtube.com');
    });

    it('should display search bar', () => {
      cy.get('input#search').should('be.visible');
      cy.get('button#search-icon-legacy').should('be.visible');
    });

    it('should show navigation menu', () => {
      cy.get('button[aria-label="Guide"]').should('be.visible');
      cy.get('ytd-masthead').should('be.visible');
    });

    it('should display video recommendations', () => {
      cy.get('ytd-rich-item-renderer').should('have.length.greaterThan', 0);
      cy.get('ytd-rich-grid-renderer').should('be.visible');
    });
  });

  context('Search Functionality', () => {
    it('should perform a basic search', () => {
      const searchTerm = 'Cypress automation testing';
      cy.get('input#search').type(searchTerm);
      cy.get('button#search-icon-legacy').click();
      
      cy.url().should('include', 'results?search_query=');
      cy.get('ytd-video-renderer').should('have.length.greaterThan', 0);
    });

    it('should show search suggestions', () => {
      cy.get('input#search').type('JavaScript');
      cy.wait(1000);
      cy.get('.sbdd_b').should('be.visible');
      cy.get('.sbsb_a').should('have.length.greaterThan', 0);
    });

    it('should filter search results by upload date', () => {
      cy.get('input#search').type('Node.js tutorial');
      cy.get('button#search-icon-legacy').click();
      cy.wait(2000);
      
      cy.get('button[aria-label="Search filters"]').click();
      cy.contains('This week').click();
      cy.url().should('include', 'sp=');
    });

    it('should clear search input', () => {
      cy.get('input#search').type('Test query');
      cy.get('input#search').should('have.value', 'Test query');
      cy.get('input#search').clear();
      cy.get('input#search').should('have.value', '');
    });
  });

  context('Video Interaction', () => {
    it('should open a video from homepage', () => {
      cy.get('ytd-rich-item-renderer').first().find('#video-title-link').click();
      cy.url().should('include', '/watch?v=');
      cy.get('video').should('exist');
    });

    it('should display video player controls', () => {
      cy.visit('/watch?v=dQw4w9WgXcQ');
      cy.get('.ytp-play-button').should('be.visible');
      cy.get('.ytp-volume-area').should('be.visible');
      cy.get('.ytp-settings-button').should('be.visible');
    });

    it('should show video title and description', () => {
      cy.visit('/watch?v=dQw4w9WgXcQ');
      cy.get('h1.ytd-video-primary-info-renderer').should('be.visible');
      cy.get('#info-strings').should('be.visible');
    });

    it('should display related videos', () => {
      cy.visit('/watch?v=dQw4w9WgXcQ');
      cy.get('ytd-compact-video-renderer').should('have.length.greaterThan', 5);
    });
  });

  context('Navigation Tests', () => {
    it('should navigate to Trending page', () => {
      cy.get('button[aria-label="Guide"]').click();
      cy.get('a[title="Trending"]').click();
      cy.url().should('include', '/feed/trending');
    });

    it('should navigate to Subscriptions', () => {
      cy.get('button[aria-label="Guide"]').click();
      cy.contains('Subscriptions').click();
      cy.url().should('include', '/feed/subscriptions');
    });

    it('should return to homepage via logo', () => {
      cy.visit('/results?search_query=test');
      cy.get('#logo-icon').click();
      cy.url().should('eq', 'https://www.youtube.com/');
    });
  });

  context('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      cy.viewport('iphone-x');
      cy.visit('/');
      cy.get('ytm-mobile-topbar-renderer').should('be.visible');
    });

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2');
      cy.visit('/');
      cy.get('ytd-masthead').should('be.visible');
    });

    it('should handle different viewport sizes', () => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 375, height: 667 }
      ];

      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.get('#search').should('be.visible');
      });
    });
  });

  context('Performance Tests', () => {
    it('should load homepage within acceptable time', () => {
      const start = Date.now();
      cy.visit('/');
      cy.get('ytd-rich-grid-renderer').should('be.visible');
      cy.then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(5000);
      });
    });

    it('should load search results quickly', () => {
      cy.get('input#search').type('JavaScript{enter}');
      cy.get('ytd-video-renderer', { timeout: 5000 }).should('be.visible');
    });
  });
});