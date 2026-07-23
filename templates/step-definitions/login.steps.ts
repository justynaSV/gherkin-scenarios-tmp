import assert from 'node:assert/strict';
import { Given, Then, When, world } from '@cucumber/cucumber';
import type { CustomWorld } from './world';

Given('I am on the login page', async () => {
  await (world as CustomWorld).app.openLoginPage();
});

When('I submit valid login credentials', async () => {
  (world as CustomWorld).loginResponse = await (world as CustomWorld).app.login({
    username: (world as CustomWorld).testUsers.valid.username,
    password: (world as CustomWorld).testUsers.valid.password
  });
});

When('I submit invalid login credentials', async () => {
  (world as CustomWorld).loginResponse = await (world as CustomWorld).app.login({
    username: (world as CustomWorld).testUsers.valid.username,
    password: 'invalid-password'
  });
});

Then('I should be redirected to the dashboard', async () => {
  assert.equal(await (world as CustomWorld).app.currentPage(), 'dashboard');
});

Then('I should see an authentication error message', async () => {
  assert.equal(await (world as CustomWorld).app.errorMessage(), 'Incorrect username or password.');
});
