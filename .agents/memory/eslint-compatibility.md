---
name: ESLint compatibility
description: The repository uses legacy eslintrc configuration while installed ESLint resolves to v9.
---

The repository's existing lint configuration is legacy `.eslintrc.cjs`, while the dependency range can resolve ESLint 9, whose default flat-config mode rejects that file.

**Why:** A clean dependency install exposed the mismatch even though the source lint rules remain valid.

**How to apply:** Run the existing lint scripts with `ESLINT_USE_FLAT_CONFIG=false` unless the project intentionally migrates to flat config.