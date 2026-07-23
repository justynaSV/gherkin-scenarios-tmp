# Tag Glossary

| Tag | Use |
| --- | --- |
| `@smoke` | Critical happy-path scenario that should run first. |
| `@regression` | Scenario included in the standard regression suite. |
| `@ui` | Scenario validates browser-visible user interface behavior. |
| `@api` | Scenario validates API behavior directly. |
| `@security` | Scenario covers authentication, authorization, data exposure, or abuse resistance. |
| `@accessibility` | Scenario validates keyboard, screen reader, contrast, or WCAG-related behavior. |
| `@permissions` | Scenario validates role-based or permission-based access. |
| `@performance` | Scenario validates response time, load, or scalability expectations. |
| `@translations` | Scenario validates localized labels, names, tooltips, or messages across supported interface languages. |
| `@pl` | Feature contains Polish-language business text. |

## Rules

- Every scenario should include `@regression` unless it is intentionally excluded from automated regression.
- Each feature should include one feature-specific tag in kebab-case, for example `@password-reset`.
- Use `@pl` for features written in Polish when an explicit language tag is useful; language validation also detects Polish and English scenario text automatically.
- Use `@smoke` only for the smallest set of scenarios needed to confirm the feature is basically usable.
- Use `@translations` with a `Scenario Outline` and `jezyk` / `tlumaczenie` examples for localization checks.
- Do not commit temporary tags such as `@only`, `@skip`, `@ignore`, or `@wip`.
