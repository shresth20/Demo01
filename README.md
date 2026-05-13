# Math Learning Game

An interactive, offline-first math learning module built with vanilla HTML, CSS, and JavaScript. Teaches Math Concepts through an animated walkthrough practice session. Supports 5 languages and works on tablets, laptops, and classroom panels.

# For full technical details see [HANDOVER.md](HANDOVER.md).

---

## Quick Start

Open `index.html` directly in a browser — no build step, no server required.

---

## Template Philosophy

Content is fully separated from the engine. To create a new game on this template, you only edit:

| File | What you change |
|---|---|
| `js/activities.js` | Explore walkthrough steps and practice questions |
| `js/bodmas-locales.js` | All UI text strings in all 5 languages |
| `assets/` | Character GIFs, decorative icons, sounds |
| `css/style.css` `:root` | Color palette and font choices |

Everything else — screen transitions, state management, audio, accessibility, responsiveness, language switching — is reusable without modification.

---

## File Structure

```
Demo01/
├── index.html              ← Single entry point; all screens rendered here
├── css/
│   ├── style.css           ← Design tokens (CSS variables) + component styles
│   ├── animations.css      ← Keyframe definitions (shake, pulse, confetti)
│   └── responsive.css      ← Breakpoint overrides
├── js/
│   ├── vendor/anime.min.js ← Animation library (local, no CDN)
│   ├── utils.js            ← DOM helpers: qs(), qsa(), setClass(), wait()
│   ├── state.js            ← Game state singleton (GameState)
│   ├── activities.js       ← ★ Explore steps + practice questions (edit this)
│   ├── animations.js       ← Anime.js wrappers
│   ├── audio.js            ← Sound preloading and playback
│   ├── bodmas-locales.js   ← ★ All UI strings in 5 languages (edit this)
│   ├── i18n.js             ← Internationalization engine
│   └── app.js              ← Orchestrator: rendering, events, screen transitions
├── assets/
│   ├── images/             ← Character art and decorative PNGs
│   ├── icons/              ← SVG math symbols and UI icons
│   ├── gifs/               ← correct.gif, incorrect.gif, loader.gif
│   ├── sounds/             ← button-click.wav, correct/incorrect mp3s
│   └── fonts/              ← Lilita One + Nunito (local, no CDN)
├── locales.json            ← Supported language list and default language
├── HANDOVER.md             ← Full developer reference
└── .claude/CLAUDE.md       ← Agent operating rules
```

---

## HTML Layer System

The layout uses a 6-layer z-index architecture declared in `index.html`:

Screen = Single View
Layers = Z‑Index Stack
Frame = Content Container

| Layer | Element | Z-index | Purpose |
|---|---|---|---|
| 6 | `#feedback-overlay` | 100 | Toast message + character GIF |
| 5 | `<header>` / `<footer>` | 5 | Progress dots + Submit button |
| 4 | `#content-area` | 4 | Rendered screens (Loading / Explore / Practice) |
| 3 | `#deco-layer` | 3 | Fixed decorative math icons |
| 2 | `#board` | 2 | White card container |
| 1 | `<body>` background | 1 | Off-white page color |

---

## CSS Variables

All design tokens live in `:root` inside `css/style.css`.

```css
/* Colors */
--color-bg: #FFFEF6;          /* Page background */
--color-navy: #1B3A6B;        /* Primary text and UI */
--color-submit: #F5B61A;      /* Submit button */
--color-correct: #22C55E;     /* Correct answer highlight */
--color-wrong: #EF4444;       /* Wrong answer highlight */

/* Typography */
--font-primary: 'Lilita One'; /* Titles */
--font-accent: 'Nunito';      /* Body text */
--font-size-expr: clamp(30px, 4vw, 48px); /* Math expressions */

/* Spacing: --space-xs (4px) → --space-xl (40px) */
/* Z-index: --z-bg (1) → --z-overlay (9999) */
/* Transitions: --dur-fast (150ms), --dur-normal (350ms) */
```

---

## Screen Flow

```
Loading (2.2 s) → Explore (6 walkthrough steps) → Practice (6 questions) → Summary
```

- **Explore** — Animated step-by-step BODMAS breakdown with highlights and resolved expressions.
- **Practice** — 4-option multiple choice. Correct answer shows rule explanation; wrong answer shows a hint and allows retry.
- **Summary** — Star rating (0–3) and accuracy percentage. Play Again resets cleanly.

---

## Languages

English · Hindi · Marathi · Telugu · Gujarati

Switchable mid-game via the language button in the header. Add a new language by extending the `BODMAS_LOCALES` object in `bodmas-locales.js` and adding it to `locales.json`.

---

## Key Constraints

- **Offline only** — no external CDN calls; all assets are local.
- **Landscape only** — portrait mode on phones shows a "rotate device" prompt.
- **No build tools** — plain `<script>` tags; load order matters (documented in HANDOVER.md).
- **No frameworks** — vanilla JS with Anime.js for animations only.

---

## Making a New Game

1. Duplicate this folder.
2. Edit `js/activities.js` — new explore steps and practice questions.
3. Edit `js/bodmas-locales.js` — new text strings in all 5 languages.
4. Swap `assets/gifs/` and `assets/icons/` for your topic.
5. Adjust color variables in `css/style.css :root`.
6. Update `locales.json` if the language list changes.
7. Test the full flow on desktop and a tablet in landscape.

See [HANDOVER.md](HANDOVER.md) for the complete reference including the data schemas, JS API, audio system, responsive breakpoints, and a pre-handoff checklist.
