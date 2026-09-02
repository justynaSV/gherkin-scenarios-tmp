const fs = require('fs');
const path = require('path');

const featuresDir = path.join(process.cwd(), 'features');

/**
 * Recursively find every `.feature` file under a directory.
 * @param {string} [directory] Defaults to `<cwd>/features`.
 * @returns {string[]} Absolute paths.
 */
const walkFeatureFiles = (directory = featuresDir) => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkFeatureFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.feature') ? [fullPath] : [];
  });
};

/**
 * Repo-relative, POSIX-style path (e.g. `features/foo/bar.feature`) for display.
 * @param {string} filePath
 * @returns {string}
 */
const toRelativePath = (filePath) => path.relative(process.cwd(), filePath).split(path.sep).join('/');

module.exports = { featuresDir, walkFeatureFiles, toRelativePath };
