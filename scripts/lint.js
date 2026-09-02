// Runs every feature-file check in a single Node process (one directory walk,
// one parse pass) instead of spawning `node scripts/check-*.js` four times.
// Each check is still runnable on its own via `npm run lint:<name>`.
const { reportResult } = require('./lib/report');

const checks = [
  require('./check-gherkin-style'),
  require('./check-feature-language'),
  require('./check-duplicate-steps'),
  require('./check-traceability')
];

let ok = true;

checks.forEach((check, index) => {
  if (index > 0) {
    console.log('');
  }

  if (!reportResult(check.runCheck())) {
    ok = false;
  }
});

process.exit(ok ? 0 : 1);
