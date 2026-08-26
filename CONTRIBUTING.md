# Contributing Guide

## Commit Message Format

All commits must follow the **Conventional Commits** specification:

```
<type>(optional scope): <description>
```

### Types

| Type       | Description                                      | SemVer impact |
|------------|--------------------------------------------------|---------------|
| `feat`     | New feature or capability                        | `minor`       |
| `fix`      | Bug fix                                          | `patch`       |
| `docs`     | Documentation only changes                       | `patch`       |
| `test`     | Adding or correcting tests                       | `patch`       |
| `chore`    | Build, tooling, CI, or maintenance tasks         | `patch`       |
| `refactor` | Code change that neither fixes a bug nor adds a feature | `patch` |

A `!` after the type or a `BREAKING CHANGE` footer in the body bumps the **major** version.

### Examples

```
feat(booking): add booking confirmation flow
fix(slots): prevent duplicate slot booking
test(e2e): cover successful booking scenario
chore(ci): add Playwright workflow
```

### Rules

- Keep the description concise and in the imperative mood.
- Scope is optional but recommended for clarity.
- All future commits, including those suggested by agents, must conform to this format.
