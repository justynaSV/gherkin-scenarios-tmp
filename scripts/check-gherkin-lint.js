const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const featuresDir = path.join(process.cwd(), 'features');

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

const featureFiles = walk(featuresDir).map((filePath) => path.relative(process.cwd(), filePath));

if (featureFiles.length === 0) {
  console.log('No feature files found. Skipping Gherkin lint.');
  process.exit(0);
}

const executable = process.platform === 'win32' ? 'gherkin-lint.cmd' : 'gherkin-lint';
const result = spawnSync(executable, ['-c', '.gherkin-lintrc', ...featureFiles], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

process.exit(result.status ?? 1);