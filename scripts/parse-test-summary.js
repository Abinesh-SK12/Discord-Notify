const fs = require('fs');
const path = require('path');

class TestSummaryParser {
  constructor(testResultsPath) {
    this.testResultsPath = testResultsPath || path.join(__dirname, '..', 'test-results.json');
  }

  parseResults() {
    try {
      const rawData = fs.readFileSync(this.testResultsPath, 'utf8');
      
      // Try to parse JSON, with fallback for malformed data
      let testResults;
      try {
        testResults = JSON.parse(rawData);
      } catch (jsonError) {
        console.warn('Invalid JSON in test results, using default values');
        testResults = {
          stats: {
            tests: 0,
            passes: 0,
            failures: 0,
            pending: 0,
            duration: 0
          },
          tests: [],
          failures: []
        };
      }
      
      return this.generateSummary(testResults);
    } catch (error) {
      console.error('Error parsing test results:', error);
      // Return default summary on error
      return this.generateSummary({
        stats: {
          tests: 0,
          passes: 0,
          failures: 0,
          pending: 0,
          duration: 0
        },
        tests: [],
        failures: []
      });
    }
  }

  generateSummary(testResults) {
    const { stats, failures } = testResults;
    
    const summary = {
      totalTests: stats.tests,
      passed: stats.passes,
      failed: stats.failures,
      skipped: stats.pending,
      duration: this.formatDuration(stats.duration),
      passRate: ((stats.passes / stats.tests) * 100).toFixed(2),
      timestamp: new Date().toISOString(),
      chartData: {
        labels: ['Passed', 'Failed', 'Skipped'],
        data: [stats.passes, stats.failures, stats.pending],
        colors: ['#4CAF50', '#F44336', '#FFC107']
      },
      failures: failures ? failures.map(f => ({
        test: f.fullTitle,
        error: f.err.message
      })) : []
    };

    return summary;
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  generateChartUrls(summary) {
    const baseOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              size: 14
            }
          }
        },
        title: {
          display: true,
          text: `Test Results - ${summary.passRate}% Pass Rate`,
          font: {
            size: 18
          }
        },
        datalabels: {
          color: '#ffffff',
          font: {
            weight: 'bold',
            size: 16
          },
          formatter: (value, ctx) => {
            const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / sum) * 100).toFixed(1) + '%';
            return `${value}\\n${percentage}`;
          }
        }
      }
    };

    // Pie Chart
    const pieChart = {
      type: 'pie',
      data: {
        labels: summary.chartData.labels,
        datasets: [{
          data: summary.chartData.data,
          backgroundColor: summary.chartData.colors,
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      },
      options: baseOptions
    };

    // Donut Chart
    const donutChart = {
      type: 'doughnut',
      data: {
        labels: summary.chartData.labels,
        datasets: [{
          data: summary.chartData.data,
          backgroundColor: summary.chartData.colors,
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      },
      options: baseOptions
    };

    // Bar Chart
    const barChart = {
      type: 'bar',
      data: {
        labels: summary.chartData.labels,
        datasets: [{
          label: 'Test Results',
          data: summary.chartData.data,
          backgroundColor: summary.chartData.colors,
          borderWidth: 2,
          borderColor: summary.chartData.colors.map(color => color + 'CC')
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Test Results - ${summary.passRate}% Pass Rate`,
            font: {
              size: 18
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#333333',
            font: {
              weight: 'bold',
              size: 14
            }
          }
        }
      }
    };

    // Line Chart
    const lineChart = {
      type: 'line',
      data: {
        labels: summary.chartData.labels,
        datasets: [{
          label: 'Test Results',
          data: summary.chartData.data,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 4,
          pointBackgroundColor: summary.chartData.colors,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 8,
          pointHoverRadius: 10,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Test Results Trend - ${summary.passRate}% Pass Rate`,
            font: {
              size: 18
            }
          },
          datalabels: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: '#2196F3',
            borderRadius: 4,
            borderWidth: 2,
            color: '#333333',
            font: {
              weight: 'bold',
              size: 12
            },
            padding: 4
          }
        }
      }
    };

    return {
      pieChart: `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(pieChart))}&width=400&height=300&backgroundColor=white`,
      donutChart: `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(donutChart))}&width=400&height=300&backgroundColor=white`,
      barChart: `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(barChart))}&width=500&height=300&backgroundColor=white`,
      lineChart: `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(lineChart))}&width=500&height=300&backgroundColor=white`
    };
  }

  // Keep backwards compatibility
  generateChartUrl(summary) {
    return this.generateChartUrls(summary).donutChart;
  }

  generateMarkdownReport(summary, chartUrl) {
    let report = `# Test Results Summary\\n\\n`;
    report += `**Date:** ${new Date(summary.timestamp).toLocaleString()}\\n`;
    report += `**Duration:** ${summary.duration}\\n\\n`;
    
    report += `## Overview\\n`;
    report += `- **Total Tests:** ${summary.totalTests}\\n`;
    report += `- **Passed:** ${summary.passed} ✅\\n`;
    report += `- **Failed:** ${summary.failed} ❌\\n`;
    report += `- **Skipped:** ${summary.skipped} ⏭️\\n`;
    report += `- **Pass Rate:** ${summary.passRate}%\\n\\n`;
    
    report += `## Test Results Chart\\n`;
    report += `![Test Results](${chartUrl})\\n\\n`;
    
    if (summary.failures.length > 0) {
      report += `## Failed Tests\\n`;
      summary.failures.forEach((failure, index) => {
        report += `${index + 1}. **${failure.test}**\\n`;
        report += `   - Error: ${failure.error}\\n`;
      });
    }
    
    return report;
  }

  exportSummary(outputPath) {
    const summary = this.parseResults();
    const chartUrls = this.generateChartUrls(summary);
    const chartUrl = chartUrls.donutChart; // Keep backwards compatibility
    const markdownReport = this.generateMarkdownReport(summary, chartUrl);
    
    const exportData = {
      ...summary,
      chartUrl,
      chartUrls,
      markdownReport
    };
    
    fs.writeFileSync(outputPath || 'test-summary.json', JSON.stringify(exportData, null, 2));
    
    return exportData;
  }
}

if (require.main === module) {
  const parser = new TestSummaryParser();
  const summary = parser.exportSummary(path.join(__dirname, '..', 'test-summary.json'));
  
  console.log('Test Summary Generated:');
  console.log(`- Pass Rate: ${summary.passRate}%`);
  console.log(`- Total Tests: ${summary.totalTests}`);
  console.log(`- Chart URL: ${summary.chartUrl}`);
  console.log('\\nSummary saved to test-summary.json');
}

module.exports = TestSummaryParser;