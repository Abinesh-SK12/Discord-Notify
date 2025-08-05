// ***********************************************************
// This file is processed and loaded automatically before your test files.
// You can change the location of this file or turn off loading
// the support file with the 'supportFile' configuration option.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import './discord-reporter'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Disable uncaught exception handling for YouTube
Cypress.on('uncaught:exception', (err, runnable) => {
  // YouTube throws some uncaught exceptions that we can ignore
  return false;
});