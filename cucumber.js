module.exports = {
  default: {
    paths: ['features/**/*.feature'],
    require: ['features/~support/**/*.js', 'features/~step_definitions/**/*.js'],
    format: [
      'progress',
      'summary',
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html',
      'junit:reports/cucumber-report.xml'
    ],
    formatOptions: {
      snippetInterface: 'synchronous'
    },
    publishQuiet: true
  },
  dry: {
    paths: ['features/**/*.feature'],
    require: ['features/~support/**/*.js', 'features/~step_definitions/**/*.js'],
    dryRun: true,
    format: ['summary'],
    publishQuiet: true
  },
  smoke: {
    paths: ['features/**/*.feature'],
    require: ['features/~support/**/*.js', 'features/~step_definitions/**/*.js'],
    tags: '@smoke',
    format: ['progress', 'summary'],
    publishQuiet: true
  },
  regression: {
    paths: ['features/**/*.feature'],
    require: ['features/~support/**/*.js', 'features/~step_definitions/**/*.js'],
    tags: '@regression',
    format: ['progress', 'summary'],
    publishQuiet: true
  }
};
