# npm Publishing Guide

This guide explains how to publish Open Agent Recorder packages to npm.

## Packages

| Package | Type | Publish Required |
|---------|------|-----------------|
| `@open-agent-recorder/core` | Library | Yes |
| `@open-agent-recorder/node` | Library | Yes |
| `@open-agent-recorder/collector` | CLI App | Yes |

## Pre-publish checklist

Before publishing, ensure:

1. All tests pass:
   ```bash
   pnpm check
   pnpm test
   pnpm build
   ```

2. Packages are built:
   ```bash
   pnpm -r build
   ```

3. Package metadata is correct:
   - Version numbers in `package.json`
   - README files are up to date
   - LICENSE files exist in each package
   - Repository URLs point to correct GitHub repo

4. You are logged into npm:
   ```bash
   npm login
   ```

## Publishing packages

### Option 1: Publish manually (recommended for first release)

Publish in this order (core first, then node and collector):

```bash
cd packages/core
npm publish
```

```bash
cd ../node
npm publish
```

```bash
cd ../collector
npm publish
```

### Option 2: Use pnpm workspace publish

From the repository root:

```bash
pnpm -r publish --access public
```

This publishes all non-private packages in the workspace.

## Version management

Before publishing a new version:

1. Update version numbers in affected `package.json` files:
   ```bash
   cd packages/core
   npm version patch  # or minor, or major
   
   cd ../node
   npm version patch
   ```

2. Commit version changes:
   ```bash
   git add packages/*/package.json
   git commit -m "Bump version to 0.1.1"
   git tag v0.1.1
   git push origin main --tags
   ```

3. Publish updated packages (see above).

## Troubleshooting

### "workspace:*" dependency error

For this repository, `workspace:*` should only be used in `devDependencies` for local monorepo development.

Public packages should expose real consumer constraints via `peerDependencies`, not publish `workspace:*` as a runtime dependency.

If you see errors about `workspace:*`, ensure:
- `@open-agent-recorder/core` is published first
- Version in `peerDependencies` matches the published version
- no `workspace:*` entries remain in publishable runtime `dependencies`

### Access denied

Ensure you have publish rights to the `@open-agent-recorder` scope:

```bash
npm owner add <username> @open-agent-recorder/core
npm owner add <username> @open-agent-recorder/node
```

### Package not found after publish

Wait 5-10 minutes for npm CDN propagation, then verify:

```bash
npm view @open-agent-recorder/core
npm view @open-agent-recorder/node
```

## Post-publish verification

After publishing, test installation in a fresh directory. Test all three packages:

```bash
mkdir test-install
cd test-install
npm init -y
npm install @open-agent-recorder/core @open-agent-recorder/node
```

Verify the packages work:

```javascript
// test.mjs
import { createRecorder } from "@open-agent-recorder/core";
import { createCollectorSink } from "@open-agent-recorder/node";

console.log("Core and Node packages installed successfully!");
```

Also test that `npx` works:

```bash
npx @open-agent-recorder/collector &
sleep 2
curl -s http://localhost:4319/health | jq .
kill %1
```

Run:
```bash
node test.mjs
```

## Publishing from CI (future)

For automated releases via GitHub Actions, add npm token as a secret and use a workflow like:

```yaml
- name: Publish to npm
  run: pnpm -r publish --access public --no-git-checks
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```
