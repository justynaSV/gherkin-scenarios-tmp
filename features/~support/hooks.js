const { After, Before, world } = require('@cucumber/cucumber');

Before(async () => {
  world.state = world.state || {};
});

After(async () => {
  if (typeof world.cleanup === 'function') {
    await world.cleanup();
  }
});
