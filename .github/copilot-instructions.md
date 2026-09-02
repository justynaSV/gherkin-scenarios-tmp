# Repository conventions

- Maintainer note (only applies if sibling repos are actually present, e.g. in the maintainer's multi-root
  workspace — ignore this bullet entirely if this repo is checked out on its own, which is the normal case for
  end users): this repo is one of 4 near-identical siblings — `gherkin-scenarios` (template),
  `gherkin-scenarios-playground`, `gherkin-scenarios-SVC-Blacharis`, `gherkin-scenarios-tmp`. Workflow/tooling
  changes (`.github/prompts/gherkin-scenarios.prompt.md`, `scripts/`, `docs/`, `cucumber.js`, `.vscode/settings.json`,
  `package.json` scripts, README/STEP-BY-STEP-GUIDE) should be mirrored across all 4 unless a change is explicitly
  repo-specific (e.g. actual `.feature` content, module folders). Do not reference or try to access sibling repos
  when they aren't present in the current workspace.
- Step definitions and hooks live in `features/~step_definitions/` and `features/~support/` — the leading `~` makes
  them sort after all feature module folders in the Explorer. Never reintroduce unprefixed
  `features/step_definitions` or `features/support` paths.
- Feature files are grouped into module folders under `features/` (e.g. `features/calendar icons/`). After saving a
  new or updated `.feature` file, run `npm run create:module -- <module-folder>` to regenerate matching step stubs
  at `features/~step_definitions/<module-folder>.steps.js` (safe to re-run; only appends missing steps).
- After saving a new or updated `.feature` file, also run `npm run trace:generate` to regenerate `docs/traceability.md`
  from the `# Zadanie`/`# AC` comments and tags. `docs/traceability.md` is generated — never edit it by hand, and
  `npm run validate` fails if it is stale.
- File-save confirmations must use the `vscode_askQuestions` tool with Yes/No options, not a plain chat question.
- If given a Jira URL or bare issue key (e.g. `PROJ-123`) instead of pasted user-story text, use the Atlassian MCP
  tools to fetch the issue content first; only ask the user to paste text if MCP is unavailable or fails.
- npm scripts: `bdd` / `bdd:dry-run` / `bdd:regression` / `bdd:smoke` run Cucumber profiles. `lint` (aliased by
  `validate`) runs `scripts/lint.js`, which runs the Gherkin-style, feature-language, duplicate-step and
  traceability-freshness checks in one process; each is also runnable on its own via `lint:gherkin` / `lint:language`
  / `lint:steps` / `lint:traceability`. `validate` does not run Cucumber — use `npm run bdd:dry-run` separately to
  catch undefined steps.
- Do not recreate a local web UI (`tools/ui`) — it was added then intentionally removed as not useful; don't add it
  back unless explicitly asked again.
