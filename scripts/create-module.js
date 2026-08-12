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

const featuresDir = path.join(process.cwd(), 'features', moduleName);
const stepDefinitionsDir = path.join(process.cwd(), 'features', '~step_definitions');
const stepDefinitionPath = path.join(stepDefinitionsDir, `${moduleName}.steps.js`);

const STEP_KEYWORD_PATTERN = /^\s*(Given|When|Then|And|But)\s+(.+?)\s*$/;
const SECTION_START_PATTERN = /^\s*(Background|Scenario(?: Outline)?):/;

/**
 * Extracts Given/When/Then steps from a .feature file, resolving And/But
 * lines to the last primary keyword used in that scenario/background.
 * @param {string} filePath
 * @returns {{ keyword: string, text: string }[]}
 */
const extractStepsFromFeatureFile = (filePath) => {
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  /** @type {{ keyword: string, text: string }[]} */
  const steps = [];
  /** @type {string | null} */
  let lastKeyword = null;
  let inDocString = false;

  for (const line of lines) {
    if (line.trim().startsWith('"""')) {
      inDocString = !inDocString;
      continue;
    }

    if (inDocString) {
      continue;
    }

    if (SECTION_START_PATTERN.test(line)) {
      lastKeyword = null;
      continue;
    }

    const match = line.match(STEP_KEYWORD_PATTERN);

    if (!match) {
      continue;
    }

    const [, keyword, text] = match;
    const resolvedKeyword = keyword === 'And' || keyword === 'But' ? lastKeyword || 'Given' : keyword;
    lastKeyword = resolvedKeyword;
    steps.push({ keyword: resolvedKeyword, text });
  }

  return steps;
};

/**
 * Converts literal Gherkin step text into a Cucumber Expression by
 * replacing quoted values and standalone numbers with placeholders.
 * @param {string} text
 * @returns {string}
 */
const toCucumberExpression = (text) => text
  .replace(/"[^"]*"/g, '{string}')
  .replace(/\b\d+\b/g, '{int}');

/**
 * @param {string} value
 * @returns {string}
 */
const escapeForSingleQuotedString = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/**
 * @param {{ keyword: string, expression: string, example: string }} step
 * @returns {string}
 */
const buildStepFunction = ({ keyword, expression, example }) => {
  const paramCount = (expression.match(/\{string\}|\{int\}/g) || []).length;
  const params = Array.from({ length: paramCount }, (_, index) => (paramCount === 1 ? 'value' : `value${index + 1}`)).join(', ');
  const escapedExpression = escapeForSingleQuotedString(expression);
  const escapedExample = escapeForSingleQuotedString(example);

  return `${keyword}('${escapedExpression}', async (${params}) => {
  // TODO: implement this step (from feature step: "${escapedExample}")
  return 'pending';
});`;
};

fs.mkdirSync(featuresDir, { recursive: true });
fs.mkdirSync(stepDefinitionsDir, { recursive: true });

const featureFiles = fs.readdirSync(featuresDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.feature'))
  .map((entry) => path.join(featuresDir, entry.name));

/** @type {Map<string, { keyword: string, example: string }>} */
const uniqueSteps = new Map();

for (const featureFile of featureFiles) {
  for (const step of extractStepsFromFeatureFile(featureFile)) {
    const expression = toCucumberExpression(step.text);

    if (!uniqueSteps.has(expression)) {
      uniqueSteps.set(expression, { keyword: step.keyword, example: step.text });
    }
  }
}

if (!fs.existsSync(stepDefinitionPath)) {
  if (uniqueSteps.size === 0) {
    const content = `const assert = require('node:assert/strict');
const { Given, When, Then, world } = require('@cucumber/cucumber');

// No feature files were found in features/${moduleName} yet.
// Add your Gherkin scenarios there, then run:
//   npm run create:module -- ${moduleName}
// again to generate step stubs that match the real step text.
`;

    fs.writeFileSync(stepDefinitionPath, content);
    console.log(`Module folder ready: features/${moduleName}`);
    console.log(`Step definitions ready: features/~step_definitions/${moduleName}.steps.js (no feature steps found yet)`);
  } else {
    const stepFunctions = Array.from(uniqueSteps.entries())
      .map(([expression, { keyword, example }]) => buildStepFunction({ keyword, expression, example }))
      .join('\n\n');

    const content = `const assert = require('node:assert/strict');
const { Given, When, Then, world } = require('@cucumber/cucumber');

${stepFunctions}
`;

    fs.writeFileSync(stepDefinitionPath, content);
    console.log(`Module folder ready: features/${moduleName}`);
    console.log(`Step definitions ready: features/~step_definitions/${moduleName}.steps.js (${uniqueSteps.size} step(s) generated from feature files)`);
  }
} else {
  const existingContent = fs.readFileSync(stepDefinitionPath, 'utf8');
  const missingSteps = Array.from(uniqueSteps.entries())
    .filter(([expression]) => !existingContent.includes(`'${escapeForSingleQuotedString(expression)}'`));

  if (missingSteps.length === 0) {
    console.log(`Module folder ready: features/${moduleName}`);
    console.log('Step definitions already cover every step found in the feature files.');
  } else {
    const stepFunctions = missingSteps
      .map(([expression, { keyword, example }]) => buildStepFunction({ keyword, expression, example }))
      .join('\n\n');

    const updatedContent = `${existingContent.replace(/\s*$/, '')}\n\n${stepFunctions}\n`;

    fs.writeFileSync(stepDefinitionPath, updatedContent);
    console.log(`Module folder ready: features/${moduleName}`);
    console.log(`Step definitions updated: features/~step_definitions/${moduleName}.steps.js (${missingSteps.length} new step(s) appended)`);
  }
}