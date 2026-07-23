# gherkin-scenarios

Reusable template for creating project-specific Gherkin scenario repositories.

Use this repository as a clean starting point for QA teams that want a consistent Copilot prompt, scenario templates, validation scripts, traceability format, and Cucumber.js structure without carrying examples from another product.

## What is included

- A reusable Copilot prompt for generating `.feature` files from pasted user stories.
- User story and feature templates in `templates/`.
- JavaScript and TypeScript step definition templates in `templates/step-definitions/`.
- Minimal Cucumber.js support files under `features/support/`.
- Empty starter folders for project feature files and step definitions.
- Gherkin linting, language validation, duplicate-step detection, and traceability checks.
- A traceability matrix template in `docs/traceability.md`.
- A tag glossary in `docs/tags.md`.
- GitHub Actions validation for pull requests and pushes to `main`.

## Create a project repository from this template

1. Create a new repository from this template.
2. Rename the package in `package.json`.
3. Rename `.github/prompts/gherkin-scenarios.prompt.md` if the project needs its own slash command.
4. Add project-specific rules to the prompt.
5. Update `.env.example` with safe placeholder URLs for the project.
6. Add project-specific feature files under `features/`.
7. Add project-specific step definitions under `features/step_definitions/` when scenarios become executable.
8. Keep `docs/traceability.md` updated whenever scenarios are added, renamed, or removed.

## How to use the prompt

1. Open Copilot Chat in VS Code.
2. Type `/gherkin-scenarios`.
3. Paste a user story, or start with only the parts you know.
4. Answer any follow-up questions about business context, process flow, business rules, or acceptance criteria.
5. Review the generated assumptions, tags, scenarios, and suggested save path.
6. Confirm the exact path before Copilot creates folders or saves the `.feature` file.

## Recommended user story format

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

## Scenario writing checklist

- Start with the main happy path.
- Add negative paths, validation errors, permissions, boundary values, and empty states.
- Prefer `Scenario Outline` when only input data changes.
- Use `Background` only for setup shared by most scenarios.
- Keep each step focused on one action or one assertion.
- Describe behavior visible to the user or API consumer.
- Avoid implementation details such as CSS selectors, database tables, or framework methods.
- Use safe example data and never include real credentials, tokens, or personal data.

## Default tags

- `@<feature-name>` on each feature, using kebab-case.
- `@smoke` on the core happy-path scenario.
- `@regression` on all scenarios that belong in the regression suite.
- `@translations` on scenarios that validate localized labels, names, tooltips, or messages.
- Domain tags when relevant, such as `@ui`, `@api`, `@security`, `@accessibility`, `@permissions`, or `@performance`.

## Validation

Use Node.js 22.12.0 or newer. The GitHub Actions workflow runs on Node 22.

Install dependencies and run validation before committing feature changes:

```sh
npm install
npm run validate
```

Validation includes:

- Gherkin formatting and naming rules from `.gherkin-lintrc`.
- Feature-language checks for Polish and English scenario text.
- Duplicate-step detection inside individual scenarios.
- Traceability coverage checks from `docs/traceability.md`.

The template validates successfully with no feature files. Once a project adds scenarios, the same validation checks the real project content.

## Running BDD scenarios

Use `docs/running-bdd.md` for the execution guide. The main commands are:

```sh
npm run bdd:dry-run
npm run bdd:smoke
npm run bdd:regression
npm run bdd
```

Executable runs require project-specific step definitions and application adapters.

## Traceability

Use `docs/traceability.md` to link story IDs, acceptance criteria, feature files, scenario names, and tags. If a feature is saved in a subfolder, use the full workspace-relative path.
