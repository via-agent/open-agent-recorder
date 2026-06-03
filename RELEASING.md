# Releasing Open Agent Recorder

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and package publishing.

## How it works

1. **Commit Convention**: Use [Conventional Commits](https://www.conventionalcommits.org/) format
2. **Automated Analysis**: semantic-release analyzes commits on every push to `main`
3. **Version Bump**: Based on commit types, determines the next version
4. **Changelog**: Automatically generates CHANGELOG.md
5. **GitHub Release**: Creates a release with release notes
6. **npm Publish**: Publishes packages to npm registry

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | Minor (0.1.0 → 0.2.0) |
| `fix` | Bug fix | Patch (0.1.0 → 0.1.1) |
| `docs` | Documentation only | Patch |
| `refactor` | Code refactoring | Patch |
| `perf` | Performance improvement | Patch |
| `test` | Adding/updating tests | Patch |
| `chore` | Build/tooling changes | Patch |
| `ci` | CI configuration | Patch |
| `style` | Code style changes | Patch |

### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the footer:

```
feat(api): redesign event schema

BREAKING CHANGE: The `AgentEvent` interface has changed.
Users must update their code to use the new schema.
```

This triggers a **major version bump** (0.1.0 → 1.0.0).

## Examples

```bash
# Patch release (0.1.0 → 0.1.1)
git commit -m "fix: correct redaction of bearer tokens"

# Minor release (0.1.0 → 0.2.0)
git commit -m "feat: add trace query API"

# Major release (0.1.0 → 1.0.0)
git commit -m "feat!: redesign event schema\n\nBREAKING CHANGE: event schema has changed"
```

## Setup Requirements

### GitHub Repository

1. Go to Settings → Actions → General
2. Enable "Read and write permissions" for GITHUB_TOKEN
3. Enable "Allow GitHub Actions to create and approve pull requests"

### npm Account

1. Create an npm account if you don't have one
2. Generate an automation token: `npm token create --type=granular`
3. Add the token as a repository secret:
   - Go to Settings → Secrets and variables → Actions
   - Add `NPM_TOKEN` with your npm token value

### Initial Setup

After setting up secrets, merge a commit to `main` with `feat:` or `fix:` prefix to trigger the first release.

## Manual Release

If you need to trigger a release manually:

```bash
# Install semantic-release
pnpm add -D semantic-release @semantic-release/changelog @semantic-release/git

# Run release
npx semantic-release
```

## Package Structure

This monorepo has two publishable packages:

- `packages/core/` - `@open-agent-recorder/core`
- `packages/node/` - `@open-agent-recorder/node`

Each has its own `.releaserc.json` configuration.

## Troubleshooting

### Release not triggered

- Ensure commit message follows Conventional Commits format
- Check that `NPM_TOKEN` secret is set correctly
- Verify GitHub Actions has write permissions

### npm publish fails

- Check `NPM_TOKEN` has publish permissions for `@open-agent-recorder` scope
- Verify package name is not already taken on npm

### Duplicate releases

- Make sure commits don't have `[skip ci]` in the message
- Check that only one workflow is running at a time

## Resources

- [semantic-release documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
