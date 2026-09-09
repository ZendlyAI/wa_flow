---
name: wa-flow-cloud-validation
description: Produces focused, offline build evidence for wa-flow changes. Use when validating its Cloud Functions TypeScript build and documenting its intentionally failing test script.
disable-model-invocation: true
---

# WA Flow Cloud Validation

1. Never source `.env.yaml`, start a function, or call Botpress, OAuth, OpenAI, or Google Cloud.
2. With dependencies available, run `npm run build:local`. Do not present `npm test` as usable: its declared script intentionally exits 1 with “no test specified.”
3. Run `git diff --check` and report commands, outcomes, and skipped tests. State that no side-effecting integration path was invoked.
