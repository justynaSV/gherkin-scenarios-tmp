const fs = require('fs');
const { walkFeatureFiles, toRelativePath } = require('./lib/feature-files');

const stepPattern = /^\s*(Given|When|Then|And|But)\s+(.+)\s*$/;

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

const runCheck = () => {
  /** @type {{ scenario: string | null, step: string, first: string | undefined, duplicate: string }[]} */
  const duplicates = [];
  /** @type {string | null} */
  let currentScenario = null;
  /** @type {Map<string, string>} */
  let scenarioSteps = new Map();

  for (const filePath of walkFeatureFiles()) {
    const relativePath = toRelativePath(filePath);
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

  return {
    label: 'Duplicate step check',
    failHeader: 'Duplicate Gherkin steps found inside the same scenario:',
    errorLines: duplicates.flatMap(({ scenario, step, first, duplicate }) => [
      `- Scenario: ${scenario || '<unknown>'}`,
      `- ${step}`,
      `  first: ${first}`,
      `  duplicate: ${duplicate}`
    ]),
    passMessage: 'No duplicate Gherkin steps found.'
  };
};

module.exports = { runCheck };

if (require.main === module) {
  const { reportResult } = require('./lib/report');
  process.exit(reportResult(runCheck()) ? 0 : 1);
}
