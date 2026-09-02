# CLAUDE.md

This project's working conventions are shared with GitHub Copilot. See:

@.github/copilot-instructions.md

## Claude Code specifics

- The `/gherkin-scenarios` slash command is defined in `.claude/commands/gherkin-scenarios.md`
  (the Claude Code port of `.github/prompts/gherkin-scenarios.prompt.md`). Run it with
  `/gherkin-scenarios <user story text, or a Jira epic/story link or key>`.
- File-save confirmations from that command use the `AskUserQuestion` tool with Yes/No
  options, not a plain chat question.
- Keep `.claude/commands/gherkin-scenarios.md` in sync with the Copilot prompt and mirrored
  across all 4 sibling repos, per the maintainer note in `.github/copilot-instructions.md`.
