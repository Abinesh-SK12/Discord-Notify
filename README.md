# Discord-Notify

Automated Discord notification system for Cypress test results that runs twice daily and sends beautiful test result visualizations to your Discord channel.

## Features

- 🕐 **Automatic Scheduling**: Runs twice daily (9:00 AM and 4:00 PM UTC)
- 📊 **Multiple Chart Types**: Pie, Donut, Bar, and Line charts
- 🎨 **Beautiful Discord Embeds**: Rich Discord messages with color-coded status
- 🔄 **CI/CD Integration**: Works with GitHub Actions
- 📈 **Test Metrics**: Pass rate, duration, and detailed failure reports

## Setup Instructions

### 1. Create a New Repository

1. Create a new GitHub repository
2. Clone it to your local machine
3. Copy all files from the `discord-test-reporter` folder to your new repository

### 2. Set Up Discord Webhook

1. Go to your Discord server settings
2. Navigate to Integrations → Webhooks
3. Click "New Webhook"
4. Give it a name (e.g., "Test Reporter Bot")
5. Select the channel where reports should be posted
6. Copy the webhook URL

### 3. Configure GitHub Secrets

In your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secret:
   - Name: `DISCORD_WEBHOOK_URL`
   - Value: Your Discord webhook URL

### 4. Set Up Cypress Tests

Create a `cypress` folder in your repository with your test files. Example structure:
```
cypress/
  e2e/
    example.spec.js
  fixtures/
  support/
    commands.js
    e2e.js
```

Example test file (`cypress/e2e/example.spec.js`):
```javascript
describe('Example Test Suite', () => {
  it('should pass', () => {
    cy.visit('https://example.com')
    cy.title().should('include', 'Example')
  })
})
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Test Locally

Run tests and generate report:
```bash
npm run test:report
```

Send report to Discord (requires DISCORD_WEBHOOK_URL environment variable):
```bash
DISCORD_WEBHOOK_URL="your-webhook-url" npm run send-report
```

## Usage

### Automatic Runs
The workflow runs automatically:
- Daily at 9:00 AM UTC
- Daily at 4:00 PM UTC
- On every push to main/master
- On every pull request

### Manual Trigger
You can manually trigger the workflow:
1. Go to Actions tab in your GitHub repository
2. Select "Send Test Summary to Discord"
3. Click "Run workflow"

### NPM Scripts

- `npm test` - Run Cypress tests
- `npm run format-results` - Format test results
- `npm run generate-summary` - Generate test summary with charts
- `npm run send-report` - Send report to Discord
- `npm run test:report` - Run tests and send report (complete flow)

## Customization

### Modify Schedule
Edit `.github/workflows/discord-report.yml`:
```yaml
schedule:
  - cron: '0 9 * * *'   # Change these times
  - cron: '0 16 * * *'  # to your preference
```

### Customize Discord Embeds
Edit `scripts/send-discord-report.js` to modify:
- Embed colors
- Status thresholds
- Chart types
- Message format

### Add Slack Support
Set up `SLACK_WEBHOOK_URL` as a GitHub secret to also send reports to Slack.

## Troubleshooting

### Tests Not Running
- Ensure Cypress is properly installed
- Check that test files are in the correct location
- Verify Node.js version (18+ recommended)

### Discord Reports Not Sending
- Verify webhook URL is correct
- Check GitHub Actions logs for errors
- Ensure secret is properly set

### Chart Generation Issues
- Charts are generated using QuickChart.io
- Check that test results are properly formatted
- Verify internet connectivity in CI environment

## Example Output

The Discord report includes:
- Test summary with pass/fail counts
- Pass rate percentage
- Test duration
- Visual charts (pie, donut, bar, line)
- Failed test details (if any)
- Link to GitHub workflow run

## License

ISC