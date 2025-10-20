# Copilot / AI agent instructions for Lumina-dikey

Keep guidance short and concrete. When making edits, link to the exact files below.

Top-level summary
- This is a React + TypeScript single-page game built with Vite. UI is assembled from `components/` and `pages/`.
- Core runtime is client-side; key helper code lives in `services/`. Some functions (image generation) require server-side API keys.

Key files and why they matter
- `App.tsx` — central game loop, state management and game modes. Read this to understand game state transitions (map → loading → playing → end screens).
- `components/LanguageContext.tsx` — global translations, volume and device detection. Use `useLanguage()` for `t(key, vars)` and volume values.
- `services/geminiService.ts` — word and image generation helpers. Note: `fetchWordChallenge` uses local `services/wordList.ts` now. Image/prompt functions call `@google/genai` and need a server-side API key.
- `services/wordList.ts` — static word pools; primary source for play challenges.
- `services/progressService.ts` — persistent helpers (save/load profile, inventory, custom images, themes). LocalStorage keys are prefixed with `lumina-`.
- `config.ts`, `themes.ts`, `translations.ts`, `types.ts` — central configuration, theme tokens, translation strings, and shared TypeScript types. Modify these to change gameplay constants or UI text shapes.

-- Quick examples
- Fetch a play question:
  - import { fetchWordChallenge } from './services/geminiService';
  - fetchWordChallenge(wordLength, language, usedWordsSet) — returns local-list challenge and expects a Set<string> of used uppercase words.
- Translation usage:
  - const { t } = useLanguage();
  - t('someKey', {count: 3}) — translations use `{var}` placeholders.
- Theme mutation:
  - Use `document.documentElement.style.setProperty` to update `--cube-face-bg`; themes are applied as CSS variables at runtime (see `App.tsx`).

Environment & run notes
- Dev: `npm install` then `npm run dev` (Vite). Scripts are in `package.json`.
- Build: `npm run build`; Preview: `npm run preview`.
- Typecheck: run `npx tsc --noEmit`.
- Gemini/GenAI: image/prompt helpers in `services/geminiService.ts` prefer `GEMINI_API_KEY` (the code falls back to `API_KEY` for compatibility). Confirm and set `GEMINI_API_KEY` in server-side env files. Do not expose keys in client bundles; run those functions server-side or behind an endpoint.

Project-specific conventions & patterns
- LocalStorage keys: prefixed with `lumina-`. Reuse this prefix when adding persisted keys.
- Word data: normalized to UPPERCASE for gameplay (see `geminiService.ts` and `wordList.ts`). Keep new entries uppercase or normalize on read.
- Game modes: `App.tsx` uses `gameMode` values 'practice' | 'progressive' | 'endless' | 'duel'. Preserve these strings when changing game logic.
- UI theming: themes are maps of CSS custom properties. To add a theme, export a token map in `themes.ts` and ensure components read the same `--cube-face-*` properties.
- Audio: `soundService` is a singleton; call `soundService.play('correct')` etc. Use existing sound keys.

Integration & cross-component notes
- All persistence flows through `services/progressService.ts`. Prefer its helpers over direct localStorage access.
- `useLanguage()` provides translations, volumes, and device detection. Ensure `LanguageProvider` wraps the app (checked in `index.tsx`).
- Word reuse avoidance: components pass a `Set<string>` (usedWords) to `fetchWordChallenge` to prevent repeats. Keep that contract.

When editing: quick checklist
1. After changing runtime code, run `npm run dev` and verify flows in the browser.
2. If you touch AI/image functions, check whether they are invoked client-side; if so, move them server-side or guard usage.
3. Update `types.ts` for shared shape changes, then run `npx tsc --noEmit`.
4. When adding persisted keys, use `lumina-` prefix and document them in `progressService.ts`.

If something here is unclear or you want more examples (component-level or tests), tell me which file or feature and I will expand this file with specific code pointers or sample edits.
