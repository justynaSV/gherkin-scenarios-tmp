const config = {
  baseUrl: process.env.TARGET_BASE_URL || 'https://example.test',
  apiBaseUrl: process.env.API_BASE_URL || process.env.TARGET_BASE_URL || 'https://api.example.test',
  headless: process.env.HEADLESS !== 'false'
};

module.exports = { config };
