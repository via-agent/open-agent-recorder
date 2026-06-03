# Release workflow

This workflow handles automated releases to npm and GitHub.

## How it works

1. When a PR is merged to `main` with a commit message following [Conventional Commits](https://www.conventionalcommits.org/), this workflow triggers.
2. Semantic Release analyzes the commits and determines the next version.
3. A GitHub Release is created with the changelog.
4. The package is published to npm.

## Commit message format

Use one of these prefixes:

- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `docs:` - Documentation changes (patch version bump)
- `refactor:` - Code refactoring (patch version bump)
- `perf:` - Performance improvement (patch version bump)
- `test:` - Test additions/changes (patch version bump)
- `chore:` - Build process or tooling changes (patch version bump)

### Examples

```
feat: add trace query API
fix: correct redaction of bearer tokens
docs: add contribution guide
refactor: extract storage module
```

## Manual release

If you need to trigger a release manually:

```bash
git checkout main
git pull origin main
npx semantic-release
```
