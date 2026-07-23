const fs = require('fs');
const path = require('path');

const featuresDir = path.join(process.cwd(), 'features');
const traceabilityPath = path.join(process.cwd(), 'docs', 'traceability.md');
const scenarioPattern = /^\s*Scenario(?: Outline)?:\s+(.+)\s*$/;

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

if (!fs.existsSync(traceabilityPath)) {
  console.error('Traceability matrix is missing: docs/traceability.md');
  process.exit(1);
}

const traceability = fs.readFileSync(traceabilityPath, 'utf8');
/** @type {string[]} */
const missing = [];

for (const featurePath of walk(featuresDir)) {
  const relativePath = path.relative(process.cwd(), featurePath).split(path.sep).join('/');
  const content = fs.readFileSync(featurePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(scenarioPattern);

    if (!match) {
      continue;
    }

    const scenarioName = match[1].trim();

    if (!traceability.includes(relativePath) || !traceability.includes(scenarioName)) {
      missing.push(`${relativePath} -> ${scenarioName}`);
    }
  }
}

if (missing.length > 0) {
  console.error('Traceability matrix is missing scenario coverage:');
  missing.forEach((entry) => console.error(`- ${entry}`));
  process.exit(1);
}

console.log('Traceability matrix covers all feature scenarios.');
