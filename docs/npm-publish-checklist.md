# npm Publish Pre-flight Checklist

Run this checklist before publishing to npm.

## ✅ Build verification

```bash
pnpm build
```

Expected output:
- `packages/core/dist/index.js`
- `packages/core/dist/index.d.ts`
- `packages/node/dist/index.js`
- `packages/node/dist/index.d.ts`

## ✅ Test verification

```bash
pnpm check
pnpm test
```

All checks must pass.

## ✅ Package contents verification

### For @open-agent-recorder/core:

```bash
cd packages/core
npm pack --dry-run
```

Expected files in tarball:
- `dist/index.js`
- `dist/index.d.ts`
- `dist/recorder.js`
- `dist/recorder.d.ts`
- `dist/redaction.js`
- `dist/redaction.d.ts`
- `dist/types.js`
- `dist/types.d.ts`
- `README.md`
- `LICENSE`
- `package.json`

### For @open-agent-recorder/node:

```bash
cd packages/node
npm pack --dry-run
```

Expected files in tarball:
- `dist/index.js`
- `dist/index.d.ts`
- `README.md`
- `LICENSE`
- `package.json`

## ✅ Metadata verification

Check both packages have:
- ✅ `"publishConfig": { "access": "public" }`
- ✅ Valid `repository` URL
- ✅ Valid `bugs` URL
- ✅ Valid `homepage` URL
- ✅ Keywords for discoverability
- ✅ LICENSE file
- ✅ README file

## ✅ Dependency verification

### @open-agent-recorder/core
- Should have NO runtime dependencies
- Should have only devDependencies

### @open-agent-recorder/node
- Should have `"@open-agent-recorder/core": "workspace:*"` in devDependencies for local workspace development
- Should have `"@open-agent-recorder/core": "^0.1.0"` in peerDependencies for consumers
- Should NOT require a published runtime dependency entry for `core`, because the package only uses `core` types at build time

## ✅ npm login

```bash
npm whoami
```

Should return your npm username. If not:

```bash
npm login
```

## ✅ Publishing order

**IMPORTANT**: Publish in this order:

1. Publish `@open-agent-recorder/core` first
2. Wait for npm to propagate (~5 minutes)
3. Publish `@open-agent-recorder/node` second

## ✅ Post-publish verification

After publishing both packages:

```bash
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install @open-agent-recorder/core @open-agent-recorder/node
```

Create test file:

```javascript
// test.mjs
import { createRecorder } from "@open-agent-recorder/core";
import { createCollectorSink } from "@open-agent-recorder/node";

console.log("✅ Import successful!");
console.log("createRecorder:", typeof createRecorder);
console.log("createCollectorSink:", typeof createCollectorSink);
```

Run:
```bash
node test.mjs
```

Expected output:
```
✅ Import successful!
createRecorder: function
createCollectorSink: function
```

## 🚀 Ready to publish!

If all checks pass, proceed with:

```bash
cd packages/core
npm publish

# Wait 5 minutes

cd ../node
npm publish
```
