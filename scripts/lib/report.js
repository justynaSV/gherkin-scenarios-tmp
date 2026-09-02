/**
 * Print a check result in the standard CLI format and report whether it passed.
 * Shared by every `scripts/check-*.js` (when run on its own) and by
 * `scripts/lint.js` (which runs them all in one process).
 *
 * @param {{
 *   label: string,
 *   skippedMessage?: string,
 *   failHeader?: string | null,
 *   errorLines?: string[],
 *   passMessage?: string,
 * }} result
 * @returns {boolean} `true` when the check passed (or was skipped).
 */
const reportResult = ({ label, skippedMessage, failHeader, errorLines = [], passMessage }) => {
  if (skippedMessage) {
    console.log(skippedMessage);
    return true;
  }

  if (errorLines.length > 0) {
    if (failHeader) {
      console.error(failHeader);
    }

    errorLines.forEach((line) => console.error(line));
    return false;
  }

  console.log(passMessage || `${label} passed.`);
  return true;
};

module.exports = { reportResult };
