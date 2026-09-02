---
description: "Generate Gherkin .feature file from a user story. Use when: creating test scenarios, writing Cucumber scenarios, converting user stories to BDD, writing acceptance criteria in Gherkin."
name: "Gherkin Scenarios"
argument-hint: "Paste your user story, or a Jira epic/story link or key..."
agent: "agent"
---

Generate a Gherkin `.feature` file based on the following user story:

```
$args
```

## Jira input

If `$args` is a Jira issue URL (e.g. `https://<site>.atlassian.net/browse/<KEY>`) or a bare issue key (e.g. `PROJ-123`), use the Atlassian MCP tools to fetch that epic/story instead of asking the user to paste it:

- Fetch the summary, description, and any acceptance-criteria fields, plus linked sub-tasks if the issue is an epic.
- Map the fetched fields onto the Story/Business context/Acceptance criteria structure below.
- If the Atlassian MCP tools are unavailable or the fetch fails, tell the user and ask them to paste the story text instead.
- Still ask follow-up questions if the fetched content is missing required sections.

Prefer collecting the story in the structure from `templates/user-story-paste.template.txt`:

- Story: AS A, I WANT, TO
- Business context & logic
- Business process flow
- Acceptance criteria

If any of these sections are missing, unclear, or too thin to generate useful scenarios, ask concise follow-up questions for the missing parts before generating the `.feature` file. Do not force exact headings or capitalization when the pasted story already contains equivalent information.

## Rules

1. **Language**: Write all Gherkin content in the same language as the user story.
2. **Structure**: Use standard Gherkin keywords (`Feature`, `Scenario`, `Background`, `Scenario Outline`, `Examples`, `Given`, `When`, `Then`, `And`, `But`).
3. **Scenarios**:
   - Cover the **happy path** first.
   - Cover **edge cases** and **negative/error paths** relevant to the story.
  - Cover validation rules, permissions, empty states, boundary values, and external service failures when relevant.
   - Use `Scenario Outline` + `Examples` table when multiple similar cases differ only in data.
   - Use `Background` when multiple scenarios share identical setup steps.
4. **Traceability**: Add a short comment before each scenario group that maps it to a user-story acceptance criterion when acceptance criteria are provided.
5. **Step granularity**: Each step should describe **one action or one assertion** — avoid compound steps.
6. **Quality rules**:
  - Prefer observable behavior over implementation details.
  - Avoid vague assertions like "the system works" or "the page is correct".
  - Avoid UI selectors, CSS classes, database names, and automation details.
  - Use realistic but safe test data. Do not include real passwords, tokens, or personal data.
  - If the user story is ambiguous after follow-up questions, list assumptions before the feature file.
7. **Tagging strategy**:
   - Tag every `Feature` with `@<feature-name>` (kebab-case).
   - Tag the happy-path scenario(s) with `@smoke`.
   - Tag all scenarios with `@regression`.
  - Add any domain-specific tags (e.g. `@ui`, `@api`, `@security`, `@accessibility`, `@performance`) when clearly applicable.
  - Add `@translations` to scenarios that validate localized names, labels, tooltips, or messages. Use a `Scenario Outline` with `jezyk` and `tlumaczenie` examples so the structure stays consistent across features:

```gherkin
  @translations
  Scenario Outline: Wyświetlenie poprawnego tłumaczenia nazwy <elementu> w zależności od języka
    Given <element> jest widoczny dla użytkownika
    And użytkownik ma ustawiony język interfejsu "<jezyk>"
    When użytkownik wyświetla tekst <elementu>
    Then użytkownik widzi nazwę <elementu> "<tlumaczenie>"

    Examples:
      | jezyk | tlumaczenie      |
      | pl-PL | <polski tekst>   |
      | en    | <angielski tekst> |
      | cz    | <czeski tekst>   |
```
8. **File location**:
  - Suggest a target path under `features/`, not only a file name.
  - If the user names an existing module folder, use it, for example `features/<module-folder>/<kebab-case-name>.feature`.
  - If the user asks for a new module folder, treat that folder as a separate feature module. Suggest the new folder under `features/` and create it only after save confirmation.
  - After saving a new or updated `.feature` file inside a module folder, run `npm run create:module -- <module-folder>` to generate/update the matching step-definition file at `features/~step_definitions/<module-folder>.steps.js`.
  - That script parses the module's `.feature` files and generates one step stub per unique step (using the real Gherkin step text as a Cucumber Expression), instead of generic placeholder steps. It only appends steps that are still missing, so it is safe to re-run after every change.
  - After saving a new or updated `.feature` file, also run `npm run trace:generate` to regenerate `docs/traceability.md` from the `# Zadanie`/`# AC` comments and tags in the feature files. Never edit `docs/traceability.md` by hand. `npm run validate` fails if the matrix is stale.
  - If no target folder is provided, ask where to save the feature before creating the file. Offer `features/`, any clearly relevant existing subfolder, and an option to provide a new folder name.
9. **File naming**: Suggest a file name in `kebab-case.feature` format at the top of your response.
10. **Save confirmation**: After generating the full feature content, use the `vscode_askQuestions` tool (not a plain chat question) to ask for confirmation with Yes/No options, so the user can click a button instead of typing. If the path creates a new module folder, mention that `npm run create:module -- <module-folder>` will also be run to generate matching step definitions. Mention that `npm run trace:generate` will also be run to update `docs/traceability.md`. Do not create folders, feature files, or step-definition files unless the user confirms with "Yes".
11. **After save**: Once the file is saved and the user confirmed, run `npm run create:module -- <module-folder>` (if a module folder is involved) and then `npm run trace:generate`, so step stubs and the traceability matrix are both up to date without the user having to remember.

## Output format

First output assumptions when needed, then the suggested path as a comment, then the full `.feature` file content. After the code block, call `vscode_askQuestions` with a single question: header `"Save file"`, question text `Should I create and save this file at <features/path>/<kebab-case-name>.feature?` (append the create:module note to the question text if a new module folder is created, and note that `npm run trace:generate` will also run to update the traceability matrix), and options `Yes` (recommended) and `No`.

```gherkin
# Suggested path: features/<optional-module-folder>/<kebab-case-name>.feature

@<feature-tag>
Feature: <Feature title>
  <Optional: one-line description>

  Background: (if applicable)
    Given ...

  @smoke @regression
  Scenario: <Happy path title>
    Given ...
    When ...
    Then ...

  @regression
  Scenario: <Edge/negative case title>
    Given ...
    When ...
    Then ...
```
