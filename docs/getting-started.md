# Getting Started

This guide explains how to create a project-specific Gherkin scenario repository from this template, write scenarios from user stories with Copilot, and add step definitions when the scenarios should become executable.

## 1. Create or import the repository

Use this repository as the source template. For each QA project, create a separate repository so project rules, tags, fixtures, and automation can evolve independently.

### Option A: Create from a Git hosting template

1. Open the template repository in GitHub or GitLab.
2. Choose the template creation option, for example **Use this template** in GitHub.
3. Name the new repository after the project, for example `my-project-gherkin-scenarios`.
4. Clone the new repository locally:

```sh
git clone <repository-url>
cd <repository-folder>
```

### Option B: Import from Git manually

1. Clone the template repository:

```sh
git clone <template-repository-url> my-project-gherkin-scenarios
cd my-project-gherkin-scenarios
```

2. Remove the template Git remote and connect the project repository:

```sh
git remote remove origin
git remote add origin <new-project-repository-url>
```

3. Push the project repository:

```sh
git push -u origin main
```

## 2. Open the project in VS Code

1. Open VS Code.
2. Choose **File > Open Folder**.
3. Select the cloned project folder.
4. When VS Code shows a prompt to install the recommended extensions, click **Install All**. Otherwise, install them manually (see below).
5. Open Copilot Chat.

### Required and recommended extensions

- **GitHub Copilot Chat** (`GitHub.copilot-chat`) — required to run the `/gherkin-scenarios` prompt.
- **Cucumber** (`CucumberOpen.cucumber-official`) — required for `.feature` file syntax highlighting, step autocompletion, and jumping from a Gherkin step to its step definition. The repository's `.vscode/settings.json` already configures `cucumber.glue` and `cucumber.features` for this extension.

These extensions are listed in `.vscode/extensions.json`, so VS Code recommends them automatically when the folder is opened.

The prompt file lives at `.github/prompts/gherkin-scenarios.prompt.md`. In Copilot Chat, it is available as:

```text
/gherkin-scenarios
```

If the project needs its own command name, rename the prompt file, for example:

```text
.github/prompts/my-project.prompt.md
```

After renaming, use the matching command in Copilot Chat:

```text
/my-project
```

## 3. Run first validation

Use Node.js 22.12.0 or newer.

```sh
npm run validate
```

Validation is self-contained and does not require `npm install`. The template validates successfully before any feature files are added. After the team adds scenarios, the same command checks the real project content.

Install dependencies only when you want to run Cucumber commands such as `npm run bdd:dry-run`, `npm run bdd:smoke`, or `npm run bdd`:

```sh
npm install
```

## 4. Customize the template for the project

Before writing the first real scenarios, update the project-specific basics:

1. Change the package name in `package.json`.
2. Update `.env.example` with safe placeholder URLs for the application under test.
3. Add project-specific rules to `.github/prompts/gherkin-scenarios.prompt.md`.
4. Update `docs/tags.md` if the project needs domain-specific tags.
5. Leave `docs/traceability.md` alone — it is generated from the feature files by `npm run trace:generate`, not edited by hand.

Good project-specific prompt rules include:

- preferred business vocabulary,
- supported languages,
- common roles,
- required tags,
- modules under `features/`,
- scenario types that should always be considered,
- behavior that should stay out of scope.

## 5. Prepare the user story

You can paste a full story directly into Copilot Chat. When possible, use this structure:

```text
Story

AS A <role or user type>
I WANT <capability or action>
TO <business outcome or user value>

Business context & logic
- <why this story matters>
- <business rule, policy, calculation, validation, or constraint>

Business process flow
1. <starting context or trigger>
2. <main user or system action>
3. <decision point, validation, or alternate path>
4. <expected process outcome>

Acceptance criteria
- Given <context>, when <action>, then <expected result>
- Given <error or edge case>, when <action>, then <expected result>
```

If some information is missing, the prompt should ask follow-up questions before generating scenarios.

### Optional: use a Jira link instead of pasting the story

Instead of pasting the story text, you can give Copilot a Jira issue link (e.g. `https://<site>.atlassian.net/browse/PROJ-123`) or bare key (`PROJ-123`) in step 6. One-time setup per machine:

1. Open the Command Palette (`Ctrl+Shift+P`) and run **MCP: Add Server**.
2. Choose **HTTP**, enter name `atlassian` and URL `https://mcp.atlassian.com/v1/mcp`, then pick the **Global** scope so it's available in every repo, not just this one.
3. Run **MCP: List Servers**, select `atlassian`, and choose **Start Server** — this opens a browser window to log in with your Atlassian/Jira Cloud account. Complete the login once.
4. From then on, pasting a Jira link or key into `/gherkin-scenarios` fetches the summary, description, acceptance criteria, and sub-tasks automatically.

If you skip this setup, just paste the story text as shown above.

## 6. Generate a feature file with Copilot

1. Open Copilot Chat.
2. Type the prompt command:

```text
/gherkin-scenarios
```

3. Paste the user story below the command.
4. Answer any follow-up questions.
5. Review the assumptions, tags, scenarios, and suggested file path.
6. Confirm the save path only after the generated feature looks correct.

Feature files should be saved under `features/`. Use subfolders for larger modules, for example:

```text
features/login/password-reset.feature
features/orders/order-cancellation.feature
features/calendar/appointment-rescheduling.feature
```

Each first-level folder under `features/` is treated as a separate module. After adding or updating `.feature` files in a module folder, generate the matching step-definition file with:

```sh
npm run create:module -- orders
```

This creates `features/orders/` (if it does not exist yet) and generates `features/~step_definitions/orders.steps.js` with one stub per **unique step actually used in that module's feature files** (converted to a Cucumber Expression, e.g. `{string}`/`{int}` placeholders) — not generic placeholder text. Re-run the same command after editing a feature file; it only appends the steps that are still missing, so it never overwrites work you've already implemented.

The Copilot prompt is configured to run `npm run create:module -- <module-folder>` automatically after saving a feature file in a new module folder.

## 7. Update traceability

`docs/traceability.md` is generated from the `.feature` files — never edit the table by hand. It maps every scenario to its story ID, acceptance criteria, feature file, and tags.

The generator reads, per feature file:

- **Story ID** — the first ticket-shaped reference (e.g. `PROJ-123`) in a comment above the `Feature:` line.
- **Acceptance criterion** — `# AC:` / `# AC1:` comments above each scenario.
- **Tags** — feature-level and scenario-level tags combined.

Regenerate it after adding, renaming, moving, or removing a scenario:

```sh
npm run trace:generate
```

`npm run validate` fails if `docs/traceability.md` is stale, so regenerate and commit it alongside the feature change. The Copilot prompt is configured to run `npm run trace:generate` automatically after saving a feature file.

## 8. Create step definitions

Step definitions connect Gherkin text to executable JavaScript or TypeScript code.

Create step definition files under:

```text
features/~step_definitions/
```

Use the module name in the file name:

```text
features/~step_definitions/login.steps.js
features/~step_definitions/orders.steps.js
features/~step_definitions/permissions.steps.js
```

Start from the templates in `templates/step-definitions/` when useful.

### JavaScript example

For this Gherkin scenario:

```gherkin
Scenario: Successful login with valid credentials
  Given the login page is open
  When the user signs in with valid credentials
  Then the dashboard is displayed
```

Create `features/~step_definitions/login.steps.js`:

```js
const assert = require('assert/strict');
const { Given, When, Then, world } = require('@cucumber/cucumber');

Given('the login page is open', async () => {
  await world.app.openLoginPage();
});

When('the user signs in with valid credentials', async () => {
  world.loginResult = await world.app.login({
    username: world.testUsers.valid.username,
    password: world.testUsers.valid.password
  });
});

Then('the dashboard is displayed', async () => {
  assert.equal(await world.app.currentPage(), 'dashboard');
});
```

The `world` object is shared state for the scenario. Add project-specific drivers, test users, API clients, or page objects to `features/~support/world.js`.

## 9. Add project support code

The clean template includes a minimal Cucumber World in `features/~support/world.js`. For executable tests, extend it with project-specific helpers.

Common additions include:

- an app or page driver,
- API client setup,
- safe test users,
- reusable test data,
- cleanup logic after each scenario.

Keep secrets out of Git. Put real URLs, users, and passwords in local environment variables or CI secrets. Keep only safe placeholders in `.env.example`.

## 10. Check undefined steps

After adding feature files, run a dry run:

```sh
npm run bdd:dry-run
```

If Cucumber reports undefined steps, run `npm run create:module -- <module-folder>` to generate stubs for them, then implement the `TODO` bodies (they return `'pending'` until you do) in `features/~step_definitions/`.

## 11. Run scenarios

Use tags to run smaller groups:

```sh
npm run bdd:smoke
npm run bdd:regression
npm run bdd
```

Full executable runs require project-specific step definitions and support code. Reports are written to `reports/`.

## 12. Commit and open a pull request

Before committing, run:

```sh
npm run validate
npm install
npm run bdd:dry-run
```

Then commit the scenario changes:

```sh
git add .
git commit -m "Add scenarios for <story-id>"
git push
```

Open a pull request for review. The CI workflow validates feature files and traceability before merge.

## Recommended workflow

1. Create or update the user story.
2. Generate the feature file with Copilot.
3. Review scenarios with QA, product, and developers.
4. Regenerate traceability with `npm run trace:generate`.
5. Run `npm run validate`.
6. Add step definitions when automation is needed.
7. Run `npm install` and `npm run bdd:dry-run`.
8. Run tagged executable scenarios when project support code is ready.
9. Commit and open a pull request.