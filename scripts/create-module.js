const fs = require('fs');
const path = require('path');

const rawModuleName = process.argv.slice(2).join(' ').trim();

if (!rawModuleName) {
  console.error('Usage: npm run create:module -- <module-name>');
  process.exit(1);
}

const toKebabCase = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const moduleName = toKebabCase(rawModuleName);

if (!moduleName) {
  console.error('Module name must contain at least one letter or number.');
  process.exit(1);
}

const stateKey = moduleName.replace(/-/g, '_');
const moduleTitle = moduleName.replace(/-/g, ' ');
const featuresDir = path.join(process.cwd(), 'features', moduleName);
const stepDefinitionsDir = path.join(process.cwd(), 'features', 'step_definitions');
const stepDefinitionPath = path.join(stepDefinitionsDir, `${moduleName}.steps.js`);

fs.mkdirSync(featuresDir, { recursive: true });
fs.mkdirSync(stepDefinitionsDir, { recursive: true });

if (!fs.existsSync(stepDefinitionPath)) {
  const content = `const assert = require('assert/strict');
const { Given, When, Then, world } = require('@cucumber/cucumber');

Given('the ${moduleTitle} context is prepared', async () => {
  world.state.${stateKey} = world.state.${stateKey} || {};
});

When('the ${moduleTitle} action is performed', async () => {
  // TODO: Connect this step to the project-specific application or API driver.
  world.state.${stateKey}.actionPerformed = true;
});

Then('the ${moduleTitle} result is visible', async () => {
  assert.equal(world.state.${stateKey}.actionPerformed, true);
});
`;

  fs.writeFileSync(stepDefinitionPath, content);
}

console.log(`Module folder ready: features/${moduleName}`);
console.log(`Step definitions ready: features/step_definitions/${moduleName}.steps.js`);