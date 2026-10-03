# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Tom's web toolbox: a Quasar 2 + Vue 3 + TypeScript SPA (aviation-flavoured tools: NOTAM mapper, fuel computer, timestamp converter, checklists). Node 24 (see `mise.toml`), npm. Apache 2.0, and every source file carries the license header (copy it from an existing file).

## Commands

- `npm ci`: install (the `postinstall` runs `quasar prepare`)
- `npm run dev` (or `quasar dev`): dev server
- `npm run lint`: ESLint on `src*`
- `npm run format`: Prettier (writes)
- `npm run test:unit:ci`: Vitest, single run (this is what CI uses; `npm test` starts watch mode)
- Single test: `npx vitest run test/vitest/__tests__/fuel.test.ts` (add `-t "name"` to filter)
- `npm run build`: production build

CI (`.github/workflows/test-pr.yml`) runs lint, unit tests and build on PRs to `main`.

## Architecture

Hexagonal layout under `src/`, with `@/` aliasing `src/`:

- `domain/`: framework-free logic (fuel, NOTAM parsing, geometry, time, AIP, checklist model and merging). Unit-tested in `test/vitest/__tests__/`. Keep it free of Vue and browser APIs.
- `domain/ports/`: interfaces the domain/use cases depend on (`ChecklistDocumentSource`, `ChecklistStateStore`, `TimezoneListStore`, `VaultKeyStore`).
- `adapters/`: implementations of ports and external libs: `data/` (bundled XML/JSON repositories), `storage/` (localStorage, IndexedDB), `crypto/` (ACD vault), `leaflet/` (map layers).
- `composables/`, `components/`, `pages/`, `layouts/`: Vue UI layer. Pages are lazy-loaded and registered in `router/routes.ts` (hash router mode, empty `publicPath`, so the build can be served from any subpath).
- `i18n/`: `en-US` and `fr-FR` messages via vue-i18n; user-facing strings must be added to both.

### Checklists (the least obvious part)

`domain/checklistResolver.ts` (`resolveChecklistForPlane`) merges up to three XML tiers (general, model, plane) for a given plane and locale, through the `ChecklistDocumentSource` port. The adapter `ChecklistXmlSource` serves the public general tier from `src/fixed-data/checklists/general/` (`import.meta.glob`) and the model and plane tiers (`model/<model>[.<locale>].xml`, `plane/<tail>[.<locale>].xml`, model names contain spaces) from the unlocked ACD vault (next section), trying the locale-specific file first, then the locale-neutral one. Checked rows and chosen branches are stored as a flat id-keyed string map via `ChecklistStateStore`; `ChecklistPage.vue` provides it to the recursive `ChecklistItemList.vue` through the injection keys in `composables/useChecklistState.ts`.

### ACD data vault (aircraft and checklists)

The club (ACD) aircraft and checklists are not public, so the repository only holds them encrypted: `src/fixed-data/acd.vault.json` (PBKDF2-SHA256 key, AES-256-GCM, gzipped JSON payload `{ planes, checklists }`, format in `domain/acdVault.ts`, crypto in `adapters/crypto/vaultCrypto.ts`). The plaintext lives in the git-ignored `private/acd/` (`planes.json`, `checklists/model/*.xml`, `checklists/plane/*.xml`). Never commit it, and never put plaintext club data back under `src/`.

- `npm run vault:encrypt` rebuilds the vault from `private/acd/`, `npm run vault:decrypt` restores `private/acd/` from the vault on a fresh clone (both ask for the passphrase, or read `ACD_VAULT_PASSPHRASE`). Encrypting with the current passphrase keeps the salt, so devices that remembered the unlock stay unlocked.
- In the app, `composables/useAcdVault.ts` holds the state (absent, restoring, locked, unlocked). "Remember on this device" stores the derived non-extractable `CryptoKey` in IndexedDB (`VaultKeyStore` port), never the passphrase. `useKnownAirplanes()` and `ChecklistXmlSource` read the unlocked payload; while locked the club aircraft are simply absent.
- Tests of the club data (`bundledChecklists.test.ts`) read `private/acd/` and are skipped when it is missing (CI).
- The vault file is public and can be attacked offline: a short passphrase only keeps out casual access (the tool warns under 12 characters but accepts it), a long one is needed for real protection. Changing the passphrase means every device unlocks again.

### Offline app (PWA)

`npm run build:pwa` builds the offline version (`dist/pwa`, Quasar PWA mode, Workbox InjectManifest). The service worker is `src-pwa/sw/custom-sw.ts`: it precaches the whole app (including the encrypted ACD vault) and caches the map tiles the user looks at (bounded to 600 tiles and 30 days, never prefetched). `src-pwa/register-sw.ts` tells the user when a new version is active, `src-pwa/manifest.json` is the manifest. `build.publicPath` is `./` (not empty: Quasar turns an empty one into `/`, which breaks subpath deployments), so the manifest, icons and service worker work from any subpath. The deploy workflow publishes `dist/pwa`, the PR workflow builds both modes. The icons in `public/icons/` are our own (generated, no Quasar logo).

### Generated data

`src/fixed-data/airfields_fr.json` is generated by `data/sia_export.py` from an SIA AIXM 4.5 export (see `data/README.md`). Regenerate it with the script rather than editing it by hand.

`src/fixed-data/borders_fr.json` (French land borders and territorial waters limit, used by the AIP parser to follow `frontière franco-...` stretches) is generated by `data/borders_export.py` from OpenStreetMap through Overpass. Same rule: regenerate, don't edit.

### Geometry parsing

NOTAM and AIP text share `domain/shapeDirectives.ts`, which finds circles ("CIRCLE RADIUS 5 NM CENTERED AT", "cercle de 5 nm de rayon centré sur") and arcs ("CLOCKWISE VIA A 30 NM ARC CENTERED AT", "arc horaire de 5 nm de rayon centré sur") and blanks them out of the text. Circles become `Circle` features; arcs are expanded into outline points (`arcPoints` in `domain/geo.ts`). `domain/borders.ts` snaps two outline points onto a border chain and returns the vertices between them.
