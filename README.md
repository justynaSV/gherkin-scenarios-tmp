# gherkin-scenarios

Reusable template for creating project-specific Gherkin scenario repositories.

Use this repository when a QA team needs a clean starting point for writing scenarios from user stories, validating `.feature` files, tracking traceability, and later adding executable Cucumber.js step definitions.

## Start Here

If you are setting up a new QA project, start with `docs/getting-started.md`.

That guide walks through the full process:

1. Create or import a project repository from this template.
2. Open the project in VS Code.
3. Run first validation.
4. Customize the prompt and project settings.
5. Paste a user story into Copilot Chat.
6. Generate and save a `.feature` file.
7. Update traceability.
8. Add step definitions.
9. Run validation and Cucumber checks.
10. Commit and open a pull request.

## What This Template Gives You

- A Copilot prompt for generating Gherkin `.feature` files from pasted user stories.
- A guided workflow document in `docs/getting-started.md`.
- User story and feature templates in `templates/`.
- JavaScript and TypeScript step definition templates in `templates/step-definitions/`.
- Minimal Cucumber.js support files under `features/~support/`.
- Empty starter folders for project feature files and step definitions.
- Built-in Gherkin style validation, language validation, duplicate-step detection, and traceability checks.
- A traceability matrix template in `docs/traceability.md`.
- A tag glossary in `docs/tags.md`.
- GitHub Actions validation for pull requests and pushes to `main`.

## Repository Layout

```text
.github/
  prompts/
    gherkin-scenarios.prompt.md
  workflows/
    validate-features.yml

docs/
  getting-started.md
  running-bdd.md
  tags.md
  traceability.md

features/
  ~step_definitions/
  ~support/

templates/
  feature.template
  user-story-paste.template.txt
  user-story.template.txt
  step-definitions/

scripts/
  check-duplicate-steps.js
  check-feature-language.js
  check-gherkin-style.js
  check-traceability.js
  create-module.js
```

## Create a Project Repository

For the full workflow, use `docs/getting-started.md`.

Short version:

1. Create a new repository from this template.
2. Rename the package in `package.json`.
3. Rename `.github/prompts/gherkin-scenarios.prompt.md` if the project needs its own slash command.
4. Add project-specific rules to the prompt.
5. Update `.env.example` with safe placeholder URLs for the project.
6. Add feature files under `features/`.
7. For every new module folder under `features/`, create a matching step-definition file under `features/~step_definitions/`.
8. Keep `docs/traceability.md` updated whenever scenarios are added, renamed, or removed.

## Use The Copilot Prompt

1. Open Copilot Chat in VS Code.
2. Type:

```text
/gherkin-scenarios
```

3. Paste a user story below the command.
4. Answer follow-up questions about business context, process flow, business rules, or acceptance criteria.
5. Review the generated assumptions, tags, scenarios, and suggested save path.
6. Confirm the exact path before Copilot creates folders or saves the `.feature` file.

The prompt asks where to save a feature when no target folder is clear. Feature files should live under `features/`, for example:

```text
features/login/password-reset.feature
features/orders/order-cancellation.feature
features/calendar/appointment-rescheduling.feature
```

Each first-level folder under `features/` is treated as a separate module. When the prompt creates a new module folder such as `features/orders/`, it also runs `npm run create:module -- orders` to generate `features/~step_definitions/orders.steps.js`.

You can create the module folder and matching step-definition scaffold manually with:

```sh
npm run create:module -- orders
```

This parses every `.feature` file already in `features/orders/` and generates stub functions in `features/~step_definitions/orders.steps.js` using the real Gherkin step text as the Cucumber Expression (not generic placeholders). Steps that already exist in the file are left untouched; only missing ones are appended, so re-running it after editing a feature is safe.

## Recommended User Story Format

You can start from `templates/user-story.template.txt`, or use `templates/user-story-paste.template.txt` when pasting a fuller story into the `/gherkin-scenarios` prompt.

```text
As a <role>
I want <capability>
So that <business value>

Acceptance criteria:
- Given <context>, when <action>, then <outcome>
- ...

Business rules:
- ...

Out of scope:
- ...
```

## Scenario Writing Checklist

- Start with the main happy path.
- Add negative paths, validation errors, permissions, boundary values, and empty states.
- Prefer `Scenario Outline` when only input data changes.
- Use `Background` only for setup shared by most scenarios.
- Keep each step focused on one action or one assertion.
- Describe behavior visible to the user or API consumer.
- Avoid implementation details such as CSS selectors, database tables, or framework methods.
- Use safe example data and never include real credentials, tokens, or personal data.

## Default Tags

- `@<feature-name>` on each feature, using kebab-case.
- `@smoke` on the core happy-path scenario.
- `@regression` on all scenarios that belong in the regression suite.
- `@translations` on scenarios that validate localized labels, names, tooltips, or messages.
- Domain tags when relevant, such as `@ui`, `@api`, `@security`, `@accessibility`, `@permissions`, or `@performance`.

## Validation

Use Node.js 22.12.0 or newer. The GitHub Actions workflow runs on Node 22.

Run validation before committing feature changes:

```sh
npm run validate
```

Validation is self-contained and does not require `npm install`. This keeps the first run simple for QA users and avoids missing local command shims from external packages.

Validation includes:

- Built-in Gherkin style and naming rules.
- Feature-language checks for Polish and English scenario text.
- Duplicate-step detection inside individual scenarios.
- Traceability coverage checks from `docs/traceability.md`.

The template validates successfully with no feature files. Once a project adds scenarios, the same validation checks the real project content.

## Step Definitions

Feature files can start as reviewable BDD documentation. When the project is ready to automate them, add step definitions under:

```text
features/~step_definitions/
```

Use the templates in `templates/step-definitions/` as a starting point. The detailed workflow is in `docs/getting-started.md`.

Module convention:

- `features/orders/` -> `features/~step_definitions/orders.steps.js`
- `features/password-reset/` -> `features/~step_definitions/password-reset.steps.js`

## Running BDD Scenarios

Use `docs/running-bdd.md` for the execution guide. The main commands are:

Install dependencies before running Cucumber commands:

```sh
npm install
```

```sh
npm run bdd:dry-run
npm run bdd:smoke
npm run bdd:regression
npm run bdd
```

Executable runs require project-specific step definitions and application adapters.

## Traceability

Use `docs/traceability.md` to link story IDs, acceptance criteria, feature files, scenario names, and tags. If a feature is saved in a subfolder, use the full workspace-relative path.
