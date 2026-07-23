const assert = require('assert');
const { Given, When, Then, world } = require('@cucumber/cucumber');

Given('I am on the login page', async () => {
  await world.app.openLoginPage();
});

When('I submit valid login credentials', async () => {
  world.loginResponse = await world.app.login({
    username: world.testUsers.valid.username,
    password: world.testUsers.valid.password
  });
});

When('I submit invalid login credentials', async () => {
  world.loginResponse = await world.app.login({
    username: world.testUsers.valid.username,
    password: 'invalid-password'
  });
});

Then('I should be redirected to the dashboard', async () => {
  assert.equal(await world.app.currentPage(), 'dashboard');
});

Then('I should see an authentication error message', async () => {
  assert.equal(await world.app.errorMessage(), 'Incorrect username or password.');
});
