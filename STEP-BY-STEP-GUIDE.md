# Step-by-Step Usage Guide

This guide is for using this project once you already have a clone link. It does not cover creating a new repository from the template — that part is already done for you.

## 1. Get the project on your computer

1. Open a terminal (or Git Bash / PowerShell).
2. Run the clone command you were given, for example:

   ```sh
   git clone <link-you-received>
   cd <cloned-folder-name>
   ```

3. Open the folder in VS Code:

   ```sh
   code .
   ```

   Or use **File > Open Folder** in VS Code and select the folder.

## 2. Install the required VS Code extensions

When you open the folder, VS Code shows a notification to install the recommended extensions.

1. Click **Install All** in that notification.
2. If you missed the notification, open the Extensions view (`Ctrl+Shift+X`), type `@recommended`, and install everything listed under **Workspace Recommendations**.

You need:

- **GitHub Copilot Chat** (`GitHub.copilot-chat`) — used to generate scenarios from a user story.
- **Cucumber** (`CucumberOpen.cucumber-official`) — highlights `.feature` files and autocompletes steps.

## 3. Install the project dependencies

You need [Node.js](https://nodejs.org/) 22.12.0 or newer installed.

In the VS Code terminal (**Terminal > New Terminal**), run:

```sh
npm install
```

Run this once, and again any time `package.json` changes.

## 4. Write your user story

Prepare the user story you want to turn into test scenarios. Use this structure as a starting point:

```text
As a <role>
I want <capability>
So that <business value>

Acceptance criteria:
- Given <context>, when <action>, then <outcome>

Business rules:
- <any rule, calculation, or constraint>

Out of scope:
- <anything explicitly not covered>
```

You can also start from the file `templates/user-story-paste.template.txt` and fill in the blanks.

### Optional: use a Jira link instead of pasting the story

If your story lives in Jira, you can give Copilot the issue link (e.g. `https://<site>.atlassian.net/browse/PROJ-123`) or bare key (`PROJ-123`) in step 5 instead of pasting the text. One-time setup per machine:

1. Open the Command Palette (`Ctrl+Shift+P`) and run **MCP: Add Server**.
2. Choose **HTTP**, enter name `atlassian` and URL `https://mcp.atlassian.com/v1/mcp`, then pick the **Global** scope so it's available in every repo, not just this one.
3. Run **MCP: List Servers**, select `atlassian`, and choose **Start Server** — this opens a browser window to log in with your Atlassian/Jira Cloud account. Complete the login once.
4. From then on, pasting a Jira link or key into `/gherkin-scenarios` fetches the summary, description, acceptance criteria, and sub-tasks automatically.

If you skip this setup, just paste the story text as shown above.

## 5. Generate the feature file with Copilot

1. Open **Copilot Chat** in VS Code (the chat icon in the sidebar, or `Ctrl+Alt+I`).
2. Type the command:

   ```text
   /gherkin-scenarios
   ```

3. Paste your user story right below the command and send it.
4. Answer any follow-up questions Copilot asks (missing rules, roles, edge cases, and so on).
5. Read the generated scenarios, tags, and the suggested file path.
6. Confirm you are happy with it, then let Copilot save the `.feature` file, or approve the suggested path when asked.

Feature files are saved under the `features/` folder, grouped by module, for example:

```text
features/login/password-reset.feature
features/orders/order-cancellation.feature
```

## 6. Check the traceability table

Open `docs/traceability.md` and confirm your new scenario has a row, for example:

```md
| Story ID | Acceptance criterion | Feature file | Scenario name | Tags |
| --- | --- | --- | --- | --- |
| LOGIN-001 | Registered user can sign in | `features/login/login.feature` | Successful login with valid credentials | `@smoke @regression @ui` |
```

If a row is missing, add one manually.

## 7. Validate your changes

Run this before committing anything:

```sh
npm run validate
```

This checks Gherkin formatting, feature language, duplicate steps, and traceability. Fix anything it reports before moving on.

## 8. (Optional) Add step definitions to make scenarios executable

Feature files are readable on their own, but they only run as automated tests once step definitions exist.

To generate stub step definitions for a module:

```sh
npm run create:module -- <module-folder-name>
```

Example:

```sh
npm run create:module -- orders
```

This creates `features/~step_definitions/orders.steps.js` with one stub per step used in `features/orders/*.feature`. Open that file and replace the `TODO` / `'pending'` bodies with real automation code. It is safe to re-run the command later — it only adds new steps, it never overwrites what you already wrote.

## 9. Run the scenarios

Once step definitions are implemented, run scenarios with:

```sh
npm run bdd:smoke
npm run bdd:regression
npm run bdd
```

Use `npm run bdd:dry-run` any time to check for undefined steps without actually running anything.

## 10. Commit and share your work

```sh
git add .
git commit -m "Add scenarios for <story-id>"
git push
```

Open a pull request if your team reviews changes that way.

## Quick reference

| Task | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Open Copilot prompt | `/gherkin-scenarios` in Copilot Chat |
| Validate everything | `npm run validate` |
| Generate step stubs for a module | `npm run create:module -- <module>` |
| Check for undefined steps | `npm run bdd:dry-run` |
| Run smoke scenarios | `npm run bdd:smoke` |
| Run regression scenarios | `npm run bdd:regression` |
| Run all scenarios | `npm run bdd` |

If you get stuck, the full reference guide is in `docs/getting-started.md`.
