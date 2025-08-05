const fs = require('fs');

// Custom Cypress JSON reporter formatter
// This converts Cypress's default JSON output to match our expected format

function formatCypressResults(cypressOutput) {
  const results = typeof cypressOutput === 'string' ? JSON.parse(cypressOutput) : cypressOutput;
  
  const stats = results.stats || {};
  const tests = results.tests || [];
  const failures = results.failures || [];
  
  const formattedResults = {
    stats: {
      suites: stats.suites || 0,
      tests: stats.tests || 0,
      passes: stats.passes || 0,
      pending: stats.pending || 0,
      failures: stats.failures || 0,
      start: stats.start || new Date().toISOString(),
      end: stats.end || new Date().toISOString(),
      duration: stats.duration || 0
    },
    tests: tests.map(test => ({
      title: test.title,
      fullTitle: test.fullTitle || test.title,
      duration: test.duration || 0,
      state: test.state || 'passed',
      err: test.err
    })),
    failures: failures.map(failure => ({
      title: failure.title,
      fullTitle: failure.fullTitle || failure.title,
      err: {
        message: failure.err?.message || failure.error || 'Test failed',
        stack: failure.err?.stack || failure.stack || ''
      }
    }))
  };
  
  return formattedResults;
}

// If this script is run directly, format the test-results.json file
if (require.main === module) {
  try {
    const rawResults = fs.readFileSync('test-results.json', 'utf8');
    const formattedResults = formatCypressResults(rawResults);
    fs.writeFileSync('test-results.json', JSON.stringify(formattedResults, null, 2));
    console.log('Cypress results formatted successfully');
  } catch (error) {
    console.error('Error formatting Cypress results:', error);
  }
}

module.exports = { formatCypressResults };