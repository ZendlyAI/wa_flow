# WA Flow agent guide


## Zendly architecture synchronization

**Policy version:** 1.0
**Architecture source:** [architecture/services/wa-flow/README.md](https://github.com/ZendlyAI/zendly-architecture/blob/main/architecture/services/wa-flow/README.md)

This repository owns **Endpoint cifrado para WhatsApp Flows.**

- When a change alters an HTTP/event/webhook/MCP contract, dependency, data ownership or schema, RLS/tenant boundary, authentication, deployment topology, or architectural decision, update the linked architecture page or link its documentation PR.
- Treat `current`, `transition`, `target`, `legacy`, and `external/verification pending` as different states. Do not describe a design or adapter as production traffic without evidence.
- Do not read, source, copy, print, or commit real `.env*`, credentials, tokens, connection strings, or sensitive payloads.

## Repository map

- **Entry points:** `src/index.ts`, `src/flows.ts` y `src/helpers/encryption.ts`
- **Architecture page:** [architecture/services/wa-flow/README.md](https://github.com/ZendlyAI/zendly-architecture/blob/main/architecture/services/wa-flow/README.md)
- **Focused validation:** `npm run build:local` sólo si las dependencias locales están disponibles; no uses claves reales ni despliegues.
- Trace the active vertical slice before editing: entry point → contract → domain/service → persistence or adapter → matching test.
