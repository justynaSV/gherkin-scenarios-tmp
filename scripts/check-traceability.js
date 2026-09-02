// docs/traceability.md is a generated file (see generate-traceability.js).
// This check just confirms nobody edited/added/removed a scenario without
// regenerating it — no more relying on memory to keep it in sync.
const { generateTraceability } = require('./generate-traceability');

const runCheck = () => generateTraceability({ check: true });

module.exports = { runCheck };

if (require.main === module) {
  const { reportResult } = require('./lib/report');
  process.exit(reportResult(runCheck()) ? 0 : 1);
}
