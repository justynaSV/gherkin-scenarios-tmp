const fs = require('fs');
const path = require('path');

const featuresDir = path.join(process.cwd(), 'features');
const stepPattern = /^\s*(Given|When|Then|And|But)\s+(.+)\s*$/;
/** @type {{ scenario: string | null, step: string, first: string | undefined, duplicate: string }[]} */
const duplicates = [];
/** @type {string | null} */
let currentScenario = null;
/** @type {Map<string, string>} */
let scenarioSteps = new Map();

/**
 * @param {string} directory
 * @returns {string[]}
 */
const walk = (directory) => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.feature') ? [fullPath] : [];
  });
};

/**
 * @param {string} text
 * @returns {string}
 */
const normalizeStep = (text) => {
  return text
    .replace(/"[^"]*"/g, '"<value>"')
    .replace(/<[^>]+>/g, '<value>')
    .replace(/\b\d+\b/g, '<number>')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

for (const filePath of walk(featuresDir)) {
  const relativePath = path.relative(process.cwd(), filePath);
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    const scenarioMatch = line.match(/^\s*Scenario(?: Outline)?:\s+(.+)\s*$/);

    if (scenarioMatch) {
      currentScenario = scenarioMatch[1].trim();
      scenarioSteps = new Map();
      return;
    }

    const match = line.match(stepPattern);

    if (!match) {
      return;
    }

    const normalized = normalizeStep(match[2]);
    const location = `${relativePath}:${index + 1}`;

    if (scenarioSteps.has(normalized)) {
      duplicates.push({
        scenario: currentScenario,
        step: match[2].trim(),
        first: scenarioSteps.get(normalized),
        duplicate: location
      });
      return;
    }

    scenarioSteps.set(normalized, location);
  });
}

if (duplicates.length > 0) {
  console.error('Duplicate Gherkin steps found inside the same scenario:');
  duplicates.forEach(({ scenario, step, first, duplicate }) => {
    console.error(`- Scenario: ${scenario || '<unknown>'}`);
    console.error(`- ${step}`);
    console.error(`  first: ${first}`);
    console.error(`  duplicate: ${duplicate}`);
  });
  process.exit(1);
}

console.log('No duplicate Gherkin steps found.');
