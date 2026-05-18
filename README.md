# Math Learning Game

An offline-friendly, browser-based math learning game that teaches the BODMAS order of operations through a short animated walkthrough and a six-question practice round. The project is built with vanilla HTML, CSS, and JavaScript, uses local assets only, and is designed for tablets, laptops, classroom displays, and phone landscape layouts.

## For deeper developer handover details, see [HANDOVER.md](HANDOVER.md).

---

## Main Features

- Loading screen with a local GIF loader.
- Six-step Explore mode that demonstrates BODMAS solving order.
- Six multiple-choice practice questions with four options each.
- Correct and incorrect feedback using localized text, sounds, and GIFs.
- Progress dots that track practice question progress.
- Summary modal with accuracy percentage and 0-3 earned stars.
- Language selector with six supported language codes: `en`, `hi`, `mr`, `te`, `gu`, and `od`.
- Language persistence through `localStorage` and the `?lang=` URL query parameter.
- Fullscreen toggle with icon and tooltip updates.
- Temporary frame switcher for testing four board layouts.
- Completion `postMessage` support for iframe/LMS hosts.
- Fully local fonts, images, icons, GIFs, sounds, and Anime.js dependency.

---

## Tech Stack

- HTML5
- CSS3 with custom properties, `clamp()`, media queries, and local fonts
- Vanilla JavaScript using global script files
- Anime.js, vendored locally at `js/vendor/anime.min.js`
- Browser APIs: DOM, XHR, `localStorage`, Fullscreen API, Audio/Web Audio, and `window.postMessage`

There are no npm dependencies, no bundler, and no framework.

---

## Project Structure

```text
Demo01/
|-- index.html
|-- test-postmessage.html
|-- locales.json
|-- README.md
|-- HANDOVER.md
|-- css/
|   |-- style.css
|   |-- animations.css
|   |-- responsive.css
|   `-- frames.css
|-- js/
|   |-- vendor/
|   |   `-- anime.min.js
|   |-- utils.js
|   |-- state.js
|   |-- activities.js
|   |-- animations.js
|   |-- audio.js
|   |-- bodmas-locales.js
|   |-- i18n.js
|   |-- frames.js
|   `-- app.js
`-- assets/
    |-- fonts/
    |-- GIFs/
    |-- icons/
    |-- images/
    `-- sounds/
```

---

## Installation Steps

No package installation is required.

1. Download or clone the project.
2. Keep the folder structure intact, especially `assets/`, `css/`, `js/`, and `locales.json`.
3. Open `index.html` in a modern browser, or serve the folder with any static file server.

---

## How to Run Locally

Option 1: open the file directly.

```text
index.html
```

Option 2: run a simple static server from the project root.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

A static server is useful if a browser blocks local XHR access to `locales.json`.

---

## Available Scripts

There are no npm scripts or project-specific CLI scripts. The app runs directly in the browser.

Useful manual commands:

```bash
python -m http.server 8000
```

```bash
git status --short
```

---

## Environment Variables

No environment variables are used by the current project.

---

## How to Build

There is no build step. For deployment, copy the static files to any static hosting environment:

- `index.html`
- `locales.json`
- `css/`
- `js/`
- `assets/`

Keep file and folder names case-sensitive for hosting environments that enforce case-sensitive paths. For example, `assets/GIFs/` is referenced with uppercase `GIFs`.

---

## How to Use the Project

1. Launch `index.html`.
2. Wait for the loading overlay to finish.
3. The How to Play modal opens the first time after loading.
4. Watch the Explore mode walkthrough.
5. Click `Start Practice` after the walkthrough completes.
6. Select one answer option and click `Submit`.
7. Correct answers advance after feedback; incorrect answers show a hint and retry the same question.
8. After all questions are answered correctly, the Summary modal shows stars and accuracy.
9. Click `Play Again` to reset the game.

The bottom-right frame switcher is a temporary developer UI for testing board layouts. It switches between transparent, standard, and dual-board layouts.

---

## Responsive Design Notes

Responsive behavior is split across `css/style.css`, `css/responsive.css`, and `css/frames.css`.

- `style.css` defines global tokens, fixed header/footer chrome, board layout, modals, feedback, and base screen styles.
- `responsive.css` adjusts tablets, laptops, high-resolution displays, compact landscape phones, foldables, portrait layouts, and small-height viewports.
- `frames.css` defines four body frame classes: `frame--1`, `frame--2`, `frame--3`, and `frame--4`.
- Font sizes, spacing, icon sizes, header height, and footer height use CSS variables and `clamp()`.
- The board sits between the fixed header and footer using `--header-h` and `--footer-h`.
- Portrait layouts are responsive, but there is no active rotate-blocking overlay in the current `index.html`.

---

## Language and Localization Notes

Localization is handled by `js/i18n.js`, `locales.json`, and `js/bodmas-locales.js`.

- `locales.json` defines `defaultLanguage`, `supportedLanguages`, shared labels, and a large set of legacy place-value strings.
- `js/bodmas-locales.js` defines the active BODMAS-specific strings.
- At runtime, `i18n.js` loads `locales.json` and merges `BODMAS_LOCALES` into each language.
- Initial language resolution order is URL `?lang=`, then `localStorage` key `game_lang`, then `defaultLanguage`.
- The current supported language codes are `en`, `hi`, `mr`, `te`, `gu`, and `od`.

When adding or changing a language, update both `supportedLanguages` in `locales.json` and the matching language object in `js/bodmas-locales.js`.

---

## Important Files

| File | Purpose |
| --- | --- |
| `index.html` | Main DOM shell, header/footer, modals, board containers, script order, and frame switcher host. |
| `js/app.js` | Main game orchestrator for rendering screens, events, feedback, modals, summary, and completion messaging. |
| `js/state.js` | Global `GameState` singleton for screen, question, score, wrong attempts, selection, and animation guards. |
| `js/activities.js` | Current BODMAS Explore steps and six practice questions. |
| `js/bodmas-locales.js` | BODMAS UI text, walkthrough annotations, hints, and rules in six languages. |
| `js/i18n.js` | Locale loading, language resolution, translations, URL sync, and `localStorage` persistence. |
| `js/frames.js` | Temporary frame layout switcher. |
| `js/audio.js` | Button click, correct answer, wrong answer, and completion tone playback. |
| `css/style.css` | Main design system and component styles. |
| `css/responsive.css` | Tablet, laptop, phone landscape, foldable, portrait, and compact-height responsive rules. |
| `css/frames.css` | Optional frame layout styles. |
| `test-postmessage.html` | Harness for testing the `GAME_COMPLETE` postMessage payload. |

---

## Assets Used

- Fonts: local Lilita One and Nunito font files in `assets/fonts/`.
- GIFs: `loader.gif`, `correct.gif`, and `incorrect.gif` in `assets/GIFs/`.
- Images: logo, calculator art, and Swiftee character images in `assets/images/`.
- Icons: reset, info, language, fullscreen, close, star, decorative math symbols, and layout/math artwork in `assets/icons/`.
- Sounds: button click, correct answer, incorrect answer, plus unused `jump.mp3` and `sound_trash.mp3` files in `assets/sounds/`.

---

## Known Issues or Limitations

- No automated test suite is included.
- No build pipeline or package manifest is included.
- The frame switcher is marked temporary and is visible in the current UI.
- `locales.json` still contains many legacy place-value strings that are not rendered by the current BODMAS flow.
- `bodmasRotateMsg` exists in translations, but there is no active rotate overlay in the current DOM.
- The reset button currently works only during the practice screen.
- Practice question feedback depends on matching translation keys such as `bodmasRule_q1` and `bodmasHint_q1`.

---

## Future Improvements

- Decide whether the temporary frame switcher should remain, be hidden, or move behind a developer flag.
- Add automated smoke tests for the full game flow and postMessage payload.
- Clean up unused legacy locale strings after confirming they are not needed by downstream templates.
- Add an explicit rotate overlay if portrait blocking is still required.
- Add a small deployment note or static-hosting checklist for the target platform.

---

## Developer Notes

- Do not reorder script tags in `index.html`; the files depend on the current load order.
- Keep all assets local to preserve offline behavior.
- If you add questions, keep each `id` aligned with the matching localization keys.
- `correctIndex` is zero-based and must point to an item in the question's `options` array.
- Summary accuracy is based on total answer attempts: `score / (score + wrongCount)`.
- The app sends a `GAME_COMPLETE` postMessage from the summary modal with score, total, correct, wrong, accuracy, and stars.
