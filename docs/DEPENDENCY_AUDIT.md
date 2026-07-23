# Dependency Audit — RC1

**Date**: 2026-07-20

## Package layout

SparkNC has one root `package.json`; the Worker shares the root dependency tree. No nested Worker package manifest exists.

## Actions completed

- Added `@cloudflare/workers-types` for Worker typechecking.
- Added `wrangler` for local Worker development, D1 migrations, and deployment.
- Added `vitest` to make the existing Worker test configuration executable.
- Regenerated `package-lock.json` through npm installation.

## Version compatibility

- Expo remains on SDK 54 packages (`expo ~54.0.35`, `react-native 0.81.5`). This preserves the existing RC1 target rather than introducing an unsupported SDK upgrade.
- Worker tooling uses Wrangler 4 and Cloudflare Workers types 5, satisfying Wrangler's peer dependency.
- `zod` is available to Worker task and goal validators.

## Audit result

`npm audit --omit=dev --json` reports **13 moderate vulnerabilities**, no low, high, or critical findings.

The findings are transitive Expo ecosystem dependencies (`expo`, `expo-constants`, `expo-linking`, `expo-router`, `postcss`, and `uuid`). npm proposes Expo SDK 57, which is a major SDK upgrade and is **not safe for RC1** without a dedicated Expo compatibility sprint.

## Recommendation

- Do not run `npm audit fix --force` for RC1.
- Monitor Expo SDK 54 patched releases and upgrade all Expo packages together using the SDK 54 compatibility matrix.
- Re-run `npm audit --omit=dev` immediately before RC2 and production deployment.
- No unused direct dependency was removed because static import usage was not proven for all candidate packages.
