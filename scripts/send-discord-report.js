const https = require('https');
const fs = require('fs');
const path = require('path');
const TestSummaryParser = require('./parse-test-summary');

class DiscordReporter {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl || process.env.DISCORD_WEBHOOK_URL;
    if (!this.webhookUrl) {
      throw new Error('Discord webhook URL is required');
    }
  }

  async sendReport(summaryPath) {
    try {
      const summaryData = this.loadSummary(summaryPath);
      const embed = this.createEmbed(summaryData);
      
      await this.sendWebhook(embed);
      console.log('Discord report sent successfully!');
    } catch (error) {
      console.error('Error sending Discord report:', error);
      throw error;
    }
  }

  loadSummary(summaryPath) {
    const defaultPath = path.join(__dirname, '..', 'test-summary.json');
    const filePath = summaryPath || defaultPath;
    
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('Summary file not found, generating new summary...');
      const parser = new TestSummaryParser();
      return parser.exportSummary(filePath);
    }
  }

  createEmbed(summary) {
    const color = this.getStatusColor(summary.passRate);
    const statusEmoji = this.getStatusEmoji(summary.passRate);
    
    const embeds = [];
    
    // Main summary embed
    const mainEmbed = {
      title: `${statusEmoji} Test Results Summary`,
      color: color,
      timestamp: summary.timestamp,
      thumbnail: {
        url: 'https://cdn.discordapp.com/embed/avatars/2.png'
      },
      fields: [
        {
          name: '📊 Overview',
          value: `\`\`\`
Total Tests: ${summary.totalTests}
Passed:      ${summary.passed} ✅
Failed:      ${summary.failed} ❌
Skipped:     ${summary.skipped} ⏭️
Pass Rate:   ${summary.passRate}%
Duration:    ${summary.duration}
\`\`\``,
          inline: false
        }
      ],
      footer: {
        text: 'Powered by Dashboard Test Reporter',
        icon_url: 'https://cdn.discordapp.com/embed/avatars/4.png'
      }
    };
    
    embeds.push(mainEmbed);
    
    // Chart embeds
    if (summary.chartUrls) {
      // Pie Chart
      embeds.push({
        title: '🥧 Pie Chart Visualization',
        color: color,
        image: {
          url: summary.chartUrls.pieChart
        }
      });
      
      // Donut Chart
      embeds.push({
        title: '🍩 Donut Chart Visualization',
        color: color,
        image: {
          url: summary.chartUrls.donutChart
        }
      });
      
      // Bar Chart
      embeds.push({
        title: '📊 Bar Chart Visualization',
        color: color,
        image: {
          url: summary.chartUrls.barChart
        }
      });
      
      // Line Chart
      embeds.push({
        title: '📈 Line Chart Visualization',
        color: color,
        image: {
          url: summary.chartUrls.lineChart
        }
      });
    } else {
      // Fallback to single chart for backwards compatibility
      mainEmbed.image = {
        url: summary.chartUrl
      };
    }
    
    const embed = {
      username: 'Test Reporter Bot',
      avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
      embeds: embeds
    };

    if (summary.failures.length > 0) {
      const failuresList = summary.failures
        .slice(0, 5)
        .map((f, i) => `${i + 1}. **${f.test}**\n   └─ ${f.error}`)
        .join('\n\n');
      
      mainEmbed.fields.push({
        name: '❌ Failed Tests',
        value: failuresList + (summary.failures.length > 5 ? `\n\n... and ${summary.failures.length - 5} more` : ''),
        inline: false
      });
    }

    if (process.env.GITHUB_RUN_ID) {
      mainEmbed.fields.push({
        name: '🔗 Links',
        value: `[View Workflow Run](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})`,
        inline: false
      });
    }

    return embed;
  }

  getStatusColor(passRate) {
    const rate = parseFloat(passRate);
    if (rate >= 95) return 0x4CAF50; // Green
    if (rate >= 80) return 0xFFC107; // Yellow
    return 0xF44336; // Red
  }

  getStatusEmoji(passRate) {
    const rate = parseFloat(passRate);
    if (rate >= 95) return '✅';
    if (rate >= 80) return '⚠️';
    return '❌';
  }

  sendWebhook(embed) {
    return new Promise((resolve, reject) => {
      const webhookUrl = new URL(this.webhookUrl);
      const data = JSON.stringify(embed);
      
      const options = {
        hostname: webhookUrl.hostname,
        path: webhookUrl.pathname + webhookUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 204 || res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Discord API returned ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  async sendSlackReport(slackWebhookUrl, summaryPath) {
    const summary = this.loadSummary(summaryPath);
    const slackMessage = this.createSlackMessage(summary);
    
    return this.sendSlackWebhook(slackWebhookUrl, slackMessage);
  }

  createSlackMessage(summary) {
    const color = this.getSlackColor(summary.passRate);
    
    return {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🧪 Test Results Summary'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Total Tests:*\n${summary.totalTests}`
            },
            {
              type: 'mrkdwn',
              text: `*Pass Rate:*\n${summary.passRate}%`
            },
            {
              type: 'mrkdwn',
              text: `*Passed:*\n${summary.passed} ✅`
            },
            {
              type: 'mrkdwn',
              text: `*Failed:*\n${summary.failed} ❌`
            },
            {
              type: 'mrkdwn',
              text: `*Skipped:*\n${summary.skipped} ⏭️`
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${summary.duration}`
            }
          ]
        },
        {
          type: 'image',
          image_url: summary.chartUrl,
          alt_text: 'Test Results Chart'
        }
      ],
      attachments: summary.failures.length > 0 ? [{
        color: color,
        title: 'Failed Tests',
        text: summary.failures.map((f, i) => `${i + 1}. ${f.test}\n   Error: ${f.error}`).join('\n\n')
      }] : []
    };
  }

  getSlackColor(passRate) {
    const rate = parseFloat(passRate);
    if (rate >= 95) return '#4CAF50';
    if (rate >= 80) return '#FFC107';
    return '#F44336';
  }

  sendSlackWebhook(webhookUrl, message) {
    return new Promise((resolve, reject) => {
      const url = new URL(webhookUrl);
      const data = JSON.stringify(message);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`Slack API returned ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

if (require.main === module) {
  const webhookUrl = process.argv[2] || process.env.DISCORD_WEBHOOK_URL;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  const summaryPath = process.argv[3];
  
  if (!webhookUrl && !slackWebhookUrl) {
    console.error('Please provide DISCORD_WEBHOOK_URL as argument or environment variable');
    console.error('Usage: node send-discord-report.js <webhook-url> [summary-path]');
    process.exit(1);
  }

  const reporter = new DiscordReporter(webhookUrl);
  
  if (webhookUrl) {
    reporter.sendReport(summaryPath)
      .then(() => console.log('Discord notification sent successfully'))
      .catch(error => {
        console.error('Failed to send Discord notification:', error);
        process.exit(1);
      });
  }
  
  if (slackWebhookUrl) {
    reporter.sendSlackReport(slackWebhookUrl, summaryPath)
      .then(() => console.log('Slack notification sent successfully'))
      .catch(error => {
        console.error('Failed to send Slack notification:', error);
        process.exit(1);
      });
  }
}

module.exports = DiscordReporter;