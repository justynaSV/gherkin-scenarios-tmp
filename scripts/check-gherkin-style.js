const fs = require('fs');
const path = require('path');
const { walkFeatureFiles, toRelativePath } = require('./lib/feature-files');

const restrictedTags = new Set(['@wip', '@only', '@ignore']);
const maxLengths = {
  Feature: 90,
  Scenario: 100,
  Step: 120
};

const isKebabCase = (name) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
const isTagLine = (line) => /^\s*@\S+/.test(line);
const isCommentedTagLine = (line) => /^\s*#\s*@\S+/.test(line);
const getTags = (line) => line.trim().split(/\s+/).filter((part) => part.startsWith('@'));

const expectedIndent = (line) => {
  const trimmed = line.trim();

  if (trimmed === '' || trimmed.startsWith('#')) {
    return null;
  }

  if (trimmed.startsWith('@')) {
    return /^\s{2}@/.test(line) ? 2 : 0;
  }

  if (/^Feature:\s*/.test(trimmed)) {
    return 0;
  }

  if (/^(Background|Scenario(?: Outline)?):\s*/.test(trimmed)) {
    return 2;
  }

  if (/^(Given|When|Then|And|But)\s+/.test(trimmed)) {
    return 4;
  }

  if (/^Examples:\s*$/.test(trimmed)) {
    return 4;
  }

  if (trimmed.startsWith('|')) {
    return 6;
  }

  return null;
};

const validateFeatureFile = (filePath, allFeatureNames) => {
  const relativePath = toRelativePath(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const errors = [];
  const featureName = path.basename(filePath, '.feature');
  // Scenario names only need to be unique within their own file - reusing a title across
  // different feature files (e.g. the same generic assertion for different icons) is fine.
  const scenarioNamesInFile = new Set();

  if (!isKebabCase(featureName)) {
    errors.push(`${relativePath}: file name should be kebab-case.`);
  }

  if (content.trim().length === 0) {
    errors.push(`${relativePath}: feature file is empty.`);
    return errors;
  }

  if (!content.endsWith('\n')) {
    errors.push(`${relativePath}: file should end with a newline.`);
  }

  let featureTitle = null;
  let scenarioCount = 0;
  let currentScenario = null;
  let currentScenarioTags = [];
  let hasExamplesForCurrentOutline = false;
  let pendingTags = [];
  let previousLineWasEmpty = false;
  const featureTags = new Set();

  const flushScenario = () => {
    if (currentScenario?.isOutline && !hasExamplesForCurrentOutline) {
      errors.push(`${relativePath}:${currentScenario.line}: Scenario Outline should have Examples.`);
    }

    currentScenario = null;
    currentScenarioTags = [];
    hasExamplesForCurrentOutline = false;
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (/\s+$/.test(line)) {
      errors.push(`${relativePath}:${lineNumber}: line has trailing spaces.`);
    }

    if (trimmed === '') {
      if (previousLineWasEmpty) {
        errors.push(`${relativePath}:${lineNumber}: multiple empty lines are not allowed.`);
      }
      previousLineWasEmpty = true;
      return;
    }

    previousLineWasEmpty = false;

    if (isCommentedTagLine(line)) {
      errors.push(`${relativePath}:${lineNumber}: do not partially comment tag lines.`);
    }

    const indent = line.match(/^\s*/)[0].length;
    const requiredIndent = expectedIndent(line);

    if (requiredIndent !== null && indent !== requiredIndent) {
      errors.push(`${relativePath}:${lineNumber}: expected indentation of ${requiredIndent} spaces.`);
    }

    if (isTagLine(line)) {
      const tags = getTags(line);

      tags.forEach((tag) => {
        if (restrictedTags.has(tag)) {
          errors.push(`${relativePath}:${lineNumber}: restricted tag ${tag} is not allowed.`);
        }
      });

      pendingTags.push(...tags);
      return;
    }

    const featureMatch = trimmed.match(/^Feature:\s*(.*)$/);
    if (featureMatch) {
      flushScenario();
      featureTitle = featureMatch[1].trim();

      if (!featureTitle) {
        errors.push(`${relativePath}:${lineNumber}: Feature should have a name.`);
      }

      if (featureTitle.length > maxLengths.Feature) {
        errors.push(`${relativePath}:${lineNumber}: Feature name should be ${maxLengths.Feature} characters or less.`);
      }

      if (allFeatureNames.has(featureTitle)) {
        errors.push(`${relativePath}:${lineNumber}: duplicate Feature name: ${featureTitle}`);
      }

      allFeatureNames.add(featureTitle);
      pendingTags.forEach((tag) => featureTags.add(tag));
      pendingTags = [];
      return;
    }

    const scenarioMatch = trimmed.match(/^(Scenario(?: Outline)?):\s*(.*)$/);
    if (scenarioMatch) {
      flushScenario();
      scenarioCount += 1;
      const scenarioType = scenarioMatch[1];
      const scenarioTitle = scenarioMatch[2].trim();

      if (!scenarioTitle) {
        errors.push(`${relativePath}:${lineNumber}: ${scenarioType} should have a name.`);
      }

      if (scenarioTitle.length > maxLengths.Scenario) {
        errors.push(`${relativePath}:${lineNumber}: Scenario name should be ${maxLengths.Scenario} characters or less.`);
      }

      if (scenarioNamesInFile.has(scenarioTitle)) {
        errors.push(`${relativePath}:${lineNumber}: duplicate Scenario name: ${scenarioTitle}`);
      }

      scenarioNamesInFile.add(scenarioTitle);
      currentScenarioTags = pendingTags;
      pendingTags = [];
      currentScenario = {
        isOutline: scenarioType === 'Scenario Outline',
        line: lineNumber,
        title: scenarioTitle
      };

      const redundantTags = currentScenarioTags.filter((tag) => featureTags.has(tag));
      redundantTags.forEach((tag) => {
        errors.push(`${relativePath}:${lineNumber}: scenario repeats feature-level tag ${tag}.`);
      });

      return;
    }

    if (/^Examples:\s*$/.test(trimmed) && currentScenario?.isOutline) {
      hasExamplesForCurrentOutline = true;
      return;
    }

    const stepMatch = trimmed.match(/^(Given|When|Then|And|But)\s+(.+)$/);
    if (stepMatch && stepMatch[2].trim().length > maxLengths.Step) {
      errors.push(`${relativePath}:${lineNumber}: Step should be ${maxLengths.Step} characters or less.`);
    }
  });

  flushScenario();

  if (!featureTitle) {
    errors.push(`${relativePath}: Feature declaration is missing.`);
  }

  if (scenarioCount === 0) {
    errors.push(`${relativePath}: feature file should contain at least one scenario.`);
  }

  return errors;
};

const runCheck = () => {
  const featureFiles = walkFeatureFiles();

  if (featureFiles.length === 0) {
    return {
      label: 'Gherkin style validation',
      skippedMessage: 'No feature files found. Skipping Gherkin style validation.'
    };
  }

  const allFeatureNames = new Set();
  const errors = featureFiles.flatMap((filePath) => validateFeatureFile(filePath, allFeatureNames));

  return {
    label: 'Gherkin style validation',
    failHeader: 'Gherkin style validation failed:',
    errorLines: errors.map((error) => `- ${error}`),
    passMessage: 'Gherkin style validation passed.'
  };
};

module.exports = { runCheck };

if (require.main === module) {
  const { reportResult } = require('./lib/report');
  process.exit(reportResult(runCheck()) ? 0 : 1);
}
