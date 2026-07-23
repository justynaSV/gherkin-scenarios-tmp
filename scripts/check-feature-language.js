const fs = require('fs');
const path = require('path');

const featuresDir = path.join(process.cwd(), 'features');
const blockStartPattern = /^\s*(Feature|Background|Scenario(?: Outline)?):\s*(.*)\s*$/;
const stepPattern = /^\s*(Given|When|Then|And|But)\s+(.+)\s*$/;
const polishCharacterPattern = /[ąćęłńóśźż]/i;
const polishWords = new Set([
  'aby',
  'automatycznie',
  'brak',
  'części',
  'czesci',
  'dla',
  'do',
  'gdy',
  'ikona',
  'ikonę',
  'ikone',
  'jest',
  'jako',
  'jeśli',
  'jesli',
  'kalendarz',
  'kalendarzu',
  'na',
  'nazwa',
  'nazwy',
  'naprawa',
  'naprawie',
  'nie',
  'oraz',
  'po',
  'potwierdzone',
  'potwierdzenia',
  'przegląda',
  'przeglada',
  'system',
  'ukrycie',
  'użytkownik',
  'uzytkownik',
  'wartość',
  'wartosc',
  'weryfikuje',
  'widoczna',
  'widok',
  'wyświetlenie',
  'wyswietlenie',
  'zadanie',
  'zadaniu',
  'zaktualizowany',
  'zostaje',
  'zostały',
  'zostaly'
]);
const englishWords = new Set([
  'a',
  'able',
  'access',
  'account',
  'action',
  'administrator',
  'after',
  'an',
  'and',
  'api',
  'authentication',
  'be',
  'billing',
  'button',
  'can',
  'cannot',
  'completed',
  'credentials',
  'direct',
  'email',
  'empty',
  'enter',
  'error',
  'fields',
  'form',
  'github',
  'has',
  'i',
  'in',
  'invalid',
  'is',
  'link',
  'login',
  'member',
  'not',
  'organization',
  'page',
  'password',
  'permissions',
  'registered',
  'request',
  'reset',
  'role',
  'see',
  'settings',
  'should',
  'sign',
  'successful',
  'sensitive',
  'actions',
  'are',
  'protected',
  'that',
  'the',
  'to',
  'token',
  'unknown',
  'user',
  'valid',
  'with'
]);

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
 * @param {{ file: string, startLine: number, title: string, texts: { line: number, text: string }[] }} block
 * @returns {string[]}
 */
const validateBlock = (block) => {
  if (block.texts.length === 0) {
    return [];
  }

  const total = block.texts.reduce(
    (languages, entry) => {
      const lineScore = scoreLanguages(entry.text);
      languages.pl += lineScore.pl;
      languages.en += lineScore.en;
      return languages;
    },
    { pl: 0, en: 0 }
  );

  if (total.pl === 0 && total.en === 0) {
    return [`${block.file}:${block.startLine}: could not detect language for ${block.title}.`];
  }

  if (total.pl === total.en) {
    return [`${block.file}:${block.startLine}: ambiguous language for ${block.title}.`];
  }

  const expectedLanguage = total.pl > total.en ? 'pl' : 'en';
  const otherLanguage = expectedLanguage === 'pl' ? 'en' : 'pl';
  const errors = [];

  block.texts.forEach((entry) => {
    const lineScore = scoreLanguages(entry.text);

    if (lineScore.pl === 0 && lineScore.en === 0) {
      errors.push(`${block.file}:${entry.line}: could not detect language for text: ${entry.text}`);
      return;
    }

    if (lineScore[expectedLanguage] === 0 && lineScore[otherLanguage] > 0) {
      errors.push(
        `${block.file}:${entry.line}: expected ${expectedLanguage.toUpperCase()} text in ${block.title}: ${entry.text}`
      );
    }
  });

  return errors;
};

/** @type {string[]} */
const errors = [];

for (const featurePath of walk(featuresDir)) {
  const relativePath = path.relative(process.cwd(), featurePath).split(path.sep).join('/');
  const content = fs.readFileSync(featurePath, 'utf8');
  /** @type {{ file: string, startLine: number, title: string, texts: { line: number, text: string }[] } | null} */
  let currentBlock = null;
  let isInExamples = false;

  const flushBlock = () => {
    if (!currentBlock) {
      return;
    }

    errors.push(...validateBlock(currentBlock));
  };

  content.split(/\r?\n/).forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    const blockMatch = line.match(blockStartPattern);

    if (blockMatch) {
      flushBlock();
      isInExamples = false;
      currentBlock = {
        file: relativePath,
        startLine: lineNumber,
        title: `${blockMatch[1]}${blockMatch[2] ? `: ${blockMatch[2]}` : ''}`,
        texts: blockMatch[2] ? [{ line: lineNumber, text: blockMatch[2] }] : []
      };
      return;
    }

    if (!currentBlock || trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('@')) {
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
      currentBlock.texts.push({ line: lineNumber, text: stepMatch[2].trim() });
      return;
    }

    currentBlock.texts.push({ line: lineNumber, text: trimmed });
  });

  flushBlock();
}

if (errors.length > 0) {
  console.error('Feature language validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Feature language validation passed.');