const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { config } = require('./config');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.config = config;
    this.state = {};
    this.parameters = options.parameters || {};
  }

  async cleanup() {
    this.state = {};
  }
}

setWorldConstructor(CustomWorld);

module.exports = { CustomWorld };
