# BODMAS Game - Developer Handover

This handover reflects the current repository structure. The project has been split into `core` and `content` folders for CSS and JavaScript, and localization now lives in `locales/core.json` plus `locales/content.json`.

---

## Project Overview

This is a static, offline-friendly BODMAS math learning game. It teaches order of operations with a short Explore walkthrough, then asks six multiple-choice practice questions.

- Main entry point: `index.html`
- Current topic: BODMAS order of operations
- Runtime: browser only
- Build system: none
- Package manager: none
- Runtime dependency: local `js/vendor/anime.min.js`
- Supported language codes: `en`, `hi`, `mr`, `te`, `gu`, `od`
- Completion integration: `window.parent.postMessage()` with `GAME_COMPLETE`
- Temporary developer UI: frame switcher in the lower-right corner

---

## Current File and Folder Structure

```text
Demo01/
|-- index.html                  Main browser entry point and static DOM shell
|-- game.config.json            Empty placeholder for future game metadata
|-- README.md                   Project overview and run notes
|-- HANDOVER.md                 Developer handover and implementation notes
|-- test-postmessage.html       Iframe harness for GAME_COMPLETE testing
|-- docs/
|   |-- architecture.md         Placeholder, currently empty
|   |-- content-authoring.md    Placeholder, currently empty
|   `-- new-game-checklist.md   Placeholder, currently empty
|-- locales/
|   |-- core.json               Locale metadata, shared labels, legacy strings
|   `-- content.json            Active BODMAS game strings
|-- css/
|   |-- core/
|   |   |-- style.css           Design tokens, shell, chrome, modals
|   |   |-- animations.css      Shared keyframes and motion fallbacks
|   |   |-- responsive.css      Shared responsive shell rules
|   |   `-- frames.css          Temporary frame switcher layouts
|   `-- content/
|       |-- pages.css           BODMAS screen, feedback, summary styles
|       `-- responsive.css      BODMAS-specific responsive rules
|-- js/
|   |-- vendor/
|   |   `-- anime.min.js        Local Anime.js dependency
|   |-- core/
|   |   |-- utils.js            DOM and timing helpers
|   |   |-- state.js            GameState singleton
|   |   |-- i18n.js             Locale loading, merge, and persistence
|   |   |-- animations.js       Shared screen transition helpers
|   |   |-- audio.js            Sound effects and completion tone
|   |   |-- frames.js           Temporary frame switcher
|   |   |-- content-renderer.js Core-to-content render bridge
|   |   |-- content-observer.js Placeholder, currently empty
|   |   `-- app.js              Main game orchestrator
|   `-- content/
|       |-- pages.js            Explore steps, questions, screen markup
|       |-- validators.js       Answer checking and summary scoring
|       |-- animations.js       BODMAS explore, option, confetti animations
|       `-- voiceovers.js       Placeholder, currently empty
`-- assets/
    |-- fonts/
    |   |-- lilita_one/
    |   `-- nunito/
    |-- GIFs/
    |   |-- loader.gif
    |   |-- correct.gif
    |   `-- incorrect.gif
    |-- icons/                  Header icons, stars, operators, artwork SVGs
    |-- images/                 Logo, calculator, and Swiftee character art
    `-- sounds/                 Button, correct, wrong, and extra sound files
```

Notes:

- `game.config.json` exists but is empty and is not read by the current code.
- `docs/*.md`, `js/core/content-observer.js`, and `js/content/voiceovers.js` are placeholders right now.
- The active runtime uses only the split paths shown above; older flat-path files from previous revisions should not be restored.

---

## HTML Layer System

`index.html` is organized as a visual layer stack. The z-index values live in `css/core/style.css`.

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

- `#content-area` is the only safe target for injected screen content.
- `#board-secondary` is hidden by default and is shown only by frame variants in `css/core/frames.css`.
- The frame switcher is temporary developer UI and sits just below the header/footer z-index.
- Header and footer heights are controlled with `--header-h` and `--footer-h`; the board positions itself between them.

---

## Stylesheet Load Order

The order in `index.html` is:

```text
1. css/core/style.css
2. css/core/animations.css
3. css/content/pages.css
4. css/core/responsive.css
5. css/content/responsive.css
6. css/core/frames.css
```

Keep this order unless you intentionally refactor the cascade.

---

## Script Load Order

The project uses plain global scripts. There is no module loader, so order matters.

```text
1. js/vendor/anime.min.js
2. js/core/utils.js
3. js/content/pages.js
4. js/content/validators.js
5. js/core/state.js
6. js/content/voiceovers.js
7. js/core/animations.js
8. js/content/animations.js
9. js/core/audio.js
10. js/core/i18n.js
11. js/core/frames.js
12. js/core/content-renderer.js
13. js/core/content-observer.js
14. js/core/app.js
```

Practical dependency notes:

- `app.js` should remain last because it wires the app after all globals exist.
- `content-renderer.js` expects `ContentPages` from `js/content/pages.js`.
- `state.js` calls `ContentValidators` at runtime, so `validators.js` must be loaded before answer handling.
- `content/animations.js` uses helpers from `core/animations.js`.
- `i18n.js` loads `locales/core.json`, then `locales/content.json`.

---

## Core vs Content Split

Core files are reusable game-shell behavior:

- `js/core/app.js`: screen transitions, persistent controls, feedback, modals, completion messaging.
- `js/core/state.js`: score, current question, selected answer, submit and animation guards.
- `js/core/i18n.js`: locale JSON loading, content merge, URL/localStorage language persistence.
- `js/core/audio.js`: click, correct, wrong, and completion sounds.
- `js/core/frames.js`: temporary layout frame switcher.
- `js/core/animations.js`: shared screen enter/exit animation helpers.
- `js/core/content-renderer.js`: small bridge from core screen names to content builders.
- `js/core/utils.js`: `qs`, `qsa`, `setClass`, `wait`, and escaping helpers.

Content files are the current BODMAS lesson:

- `js/content/pages.js`: Explore step data, practice question data, and markup builders.
- `js/content/validators.js`: answer correctness, feedback messages, and summary scoring.
- `js/content/animations.js`: Explore sequence, option-card animation, and confetti.
- `locales/content.json`: BODMAS labels, walkthrough annotations, hints, rules, modal text.
- `css/content/pages.css`: BODMAS-specific screen styling.
- `css/content/responsive.css`: BODMAS-specific responsive adjustments.

This split is the main place to work when turning the template into another activity: keep shell behavior in `core`, and place lesson-specific data, rendering, validation, animation, and copy in `content`.

---

## Game Flow

1. `DOMContentLoaded` runs in `js/core/app.js`.
2. `I18n.load()` loads `locales/core.json`, then `locales/content.json`.
3. Static DOM translations are applied.
4. Progress dots and persistent listeners are attached.
5. The app transitions to `loading`.
6. The loader overlay remains for about 2.2 seconds.
7. The app transitions to `explore`.
8. The How to Play modal opens once after the first loading sequence.
9. Explore mode plays six walkthrough steps.
10. `Start Practice` appears after Explore completes.
11. Practice renders one question at a time.
12. The learner selects an option, then clicks Submit.
13. Correct answers advance after feedback; wrong answers retry the same question.
14. After all six questions are answered correctly, the Summary modal opens.
15. The Summary modal sends `GAME_COMPLETE` to `window.parent`.
16. `Play Again` resets `GameState` and returns to loading.

---

## Important Files

| File | Purpose |
| --- | --- |
| `index.html` | Stable DOM shell, layer order, static modals, board containers, and script/style load order. |
| `game.config.json` | Empty placeholder; not read by the current runtime. |
| `test-postmessage.html` | Parent-page iframe harness for verifying `GAME_COMPLETE`. |
| `locales/core.json` | Default language, supported language names, shared labels, and legacy place-value strings. |
| `locales/content.json` | Active BODMAS UI text, walkthrough annotations, hints, and rules. |
| `js/core/app.js` | Main controller for rendering, transitions, controls, modals, feedback, summary, fullscreen, and postMessage. |
| `js/core/state.js` | `GameState` singleton for current screen, current question, score, wrong count, selected answer, and guards. |
| `js/core/i18n.js` | Loads and merges locale data, resolves language, updates URL and localStorage. |
| `js/core/audio.js` | Preloads and plays button, correct, wrong, and completion audio. |
| `js/core/frames.js` | Builds the temporary frame switcher and applies `body.frame--N` classes. |
| `js/core/animations.js` | Shared Anime.js wrappers and no-op fallbacks for screen transitions. |
| `js/core/content-renderer.js` | Delegates core screen names to `ContentPages.buildScreen()`. |
| `js/core/content-observer.js` | Reserved placeholder; currently empty. |
| `js/content/pages.js` | BODMAS Explore steps, six practice questions, and screen HTML builders. |
| `js/content/validators.js` | Answer checking, localized feedback lookup, and summary star/accuracy calculation. |
| `js/content/animations.js` | Explore sequencing, option-card animations, and final confetti. |
| `js/content/voiceovers.js` | Reserved placeholder; currently empty. |
| `css/core/style.css` | Design tokens, fixed shell, board, header/footer, loader, modals, language picker, and shared layout. |
| `css/core/animations.css` | Shared keyframes and reduced-motion behavior. |
| `css/core/responsive.css` | Shared responsive shell, board, chrome, modal, and decoration rules. |
| `css/core/frames.css` | Temporary frame layout variants and frame switcher styling. |
| `css/content/pages.css` | BODMAS loading, explore, practice, feedback, How to Play, and summary styles. |
| `css/content/responsive.css` | Content-specific responsive rules for compact, phone, and tablet layouts. |

---

## Core Logic

`GameState` tracks:

- `currentScreen`: `loading`, `explore`, `practice`, or `complete`
- `currentQuestion`: zero-based practice question index
- `score`: number of correct submissions
- `wrongCount`: number of wrong submissions
- `selectedAnswer`: selected option index or `null`
- `isSubmitted`: blocks repeated submits for one attempt
- `isAnimating`: blocks overlapping screen transitions

Answer handling:

- `handleOptionSelect(index)` stores the selected option and enables Submit.
- `handleSubmit()` checks the option through `ContentValidators.isAnswerCorrect()`.
- `GameState.recordAnswer()` increments `score` or `wrongCount`.
- Correct feedback waits about 2.5 seconds, then advances.
- Wrong feedback waits about 2 seconds, then rerenders the same question.
- `GameState.advance()` moves to the next question or sets the screen to `complete`.

Scoring:

- Accuracy is based on attempts, not just question count.
- Formula: `score / (score + wrongCount)`.
- Stars are calculated in `ContentValidators.getSummaryResult()`.

Question ID rule:

- IDs like `q1` must match localization keys like `bodmasRule_q1` and `bodmasHint_q1`.
- Missing translation keys fall back to visible key text, so keep those aligned.

---

## Localization

Localization is handled by `js/core/i18n.js`.

Load process:

1. XHR loads `locales/core.json`.
2. XHR loads `locales/content.json`.
3. Content strings are merged into each language object from the core locale data.
4. Initial language is resolved from URL `?lang=`, then `localStorage.game_lang`, then `defaultLanguage`.
5. The URL is updated with the resolved language.
6. Static DOM text and the current screen render with the selected language.

Current language codes:

- `en` - English
- `hi` - Hindi
- `mr` - Marathi
- `te` - Telugu
- `gu` - Gujarati
- `od` - Odia

Notes:

- Add or remove language codes in `locales/core.json` under `supportedLanguages`.
- Add matching complete language objects in `locales/content.json`.
- `languageLabels` exists in `locales/core.json`, but the current dropdown reads `supportedLanguages`.
- `locales/core.json` still contains legacy place-value strings that are not rendered by the current BODMAS flow.
- `bodmasRotateMsg` exists in content translations, but no active rotate-blocking overlay is currently present.

---

## Responsive Implementation

Responsive behavior is split by ownership:

- `css/core/style.css`: root variables, shell, board, chrome, loader, modal, language picker, and shared components.
- `css/core/responsive.css`: shared layout and chrome rules for tablets, laptops, phones, portrait, foldables, and short screens.
- `css/content/pages.css`: BODMAS-specific screens, feedback, How to Play content, and summary.
- `css/content/responsive.css`: content-specific compaction and phone/tablet adjustments.
- `css/core/frames.css`: frame switcher layouts for `frame--1` through `frame--4`.

Important behavior:

- The board is fixed between `--header-h` and `--footer-h`.
- Portrait layouts adapt content and hide large decorations; they do not block the UI.
- `assets/GIFs/` casing matters because the code references it exactly.

---

## Modal and Overlay Behavior

How to Play modal:

- Opens automatically once after the first loading sequence.
- Opens from the Info header button.
- Closes from the close button, Escape key, or backdrop click.
- Returns focus to the Info button after closing.

Language modal:

- Opens from the language header button.
- Dropdown is populated from `I18n.getSupportedLanguages()`.
- Apply is disabled until the selected language changes.
- Applying a language updates URL, document language, and `localStorage`.
- The current screen rerenders after the confirmation view.
- If the current screen is Explore, the Explore sequence restarts.

Summary modal:

- Opens when the game completes.
- Displays localized title, three stars, accuracy, and Play Again.
- Sends `GAME_COMPLETE` to `window.parent`.
- Play Again is the normal exit path.

Feedback overlay:

- Uses `#feedback-overlay`, `#feedback-toast`, and `#feedback-char-gif`.
- Correct feedback uses `assets/GIFs/correct.gif`.
- Wrong feedback uses `assets/GIFs/incorrect.gif`.

---

## Assets

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
- `assets/images/Swiftee01.png` through `assets/images/Swiftee06.png`

Sounds:

- Used by current code: `button-click.wav`, `correct-answer.mp3`, `incorrect-answer.mp3`
- Present but not currently used by `audio.js`: `jump.mp3`, `sound_trash.mp3`

---

## Completion postMessage

When the Summary modal opens, `js/core/app.js` sends:

```javascript
window.parent.postMessage({
  type: 'GAME_COMPLETE',
  score: score,
  total: ContentPages.getPracticeQuestionCount(),
  correct: score,
  wrong: GameState.wrongCount,
  accuracy: pct,
  stars: earned
}, '*');
```

Use `test-postmessage.html` to verify this behavior. It loads `index.html` in an iframe and logs the completion payload.

---

## Known Issues and Limitations

- No automated test suite is included.
- No build pipeline or package manifest is included.
- `game.config.json` is empty and unused.
- `docs/*.md`, `js/core/content-observer.js`, and `js/content/voiceovers.js` are placeholders.
- The frame switcher is temporary but currently visible.
- `locales/core.json` contains unused legacy place-value strings.
- `bodmasRotateMsg` exists, but no rotate overlay is present in `index.html`.
- The reset button only affects the practice screen.
- Missing BODMAS localization keys can display literal key strings.
- Direct file opening depends on browser behavior for local XHR; use a static server if locale files fail to load.

---

## Things to Avoid Breaking

- Do not change script order in `index.html` without refactoring dependencies.
- Do not rename `assets/GIFs/`; the app references that exact casing.
- Do not remove `locales/core.json` or `locales/content.json`; `i18n.js` loads both.
- Keep question IDs aligned with `bodmasRule_*` and `bodmasHint_*` keys.
- Keep `correctIndex` zero-based and valid for the question `options` array.
- Preserve `GameState.isAnimating` checks to avoid overlapping transitions.
- Preserve `_exploreAbort` behavior when rerendering or changing language.
- Keep all runtime assets local unless offline support is no longer required.
- Treat `test-postmessage.html` as part of integration verification.

---

## Manual Testing Checklist

Core flow:

- Open `index.html` or serve the folder locally.
- Confirm the loader appears, then hides after about 2.2 seconds.
- Confirm How to Play opens once after the first load.
- Close How to Play by close button, backdrop, and Escape.
- Let all six Explore steps play.
- Confirm `Start Practice` appears after Explore.
- Select an option and verify Submit enables.
- Submit a wrong answer and verify hint, wrong sound, GIF, retry, and wrong count behavior.
- Submit a correct answer and verify rule feedback, correct sound, GIF, progress dot, and advance.
- Complete all six questions and verify Summary title, stars, accuracy, and Play Again.
- Verify Play Again resets to loading.

Localization:

- Switch each supported language from the language modal.
- Confirm URL `?lang=` updates.
- Confirm `localStorage.game_lang` persists the choice.
- Confirm current screen rerenders after language change.
- Confirm Explore restarts cleanly if language changes during Explore.

Layout:

- Test default desktop/laptop viewport.
- Test tablet landscape around `1024 x 600`.
- Test large widths above `1280px` and `1440px`.
- Test phone landscape under `900px` wide.
- Test compact phone landscape under `812px` wide and `375px` tall.
- Test portrait orientation and confirm content remains usable.
- Test all four frame switcher buttons.

Integration:

- Open `test-postmessage.html`.
- Complete the game inside the iframe.
- Confirm the parent page logs `GAME_COMPLETE` with `correct`, `wrong`, `accuracy`, and `stars`.

---

## Recommended Next Steps

1. Decide whether to keep, hide, or remove the temporary frame switcher.
2. Fill or remove the placeholder docs, depending on whether this repo will become a reusable template.
3. Decide whether `game.config.json`, `content-observer.js`, and `voiceovers.js` should become real extension points.
4. Add smoke tests for loading, Explore, practice, summary, localization, and postMessage.
5. Clean legacy locale strings after confirming they are not needed by downstream templates.
