# Cloud Agent Notes — wa-flow

## Runtime and commands

- Runtime: Node.js 20 (Google Functions deployment scripts) with npm and the committed `package-lock.json`.
- Install: `npm ci`
- Build: `npm run build:local`.
- Test: `npm test` is intentionally failing (`Error: no test specified` and exit 1); do not run or report it as a passing test.
- Direct runtime dependencies: Google Functions Framework, Axios, `fluent-ffmpeg`, `fs`, `install`, `node-fetch`, `npm`, OpenAI, and UUID.

## Cloud Agent safety

- Never read, source, copy, print, or commit real `.env*` or `.env.yaml` files.
- Do not start a function or call Botpress, OAuth, OpenAI, or Google Cloud. Keep `CLIENT_SECRET` and all live URLs as placeholders only.
- Do not run deployment scripts or alter Cloud Functions configuration.

## Change scope

Follow a vertical slice: Cloud Function entrypoint → auth/media/Botpress helper → focused test when one is added. Preserve inbound/outbound function boundaries and keep external calls behind existing helpers.

## PR evidence

Report `npm run build:local`, `git diff --check`, and skipped tests. Explicitly note that the declared `npm test` command is intentionally failing and no live integration was invoked.
