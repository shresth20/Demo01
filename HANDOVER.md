# BODMAS Game - Developer Handover

This handover explains the current project state for the next developer. It is based on the files in this repository, not on the older template assumptions that were present in previous documentation.

---

## Project Overview

This project is a static BODMAS math learning game. It teaches order of operations with a short Explore walkthrough, then asks six multiple-choice practice questions. The app is written in plain HTML, CSS, and JavaScript, with Anime.js vendored locally for animation support.

The project is designed to run without a build system and without external network dependencies. It can be opened directly in a browser or served from any static web server.

---

## HTML Layer System

`index.html` is organized as a visual layer stack. The layer numbers are documented in the HTML comments and are controlled mostly by z-index tokens in `css/style.css`. The DOM order is useful for readability, but the actual visual priority comes from the CSS variables under `:root`.

| Layer | Main HTML | Main CSS | Purpose |
| --- | --- | --- | --- |
| Page base | `<body>` | `--color-bg`, `--z-bg` | The fixed game canvas background. Nothing interactive should be placed directly here unless it belongs to the full page shell. |
| Layer 2: Board carrier | `#board-container`, `#board`, `#board-secondary` | `.board-container`, `.board`, `--z-board` | The main play area between the header and footer. It uses `top: var(--header-h)` and `bottom: var(--footer-h)` so chrome height changes do not cover content. |
| Layer 3: Decorative assets | `#deco-layer`, `.deco` elements | `.layer-deco`, `.deco-*`, `--z-deco` | Fixed, non-interactive math artwork around the board. This layer uses `pointer-events: none` so it never blocks game clicks. |
| Layer 4: Active content | `#content-area` | `#content-area`, `--z-content` | The only area that `app.js` replaces per screen. Loading, Explore, and Practice screen markup is injected here by `renderScreen()`. |
| Layer 5: Persistent chrome | `#header`, `#footer` | `.header`, `.footer`, `--z-chrome` | Always-visible navigation and action controls. Header owns progress, reset, info, language, and fullscreen. Footer owns Submit. |
| Layer 6: Feedback | `#feedback-overlay` | `.feedback-overlay`, `--z-feedback` | Correct/wrong feedback toast and character GIF. It sits above board/decor/chrome content but below modal and loader overlays. |
| Celebration overlay | generated `.celebration` | `.celebration`, `--z-confetti` | Temporary confetti layer created from JavaScript on the final correct answer. |
| Modal overlays | `#htp-modal`, `#lang-modal`, `#summary-modal` | `.modal-overlay`, `--z-popups` | Dialog layer for How to Play, language selection, and summary. These overlays cover the board and chrome. |
| Loader overlay | `#loader-overlay` | `.loader-overlay`, `--z-overlay` | Highest-priority startup overlay. It blocks interaction until `loader--hidden` is applied. |

Important layer behavior:

- `#content-area` is the safe target for dynamic game screens. Avoid injecting screen content into the header, footer, modal layer, or decorative layer.
- `#board-secondary` is a placeholder for dual-board frame layouts. It is hidden by default and becomes visible through `body.frame--3` or `body.frame--4` rules in `css/frames.css`.
- The frame switcher is temporary developer UI. It is fixed near the lower-right corner at z-index `98`, just below the header/footer chrome at `99`.
- Header and footer heights are CSS variables. Responsive overrides change `--header-h` and `--footer-h`, and the board automatically repositions around them.
- Decorative assets are intentionally separate from game content. Responsive rules can hide or resize them without touching gameplay markup.
- New overlays should be assigned deliberately in the z-index stack. Use the existing variables where possible instead of hard-coded values.

---

## Current Status

- Main entry point: `index.html`
- Current topic: BODMAS order of operations
- Current flow: Loading -> Explore -> Practice -> Summary
- Practice length: 6 questions
- Supported language codes: `en`, `hi`, `mr`, `te`, `gu`, `od`
- Default language: `en`
- Environment variables: none
- Build system: none
- Runtime dependencies: local browser files only
- Automated tests: none
- Completion integration: `window.parent.postMessage()` with `GAME_COMPLETE`
- Temporary developer UI: visible frame switcher in the lower-right corner

Recent git history indicates work around frame layouts, tablet responsiveness, phone view fixes, language dropdown/storage fixes, and postMessage completion support.

---

## Game/UI Flow

1. `DOMContentLoaded` runs in `app.js`.
2. `I18n.load()` loads `locales.json`, merges `BODMAS_LOCALES`, resolves language, and calls back.
3. Static translations are applied.
4. Progress dots and persistent listeners are attached.
5. The app transitions to `loading`.
6. The loader overlay remains for about 2.2 seconds.
7. The app transitions to `explore`.
8. The How to Play modal opens once after the first loading sequence.
9. Explore mode plays six walkthrough steps.
10. `Start Practice` appears after Explore completes.
11. Practice renders one question at a time.
12. The user selects an option, then clicks Submit.
13. Correct answers advance after feedback; wrong answers retry after feedback.
14. After the final correct answer, the Summary modal opens.
15. The Summary modal sends `GAME_COMPLETE` to `window.parent`.
16. `Play Again` resets `GameState` and returns to loading.

---

## Code Base Structure Explanation

The project is intentionally small and flat. There is no package manager, bundler, module loader, or transpiler. Browser files load directly from `index.html`, so file names and relative paths matter.

```text
.
|-- index.html                 Main HTML shell and layer stack
|-- HANDOVER.md                Developer handover notes
|-- README.md                  Project readme
|-- locales.json               Locale metadata and shared translations
|-- test-postmessage.html      Parent iframe harness for completion testing
|-- css/
|   |-- style.css              Base tokens, layout, screens, modals, feedback
|   |-- responsive.css         Viewport and orientation overrides
|   |-- animations.css         Keyframes and reduced-motion fallbacks
|   `-- frames.css             Temporary frame layout variants
|-- js/
|   |-- vendor/anime.min.js    Local Anime.js dependency
|   |-- utils.js               Small DOM and timing helpers
|   |-- state.js               Shared GameState object
|   |-- activities.js          Explore steps and practice question data
|   |-- animations.js          Animation helpers around Anime.js/CSS fallbacks
|   |-- audio.js               Sound preload and playback helpers
|   |-- bodmas-locales.js      Active BODMAS translation strings
|   |-- i18n.js                Locale loading, merging, storage, and lookup
|   |-- frames.js              Developer frame switcher and body classes
|   `-- app.js                 Main controller and event wiring
|-- assets/
|   |-- fonts/                 Local Lilita One and Nunito font files
|   |-- GIFs/                  Loader, correct, and incorrect feedback GIFs
|   |-- icons/                 Header icons, stars, and decorative math SVGs
|   |-- images/                Logo, calculator, and character artwork
|   `-- sounds/                Button, correct, and wrong-answer audio
|-- .claude/                   Local assistant/developer notes
|-- .vscode/                   Editor settings
`-- .gitignore
```

How the pieces fit together:

- `index.html` owns the stable shell: header, footer, board containers, modals, overlays, decorative layer, and script tags.
- `css/style.css` is the base visual system. It defines tokens, z-index layers, fixed chrome, board layout, modal styling, feedback styling, and core screen styles.
- `css/responsive.css` overrides the base layout for tablets, laptops, compact landscape phones, portrait orientation, foldables, and short-height screens.
- `css/frames.css` is isolated from the main layout because the frame switcher is temporary and experimental.
- `js/app.js` is the coordinator. It waits for localization, renders the current screen into `#content-area`, attaches events, handles answers, updates progress, opens modals, and sends completion messages.
- `js/activities.js`, `js/bodmas-locales.js`, and `locales.json` are the main content files for changing the lesson topic, questions, or language text.
- `assets/` is part of runtime behavior, not just decoration. The app expects local fonts, sounds, GIFs, icons, and images to be present at the current paths.

The app uses plain global scripts. Load order is important because later files read globals from earlier files.

Current script order in `index.html`:

```text
1. js/vendor/anime.min.js
2. js/utils.js
3. js/state.js
4. js/activities.js
5. js/animations.js
6. js/audio.js
7. js/bodmas-locales.js
8. js/i18n.js
9. js/frames.js
10. js/app.js
```

Do not reorder these scripts unless you also refactor the dependencies.

---

## Important Files and Their Purpose

| File | Purpose |
| --- | --- |
| `index.html` | Main shell for header, board containers, footer, modals, loader, feedback overlay, decorative layer, frame switcher, and script tags. |
| `test-postmessage.html` | Parent-page harness that iframes `index.html` and logs `GAME_COMPLETE`. |
| `locales.json` | Locale configuration, supported language names, shared labels, and legacy place-value content. |
| `js/app.js` | Primary controller for rendering screens, attaching events, handling answers, feedback, modals, progress, summary, fullscreen, and postMessage. |
| `js/state.js` | `GameState` singleton with current screen, question index, score, wrong count, selected answer, submit state, and animation guard. |
| `js/activities.js` | BODMAS walkthrough data and six practice questions. |
| `js/bodmas-locales.js` | Active BODMAS strings in all six language codes. |
| `js/i18n.js` | Loads locale JSON, merges BODMAS strings, resolves and stores language, returns translations. |
| `js/animations.js` | Anime.js wrappers plus fallbacks for screen transitions, explore highlight/resolve, and answer card animations. |
| `js/audio.js` | Preloads click/correct/wrong sounds and creates completion tones through Web Audio. |
| `js/frames.js` | Builds the temporary frame switcher and applies `body.frame--N` classes. |
| `js/utils.js` | Small helpers: `qs`, `qsa`, `setClass`, and `wait`. |
| `css/style.css` | Main design tokens, global layout, header/footer, board, screens, feedback, modals, summary, and asset sizing. |
| `css/responsive.css` | Responsive overrides for tablets, laptops, phone landscape, portrait, foldables, and compact heights. |
| `css/animations.css` | CSS keyframes and reduced-motion fallback rules. |
| `css/frames.css` | Frame-specific board layout rules and frame switcher styling. |

---

## Core Logic Explanation

`GameState` tracks:

- `currentScreen`: `loading`, `explore`, `practice`, or `complete`
- `currentQuestion`: zero-based question index
- `score`: number of correct submissions
- `wrongCount`: number of wrong submissions
- `selectedAnswer`: selected option index or `null`
- `isSubmitted`: blocks repeated submits for the same attempt
- `isAnimating`: blocks overlapping screen transitions

Answer handling:

- `handleOptionSelect(index)` stores the selected option and enables Submit.
- `handleSubmit()` checks the selected option against `correctIndex`, records the attempt, disables option cards, and shows feedback.
- `GameState.recordAnswer()` increments `score` or `wrongCount`.
- Correct feedback waits about 2.5 seconds, then advances.
- Wrong feedback waits about 2 seconds, then rerenders the same question.
- `GameState.advance()` moves to the next question or sets the screen to `complete`.

Scoring:

- Summary accuracy uses attempts, not only question count.
- Formula: `score / (score + wrongCount)`.
- A learner can answer all six questions correctly eventually but still lose accuracy if they had wrong attempts first.

Important implementation detail:

- Practice question IDs such as `q1` must match localization keys such as `bodmasRule_q1` and `bodmasHint_q1`.
- Because `I18n.t()` returns the key when missing, missing rule/hint keys can display literal key names.

---

## Responsive Design Implementation

The responsive system is CSS-driven.

- `:root` in `style.css` defines colors, fonts, spacing, touch sizes, header/footer heights, z-index values, and timing.
- The board container is fixed between the header and footer using `top: var(--header-h)` and `bottom: var(--footer-h)`.
- `responsive.css` adjusts:
  - `min-width: 768px`
  - `min-width: 1024px`
  - `min-width: 1280px`
  - `min-width: 1440px`
  - `max-aspect-ratio: 4/3`
  - `min-aspect-ratio: 16/10`
  - compact tablet target around `1024px x 600px`
  - landscape screens under `520px` tall
  - portrait orientation
  - narrow landscape under `480px`
  - phones in landscape under `900px`
  - compact phones under `812px` wide and `375px` tall
  - foldables between `800px` and `1023px`
- Portrait currently adapts content and hides large decorations; it does not block the UI.
- `animations.css` contains a `prefers-reduced-motion` rule for the wrong-card shake fallback.

---

## Popup/Modal Behavior

How to Play modal:

- Opens automatically once after the first loading sequence.
- Opens from the Info header button.
- Closes with the close button, Escape key, or backdrop click.
- Focus returns to the Info button after closing.

Language modal:

- Opens from the language header button.
- Shows a dropdown populated from `I18n.getSupportedLanguages()`.
- Apply is disabled until the selected language changes.
- On Apply, `I18n.setLang()` writes the language to the URL, document language, and `localStorage`.
- A confirmation view shows for about 1.8 seconds.
- The modal closes, static text is reapplied, and the current screen rerenders.
- If the current screen is Explore, the Explore sequence restarts.

Summary modal:

- Opens when the game completes.
- Displays localized title, three star icons, accuracy, and Play Again.
- Sends `GAME_COMPLETE` to `window.parent`.
- Does not currently close from Escape or backdrop click; Play Again is the normal exit path.

Loader overlay:

- Visible during initial loading.
- Hidden by adding `loader--hidden` after the loading delay.

Feedback overlay:

- Uses `#feedback-overlay`, `#feedback-toast`, and `#feedback-char-gif`.
- Appears above the board and footer area.
- Correct feedback uses `assets/GIFs/correct.gif`.
- Wrong feedback uses `assets/GIFs/incorrect.gif`.

---

## Header/Footer Behavior

Header:

- Fixed at the top.
- Contains progress dots on the left.
- Contains reset, info, language, and fullscreen buttons on the right.
- Fullscreen button swaps between fullscreen and exit-fullscreen icons.

Footer:

- Fixed at the bottom.
- Contains the Submit button.
- Submit is disabled until an answer is selected and the app is not already submitted/animating.
- Submit remains visible outside practice, but disabled.

Reset behavior:

- `handleReset()` currently returns unless `GameState.currentScreen === 'practice'`.
- During practice, it clears selection and rerenders the current question.
- If reset is clicked while feedback is active, it rolls back the most recent correct/wrong count before rerendering.

---

## Assets and Design Elements

Assets are all local.

Fonts:

- `assets/fonts/lilita_one/lilitaone-regular.ttf`
- `assets/fonts/nunito/nunito-variablefont_wght.ttf`
- `assets/fonts/nunito/nunito-italic-variablefont_wght.ttf`

GIFs:

- `assets/GIFs/loader.gif`
- `assets/GIFs/correct.gif`
- `assets/GIFs/incorrect.gif`

Images:

- `assets/images/logo.png`
- `assets/images/Calculator.png`
- `assets/images/Swiftee-left.png`
- `assets/images/Swiftee-right.png`
- `assets/images/Swiftee01.png` through `Swiftee06.png`

Icons:

- Header/action icons for reset, info, language, fullscreen, exit fullscreen, close, and stars.
- Decorative math/operator SVGs and topic artwork in `assets/icons/`.

Sounds:

- Used by current code: `button-click.wav`, `correct-answer.mp3`, `incorrect-answer.mp3`
- Present but not currently used by `audio.js`: `jump.mp3`, `sound_trash.mp3`

---

## Language/Localization Handling

`js/i18n.js` controls language behavior.

Load process:

1. XHR loads `locales.json`.
2. `BODMAS_LOCALES` from `js/bodmas-locales.js` is merged into the loaded data.
3. The initial language is resolved from `?lang=`, then `localStorage.game_lang`, then `defaultLanguage`.
4. The URL is updated with the resolved language.
5. Static translations and screen content render.

Current language codes:

- `en` - English
- `hi` - Hindi
- `mr` - Marathi
- `te` - Telugu
- `gu` - Gujarati
- `od` - Odia

Notes:

- `locales.json` contains a large set of legacy place-value strings that are not used by the current BODMAS screens.
- `languageLabels` exists in `locales.json`, but the current dropdown uses `supportedLanguages` directly.
- `bodmasRotateMsg` is translated but not currently rendered by the app.
- Add new BODMAS languages by updating `supportedLanguages` and adding a matching complete object in `BODMAS_LOCALES`.

---

## Completion postMessage

When the Summary modal opens, `app.js` sends:

```javascript
window.parent.postMessage({
  type: 'GAME_COMPLETE',
  score: score,
  total: practiceQuestions.length,
  correct: score,
  wrong: GameState.wrongCount,
  accuracy: pct,
  stars: earned
}, '*');
```

Use `test-postmessage.html` to verify this behavior. It loads `index.html` in an iframe and logs the completion payload.

---

## Known Issues

- No automated tests are included.
- No package manifest or build tooling is included.
- The frame switcher is temporary but currently visible.
- `locales.json` contains unused legacy content from a place-value activity.
- `bodmasRotateMsg` exists, but no rotate overlay is present in `index.html`.
- The reset button only affects the practice screen.
- `jump.mp3` and `sound_trash.mp3` are present but unused.
- Missing BODMAS localization keys can display literal key strings.
- Direct file opening depends on browser behavior for local XHR; use a static server if `locales.json` fails to load.

---

## Pending Work

- Decide whether to keep, hide, or remove the temporary frame switcher.
- Decide whether the dual-board placeholder should become real functionality or remain a layout test.
- Add a rotate overlay if landscape-only behavior is still required.
- Add smoke tests for loading, Explore, practice, summary, localization, and postMessage.
- Review and clean legacy locale strings after confirming they are not needed elsewhere.
- Consider adding a small developer-only flag for frame/layout testing.
- Document the final deployment target once known.

---

## Things to Avoid Breaking

- Do not change script order in `index.html` without refactoring dependencies.
- Do not rename `assets/GIFs/`; the app references that exact casing.
- Do not remove `locales.json`; `i18n.js` loads it before merging BODMAS strings.
- Do not remove `js/bodmas-locales.js`; it contains the active BODMAS UI text.
- Keep question IDs aligned with `bodmasRule_*` and `bodmasHint_*` keys.
- Keep `correctIndex` zero-based and valid for the `options` array.
- Preserve `GameState.isAnimating` checks to avoid overlapping transitions.
- Preserve `_exploreAbort` behavior when rerendering or changing language.
- Keep all runtime assets local unless offline support is no longer required.
- Treat `test-postmessage.html` as part of the integration verification flow.

---

## Testing Checklist

Manual smoke test:

- Open `index.html` with no console errors.
- Confirm the loader appears, then hides after about 2.2 seconds.
- Confirm How to Play opens once after the first load.
- Close How to Play by close button, backdrop, and Escape.
- Let all six Explore steps play.
- Confirm `Start Practice` appears after Explore.
- Select an option and verify Submit enables.
- Submit a wrong answer and verify hint, wrong sound, GIF, retry, and wrong count behavior.
- Submit a correct answer and verify rule feedback, correct sound, GIF, progress dot, and advance.
- Complete all six questions and verify Summary title, stars, accuracy, and Play Again.
- Verify last correct answer can trigger confetti in landscape.
- Verify Play Again resets to loading.

Localization:

- Switch each supported language from the language modal.
- Confirm URL `?lang=` updates.
- Confirm `localStorage.game_lang` persists the choice.
- Confirm current screen rerenders after language change.
- Confirm Explore restarts cleanly if language is changed during Explore.

Layout and responsive:

- Test default desktop/laptop viewport.
- Test tablet landscape around `1024 x 600`.
- Test large tablet/laptop widths above `1280px` and `1440px`.
- Test phone landscape under `900px` wide.
- Test compact phone landscape under `812px` wide and `375px` tall.
- Test portrait orientation and confirm content remains usable.
- Test all four frame switcher buttons.

Integration:

- Open `test-postmessage.html`.
- Complete the game inside the iframe.
- Confirm the parent page logs `GAME_COMPLETE` with `correct`, `wrong`, `accuracy`, and `stars`.

Accessibility and browser APIs:

- Confirm progress dots update ARIA values.
- Confirm option cards update `aria-checked`.
- Confirm fullscreen button toggles icon, title, and aria-label.
- Confirm button click sound does not throw autoplay errors.

---

## Recommended Next Steps

1. Decide the production status of the frame switcher.
2. Add a small automated browser smoke test for the core flow.
3. Clean the localization files or document why legacy place-value keys remain.
4. Add or remove portrait blocking intentionally, instead of leaving only an unused translation key.
5. Verify the app on the real target devices and hosting environment.
6. If this is reused as a template, document the exact content files that should be edited for a new topic.
