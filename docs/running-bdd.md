# Running BDD Scenarios

This template supports two levels of work:

1. Safe validation for feature files and traceability.
2. Executable Cucumber runs after a project adds step definitions and application adapters.

## Safe validation

```sh
npm run validate
```

This runs:

- Built-in Gherkin style validation when `.feature` files exist.
- Feature-language validation.
- Duplicate-step detection inside scenarios.
- Traceability coverage checks.

The template passes validation before any project-specific feature files are added. This validation is self-contained and does not require `npm install`.

## Dry run

After adding feature files and step definitions, use a Cucumber dry run to catch undefined steps:

```sh
npm install
npm run bdd:dry-run
```

## Executable runs

Copy `.env.example` values into your local shell or CI variables, then update them for the application under test:

```sh
TARGET_BASE_URL=https://example.test \
API_BASE_URL=https://api.example.test \
npm run bdd
```

Useful profiles:

```sh
npm run bdd:smoke
npm run bdd:regression
npm run bdd
```

## Reports

Executable runs write reports to `reports/`:

- `reports/cucumber-report.html`
- `reports/cucumber-report.json`
- `reports/cucumber-report.xml`

The `reports/` directory is ignored by Git because reports are generated artifacts.
