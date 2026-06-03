# 🚀 FINAL PUBLISH CHECKLIST

Jalanin checklist ini **SEBELUM publish ke npm**. Semua harus ✅ PASS.

---

## PRE-PUBLISH SETUP (Local)

### 1. Build & Test

```bash
cd ~/path/to/open-agent-recorder

# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verify everything builds
pnpm build
pnpm check
pnpm test
```

Expected: ✅ All pass

### 2. Verify Package Contents

Untuk setiap package, check apa yang bakal dipublish:

```bash
# Core
cd packages/core
npm pack --dry-run

# Node
cd ../node
npm pack --dry-run

# Collector
cd ../../apps/collector
npm pack --dry-run
```

Expected:
- ✅ Files listed: `dist/`, `README.md`, `LICENSE`, `package.json`
- ✅ NO `src/`, NO `*.test.js`, NO `tsconfig.tsbuildinfo`
- ✅ Collector has `dist/server.js` dengan shebang `#!/usr/bin/env node`

### 3. Verify Dependency Resolution

```bash
cd packages/core
npm ls  # Should show NO dependencies

cd ../node
npm ls  # Should show peerDependencies only

cd ../../apps/collector
npm ls  # Should show @open-agent-recorder/core
```

---

## PUBLISH SETUP (GitHub + npm)

### 4. Setup npm Token

```bash
npm login
npm token create --type=granular
```

Expected: ✅ Token created

### 5. Add NPM_TOKEN to GitHub Secrets

1. Go to repo Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: paste token dari langkah 4
5. Click "Add secret"

Expected: ✅ Secret added

### 6. Verify GitHub Actions Permissions

1. Go to repo Settings → Actions → General
2. ✅ "Read and write permissions" enabled
3. ✅ "Allow GitHub Actions to create and approve pull requests" enabled

---

## MANUAL FIRST PUBLISH (Recommended)

### 7. Publish Core Package

```bash
cd packages/core
npm publish
```

Expected:
```
npm notice 📦  @open-agent-recorder/core@0.1.0
npm notice === Tarball Contents ===
npm notice 156B  package.json
npm notice ...
npm notice === Dist Files ===
npm notice 2.1kB  dist/index.js
npm notice ...
```

Wait 2-3 minutes for npm CDN propagation.

Verify:
```bash
npm view @open-agent-recorder/core
npm view @open-agent-recorder/core versions
```

Expected: ✅ Version 0.1.0 visible

### 8. Publish Node Package

```bash
cd ../node
npm publish
```

Expected: Same as above

Wait 2-3 minutes.

Verify:
```bash
npm view @open-agent-recorder/node
```

### 9. Publish Collector Package

```bash
cd ../../apps/collector
npm publish
```

Expected: Same as above

Verify:
```bash
npm view @open-agent-recorder/collector
```

---

## POST-PUBLISH VERIFICATION

### 10. Test Installation (Fresh Directory)

```bash
mkdir ~/test-open-agent
cd ~/test-open-agent
npm init -y
npm install @open-agent-recorder/core @open-agent-recorder/node @open-agent-recorder/collector
```

Expected:
```
added 3 packages, and audited 3 packages in 2s
```

### 11. Test Core + Node Import

Create `test.mjs`:
```javascript
import { createRecorder } from "@open-agent-recorder/core";
import { createCollectorSink } from "@open-agent-recorder/node";

console.log("✅ Imports work!");
console.log("createRecorder:", typeof createRecorder);
console.log("createCollectorSink:", typeof createCollectorSink);
```

Run:
```bash
node test.mjs
```

Expected:
```
✅ Imports work!
createRecorder: function
createCollectorSink: function
```

### 12. Test Collector CLI

```bash
npx @open-agent-recorder/collector &
COLLECTOR_PID=$!
sleep 2

# Health check
curl -s http://localhost:4319/health | jq .

# Cleanup
kill $COLLECTOR_PID
```

Expected:
```json
{
  "ok": true
}
```

### 13. Verify npm Package Pages

Visit:
- `https://www.npmjs.com/package/@open-agent-recorder/core`
- `https://www.npmjs.com/package/@open-agent-recorder/node`
- `https://www.npmjs.com/package/@open-agent-recorder/collector`

Expected:
- ✅ README visible
- ✅ Version 0.1.0 listed
- ✅ GitHub repo linked
- ✅ Keywords visible
- ✅ License displayed

---

## FUTURE RELEASES (Semantic Release)

### 14. Setup for Automated Releases

After first manual publish, future releases are automated:

1. Make changes on a feature branch
2. Create a PR with **Conventional Commits**:
   - `feat:` for new features (minor bump)
   - `fix:` for bug fixes (patch bump)
   - `BREAKING CHANGE:` footer for major bump
3. Merge PR to `main`
4. GitHub Actions automatically:
   - Runs tests
   - Determines next version
   - Publishes to npm
   - Creates GitHub Release
   - Updates CHANGELOG

---

## TROUBLESHOOTING

### Error: "npm ERR! 403 Forbidden"

**Cause**: No publish permission for `@open-agent-recorder` scope

**Fix**:
```bash
npm owner add YOUR_USERNAME @open-agent-recorder/core
npm owner add YOUR_USERNAME @open-agent-recorder/node
npm owner add YOUR_USERNAME @open-agent-recorder/collector
```

### Error: "Cannot find module '@open-agent-recorder/core'"

**Cause**: Published with `workspace:*` still in package.json

**Fix**: Rebuild with `pnpm install` and `pnpm build` before publish

### Error: "ERR! 404 Not Found - Package not found"

**Cause**: npm hasn't propagated yet

**Fix**: Wait 5-10 minutes, then try again

### Collector CLI doesn't work via `npx`

**Cause**: Missing shebang in dist/server.js

**Fix**: Check source has `#!/usr/bin/env node` at top, rebuild

---

## ✅ ALL CHECKS PASSED?

If all 13 steps passed:

```bash
git log --oneline | head -1  # Note the commit hash

echo "🎉 Ready to announce!"
echo "GitHub: https://github.com/safriyandi/open-agent-recorder"
echo "npm: https://www.npmjs.com/search?q=open-agent-recorder"
```

---

**Jika ada yang gagal, hubungi support SEBELUM publish ke publik.**
