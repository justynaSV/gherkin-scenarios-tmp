const fs = require('fs');
const { walkFeatureFiles, toRelativePath } = require('./lib/feature-files');

const stepPattern = /^\s*(Given|When|Then|And|But)\s+(.+)\s*$/;
const blockTitlePattern = /^\s*(?:Feature|Background|Scenario(?: Outline)?):\s*(.*)\s*$/;
const polishCharacterPattern = /[ąćęłńóśźż]/i;

// Polish diacritics are the primary PL signal (worth +2 per word below). The word
// lists are only a tie-breaker (+1) for lines and files that happen to have no
// diacritics at all. They are deliberately common *function words*, not domain
// vocabulary — feature files change constantly, function words do not, so these
// lists never need maintenance. Words shorter than 3 characters are left out on
// purpose: they collide across languages (PL "do"/"na" vs. EN "do"/"an").
const polishWords = new Set([
  'aby',
  'albo',
  'bez',
  'brak',
  'czy',
  'dla',
  'gdy',
  'jak',
  'jako',
  'jest',
  'jeśli',
  'jesli',
  'lub',
  'nie',
  'oraz',
  'przy',
  'tak',
  'wtedy',
  'żeby',
  'zeby'
]);
const englishWords = new Set([
  'and',
  'are',
  'can',
  'does',
  'for',
  'from',
  'has',
  'have',
  'into',
  'must',
  'not',
  'should',
  'that',
  'the',
  'then',
  'this',
  'when',
  'will',
  'with'
]);

/**
 * @param {string} text
 * @returns {{ pl: number, en: number }}
 */
const scoreLanguages = (text) => {
  const normalized = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/"[^"]*"/g, ' ')
    .toLowerCase();

  const words = normalized.match(/[a-ząćęłńóśźż]+/gi) || [];
  const score = { pl: 0, en: 0 };

  words.forEach((word) => {
    if (polishCharacterPattern.test(word)) {
      score.pl += 2;
    }

    if (polishWords.has(word)) {
      score.pl += 1;
    }

    if (englishWords.has(word)) {
      score.en += 1;
    }
  });

  return score;
};

/**
 * Collects every human-readable line (titles + steps), skipping tags, tables, comments and blank lines.
 * @param {string} content
 * @returns {{ line: number, text: string }[]}
 */
const extractTexts = (content) => {
  /** @type {{ line: number, text: string }[] } */
  const texts = [];
  let isInExamples = false;

  content.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();

    if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('@')) {
      return;
    }

    if (/^Examples:\s*$/i.test(trimmed)) {
      isInExamples = true;
      return;
    }

    if (isInExamples || trimmed.startsWith('|')) {
      return;
    }

    const stepMatch = line.match(stepPattern);

    if (stepMatch) {
      texts.push({ line: lineNumber, text: stepMatch[2].trim() });
      return;
    }

    const titleMatch = line.match(blockTitlePattern);
    const text = titleMatch ? titleMatch[1].trim() : trimmed;

    if (text) {
      texts.push({ line: lineNumber, text });
    }
  });

  return texts;
};

const runCheck = () => {
  /** @type {string[]} */
  const errors = [];

  for (const featurePath of walkFeatureFiles()) {
    const relativePath = toRelativePath(featurePath);
    const content = fs.readFileSync(featurePath, 'utf8');
    const texts = extractTexts(content);

    if (texts.length === 0) {
      continue;
    }

    // Determine the file's dominant language from its overall vocabulary, instead of
    // per-block, so short lines with no vocabulary signal of their own aren't judged in isolation.
    const total = texts.reduce(
      (languages, entry) => {
        const lineScore = scoreLanguages(entry.text);
        languages.pl += lineScore.pl;
        languages.en += lineScore.en;
        return languages;
      },
      { pl: 0, en: 0 }
    );

    // No signal at all (e.g. only numbers/quoted values) - nothing to validate against, skip.
    if (total.pl === 0 && total.en === 0) {
      continue;
    }

    if (total.pl === total.en) {
      errors.push(`${relativePath}: ambiguous dominant language (equal PL/EN signal) - please check manually.`);
      continue;
    }

    const expectedLanguage = total.pl > total.en ? 'pl' : 'en';
    const otherLanguage = expectedLanguage === 'pl' ? 'en' : 'pl';

    texts.forEach((entry) => {
      const lineScore = scoreLanguages(entry.text);

      // Only flag lines with actual signal for the other language and none for the expected
      // one - a line with no vocabulary signal at all is ambiguous, not wrong, so it's not an error.
      if (lineScore[otherLanguage] > 0 && lineScore[expectedLanguage] === 0) {
        errors.push(
          `${relativePath}:${entry.line}: expected ${expectedLanguage.toUpperCase()} text, found ${otherLanguage.toUpperCase()} signal only: ${entry.text}`
        );
      }
    });
  }

  return {
    label: 'Feature language validation',
    failHeader: 'Feature language validation failed:',
    errorLines: errors.map((error) => `- ${error}`),
    passMessage: 'Feature language validation passed.'
  };
};

module.exports = { runCheck };

if (require.main === module) {
  const { reportResult } = require('./lib/report');
  process.exit(reportResult(runCheck()) ? 0 : 1);
}