# Game Template — Developer Handover

This document gives a new developer everything needed to understand the existing BODMAS game and build a new game from this template by replacing only the content layer — no architectural changes needed.

---

## Why This Template Is Easy to Use

The game is structured so that **content is completely separate from infrastructure**. Every part that changes game-to-game lives in a small set of data files. Everything else — layout, animations, audio, accessibility, responsive design, language support, screen transitions — is reusable as-is.

| What changes between games | What stays the same |
|---|---|
| `js/activities.js` (questions & steps) | HTML structure and layer system |
| `js/bodmas-locales.js` (all text strings) | CSS variables and responsive rules |
| `assets/` images and GIFs | `app.js` event and screen flow |
| Topic-specific CSS tweaks | `state.js`, `i18n.js`, `audio.js`, `animations.js` |

**What this means in practice:** To create a new game, you primarily edit `activities.js` (new questions), `bodmas-locales.js` (new text), and swap assets. You do not rewrite the engine.

---

## Flexibility Built In

- **5 languages out of the box** — English, Hindi, Marathi, Telugu, Gujarati. Add more by extending one object in `bodmas-locales.js`.
- **6-question practice with explore walkthrough** — Change to any number by editing the arrays; the progress-dot system adapts automatically.
- **Works offline** — All assets are local. No CDN calls. Works on school tablets with no internet.
- **Responsive from phone landscape to 4K panels** — `clamp()`-based font sizing and a fixed-position board that scales with `width: 90%`.
- **Portrait blocking** — Automatically shows a "rotate device" overlay on phones in portrait.
- **Accessible** — ARIA roles, keyboard navigation, semantic HTML, and non-color-only feedback built in.
- **Anime.js animations with CSS fallbacks** — Remove the vendor library and the game still works; CSS class animations take over.

---

## File & Folder Structure

```
Demo01/
├── index.html                  ← Single HTML file; all screens rendered into it
│
├── css/
│   ├── style.css               ← Design tokens (CSS variables) + all component styles
│   ├── animations.css          ← Keyframe definitions (shake, pulse, confetti)
│   └── responsive.css          ← Breakpoint overrides (tablet, large screen, compact height)
│
├── js/
│   ├── vendor/
│   │   └── anime.min.js        ← Anime.js animation library (local, no CDN)
│   │
│   ├── utils.js                ← Tiny helpers: qs(), qsa(), setClass(), wait()
│   ├── state.js                ← Game state singleton (GameState)
│   ├── activities.js           ← ★ CONTENT: explore steps + practice questions
│   ├── animations.js           ← Anime.js wrappers for screen/card/explore animations
│   ├── audio.js                ← Sound preloading and playback
│   ├── bodmas-locales.js       ← ★ CONTENT: all UI strings in 5 languages
│   ├── i18n.js                 ← Internationalization engine (load, translate, switch)
│   └── app.js                  ← Orchestrator: rendering, events, screen transitions
│
├── assets/
│   ├── images/
│   │   ├── Swiftee-left.png    ← Character shown in modals (left side)
│   │   ├── Swiftee-right.png   ← Character shown in modals (right side)
│   │   ├── Calculator.png      ← Decorative element
│   │   └── Swiftee01-06.png    ← Character animation frames (reserved)
│   │
│   ├── icons/                  ← All SVG icons (math operators, UI buttons, decorations)
│   │   ├── +.svg, ×.svg, ÷.svg, =.svg, ½.svg, π.svg, ×3.svg
│   │   ├── reset.svg, info.svg, language.svg, fullscreen.svg
│   │   ├── close_popup.svg, star.svg
│   │   └── Group.svg, Pencil.svg, Equaction.svg, Vector.svg
│   │
│   ├── gifs/
│   │   ├── correct.gif         ← Character celebration (correct answer feedback)
│   │   ├── incorrect.gif       ← Character reaction (wrong answer feedback)
│   │   └── loader.gif          ← Loading screen animation
│   │
│   ├── sounds/
│   │   ├── button-click.wav    ← Plays on every button click
│   │   ├── correct-answer.mp3  ← Correct answer celebration
│   │   ├── incorrect-answer.mp3← Wrong answer feedback
│   │   ├── jump.mp3            ← Preloaded, available for use
│   │   └── sound_trash.mp3     ← Preloaded, available for use
│   │
│   └── fonts/
│       ├── LilitaOne-Regular.ttf  ← Display/title font (weight 400)
│       └── Nunito-VariableFont_wght.ttf ← Body font (variable, 100–900)
│
├── locales.json                ← App-level locale config (language list and metadata)
├── HANDOVER.md                 ← This file
└── .claude/CLAUDE.md           ← Agent operating rules (do not delete)
```

---

## HTML Layer System

`index.html` uses a **6-layer z-index architecture** with fixed positioning. Every layer has a comment block explaining it. Understanding these layers prevents layout bugs.

```
┌─────────────────────────────────────────────────┐
│  Layer 6 — Feedback Overlay     z-index: 100    │  ← Toast + GIF (above everything)
│  Layer 5 — Header & Footer      z-index: 5      │  ← Always-visible chrome
│  Layer 4 — Content Area         z-index: 4      │  ← Rendered screens (Loading/Explore/Practice)
│  Layer 3 — Decorative Icons     z-index: 3      │  ← Fixed background math symbols
│  Layer 2 — Board Card           z-index: 2      │  ← White rounded card behind content
│  Layer 1 — Page Background      z-index: 1      │  ← Off-white page color
└─────────────────────────────────────────────────┘
```

### DOM Skeleton

```html
<body>
  <div id="rotate-overlay">      <!-- Shows when portrait on mobile -->

  <header>                        <!-- Layer 5: progress dots + icon buttons -->
    <div id="progress-dots">
    <div class="header-btns">     <!-- Reset, Info, Language, Fullscreen -->

  <main role="main">
    <div id="board">              <!-- Layer 2: white card -->
      <section id="content-area" aria-live="polite">
        <!-- ↑ Layer 4: JS renders Loading / Explore / Practice HTML here -->

  <div id="feedback-overlay">     <!-- Layer 6: toast message + character GIF -->

  <div id="deco-layer" aria-hidden="true">  <!-- Layer 3: 16 decorative icons -->

  <footer>                        <!-- Layer 5: Submit button -->

  <!-- Modals (rendered above board via z-index) -->
  <div id="htp-modal">           <!-- How to Play -->
  <div id="lang-modal">          <!-- Language Selection -->
  <div id="summary-modal">       <!-- End-of-game Summary -->

  <div id="loader-overlay">      <!-- Full-screen spinner during init -->
```

**Rule:** Never add new fixed-position elements without assigning a z-index that fits into this system. The layers must not compete.

---

## CSS Variables Reference

All design tokens live in `:root` inside `css/style.css`. Change a variable here and it propagates everywhere.

### Colors

```css
:root {
  /* Backgrounds */
  --color-bg: #FFFEF6;             /* Off-white page background */
  --color-board: #FFFFFF;          /* White card */

  /* Brand / Primary */
  --color-navy: #1B3A6B;           /* Primary text, headers, UI chrome */

  /* Interaction States */
  --color-submit: #F5B61A;         /* Submit button (yellow) */
  --color-correct: #22C55E;        /* Correct answer card border/highlight */
  --color-wrong: #EF4444;          /* Wrong answer card border/highlight */
  --color-dot-active: #FCB717;     /* Progress dot — question answered */

  /* Overlays */
  --color-overlay: rgba(15,30,60,0.42);  /* Modal backdrop */
}
```

### Typography

```css
:root {
  --font-primary: 'Lilita One', cursive;    /* Titles, display text */
  --font-accent:  'Nunito', sans-serif;     /* Body, labels, options */

  --font-weight-title: 500;
  --font-weight-body:  500;

  /* Responsive font sizes using clamp(min, fluid, max) */
  --font-size-popup-body:  clamp(14px, 1.5vw, 18px);
  --font-size-game-body:   clamp(18px, 2vw, 21px);
  --font-size-expr:        clamp(30px, 4vw, 48px);   /* Math expressions */
}
```

### Spacing

```css
:root {
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
}
```

### Z-index Scale

```css
:root {
  --z-bg:       1;
  --z-board:    2;
  --z-deco:     3;
  --z-content:  4;
  --z-chrome:   5;
  --z-modal:    50;
  --z-overlay:  9999;
}
```

### Transitions

```css
:root {
  --dur-fast:   150ms;
  --dur-normal: 350ms;
}
```

---

## JavaScript Load Order

Scripts are loaded in `index.html` in this exact sequence. **Do not reorder them.**

```
1. anime.min.js        — vendor, no dependencies
2. utils.js            — qs(), qsa(), setClass(), wait() — used by everything
3. state.js            — GameState singleton — used by app.js
4. activities.js       — exploreSteps[], practiceQuestions[] — data only
5. animations.js       — anime wrappers — depends on anime + utils
6. audio.js            — sound preloading — depends on nothing
7. bodmas-locales.js   — BODMAS_LOCALES object — consumed by i18n.js
8. i18n.js             — I18n singleton — must load after bodmas-locales.js
9. app.js              — orchestrator — depends on all of the above
```

---

## Screen Flow

```
Loading Screen (2.2 s)
    ↓  (first visit: How-to-Play modal opens automatically)
Explore Screen
    → plays 6 annotated steps showing BODMAS breakdown
    → "Start Practice" button appears
    ↓
Practice Screen (repeated 6 times)
    → user selects one of 4 options
    → clicks Submit
    → correct: toast + GIF + confetti (last Q) → auto-advance
    → wrong:   toast + GIF → stays on same question
    ↓
Complete Screen
    → Summary modal opens immediately
    → shows stars (0–3) and accuracy %
    → "Play Again" resets to Loading
```

The screen renderer lives in `app.js → transitionToScreen(screenName)`. It animates out, replaces `#content-area` innerHTML, animates in.

---

## Game State Reference (`js/state.js`)

```javascript
GameState = {
  currentScreen:   'loading',   // 'loading' | 'explore' | 'practice' | 'complete'
  currentQuestion: 0,           // 0–5 (index into practiceQuestions[])
  score:           0,           // Count of correct answers
  wrongCount:      0,           // Count of wrong attempts
  selectedAnswer:  null,        // Selected option index (0–3) or null
  isSubmitted:     false,       // True after Submit clicked for current Q
  isAnimating:     false,       // Guards against double-transitions

  reset()          → resets all to initial values
  canSubmit()      → true when answer selected and not yet submitted
  recordAnswer(i)  → increments score or wrongCount
  advance()        → moves to next question or sets screen 'complete'
}
```

---

## Content Files — What to Edit for a New Game

### `js/activities.js`

This is the primary content file. It has two exports:

**`exploreSteps` — Walkthrough (shown before practice)**

```javascript
const exploreSteps = [
  {
    id: 'unique-id',              // Used as an identifier
    expression: '6 + 4 × 2',     // Math expression displayed as text
    annotation: '🟠 B — ...',    // Explanation text shown below expression
    highlightPart: '(8 ÷ 4)',    // Optional: substring that gets scale-pulse animation
    resolvedExpression: '6 + 4 × 2 − 2'  // Optional: expression after this step resolves
  },
  // ... 6 steps total recommended
];
```

**`practiceQuestions` — Questions shown during practice**

```javascript
const practiceQuestions = [
  {
    id: 'q1',                     // Used to look up i18n keys (bodmasRule_q1, bodmasHint_q1)
    expression: '8 + 4 × 2',     // The question expression
    options: ['16', '24', '20', '12'],  // Exactly 4 answer options
    correctIndex: 0,              // Index of the correct answer in options[]
    hint: 'Multiply before adding',     // Fallback if i18n key not found
    bodmasRule: 'M comes before A...'   // Fallback if i18n key not found
  },
  // ... 6 questions recommended (matches progress dots)
];
```

### `js/bodmas-locales.js`

Contains all user-facing text in all languages. Structure:

```javascript
const BODMAS_LOCALES = {
  en: {
    // Static UI strings
    appTitle: 'Order of Operations',
    submitBtn: 'Submit',
    // ...

    // Per-question feedback (keyed by question id)
    bodmasRule_q1: 'Multiplication (M) comes before Addition (A)...',
    bodmasHint_q1: 'Try multiplying 4 × 2 first, then add 8.',
    // bodmasRule_q2, bodmasHint_q2, ...

    // Arrays for random selection
    feedbackCorrectRandom: ['Great job!', 'Excellent!', 'Spot on!'],
  },
  hi: { /* Same keys, Hindi text */ },
  mr: { /* Marathi */ },
  te: { /* Telugu */ },
  gu: { /* Gujarati */ },
};
```

**To add a new language:** Add a new key (e.g. `ta`) with all the same keys as `en`. Then add it to `locales.json` under `supportedLanguages`.

### `locales.json`

```json
{
  "supportedLanguages": {
    "en": "English",
    "hi": "हिंदी",
    "mr": "मराठी",
    "te": "తెలుగు",
    "gu": "ગુજરાતી"
  },
  "defaultLanguage": "en"
}
```

---

## Feedback System

After Submit, two elements appear in `#feedback-overlay`:

| Outcome | Toast text source | GIF | Delay before next action |
|---|---|---|---|
| Correct | `I18n.t('bodmasRule_' + q.id)` or `q.bodmasRule` | `correct.gif` | 2500 ms → advance to next Q |
| Wrong | `I18n.t('bodmasHint_' + q.id)` or `q.hint` | `incorrect.gif` | 2000 ms → stay on same Q |

Confetti fires only on the **last correct answer** and only in landscape mode.

---

## Internationalization API (`js/i18n.js`)

```javascript
I18n.t('keyName')                         // Get translated string
I18n.t('keyName', { current: 1, total: 6 }) // With substitutions
I18n.tRandom('feedbackCorrectRandom')     // Pick random from array key
I18n.getLang()                            // Returns 'en', 'hi', etc.
I18n.setLang('hi')                        // Switch language + re-render
I18n.getSupportedLanguages()              // Returns { en: 'English', ... }
```

When `setLang()` is called, `applyStaticTranslations()` re-renders all static strings and the current screen re-renders. The explore sequence restarts if it was active.

---

## Audio System (`js/audio.js`)

All sounds are preloaded on page load as `Audio` objects. A capture-phase listener on `document` plays `button-click.wav` on every button click automatically — you do not need to wire click sounds manually.

```javascript
// Available sounds (internal to audio.js):
_sounds.click      → button-click.wav    (auto-plays on all buttons)
_sounds.correct    → correct-answer.mp3  (called by app.js on correct answer)
_sounds.incorrect  → incorrect-answer.mp3 (called by app.js on wrong answer)
_sounds.jump       → jump.mp3            (preloaded, ready to use)
_sounds.trash      → sound_trash.mp3     (preloaded, ready to use)

// Public API:
AudioManager.playCorrect()
AudioManager.playIncorrect()
AudioManager.playComplete()   // Synthesized 4-note tone
AudioManager.setMuted(bool)
```

---

## Responsive Design Summary

The board is a `position: fixed` card centered horizontally:

```css
#board {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 1350px;  /* expands to 1500px at 1080px+ viewport */
}
```

All font sizes use `clamp()` — they scale smoothly between viewport widths without media-query jumps.

| Breakpoint | File | What changes |
|---|---|---|
| `min-width: 768px` | `responsive.css` | Larger header/footer padding |
| `min-width: 1080px` | `responsive.css` | Board max-width → 1500px |
| `max-height: 520px` | `responsive.css` | Header/footer shrink, reduced gaps |
| `max-width: 480px` | `responsive.css` | Narrower board, tighter spacing |
| Portrait ≤ 1024px wide | `style.css` | `#rotate-overlay` visible |

---

## Creating a New Game — Step-by-Step

1. **Duplicate this folder** and rename it for your topic.

2. **Edit `js/activities.js`**
   - Replace `exploreSteps[]` with walkthrough steps for your topic.
   - Replace `practiceQuestions[]` with your questions (keep `id`, `expression`, `options` × 4, `correctIndex`, `hint`, `bodmasRule`).

3. **Edit `js/bodmas-locales.js`**
   - Replace all topic-specific strings (`appTitle`, `exploreTitle`, per-question `bodmasRule_q*` and `bodmasHint_q*` keys) in all 5 languages.
   - Keep all structural keys (`submitBtn`, `resetBtn`, `feedbackCorrectRandom`, etc.) — they are used by the engine.

4. **Swap assets**
   - Replace `correct.gif` / `incorrect.gif` with your character art.
   - Replace `loader.gif` with your loading animation.
   - Replace decorative SVGs in `assets/icons/` as needed.
   - Keep font files and sound files unless you deliberately change them.

5. **Adjust CSS variables** in `css/style.css :root` if your topic needs a different color palette.

6. **Update `locales.json`** if you change the supported language list.

7. **Test the full flow:** Loading → Explore (all steps) → Practice (all 6 Qs, correct and wrong) → Summary → Play Again. Test in both landscape and portrait on a phone.

**Do not modify** `app.js`, `state.js`, `i18n.js`, `animations.js`, `audio.js`, or `utils.js` unless you are adding new engine features — these files are the reusable template core.

---

## Common Pitfalls

| Mistake | Result | Fix |
|---|---|---|
| `correctIndex` out of range (not 0–3) | Wrong answer never registers as correct | Keep it within `options[]` array length |
| Missing i18n key for a question id | Falls back to `q.hint` / `q.bodmasRule` property silently | Match keys exactly: `bodmasRule_q1` for `id: 'q1'` |
| Adding a 7th question without updating progress dots | Dots count mismatches question count | Progress dot count reads `practiceQuestions.length` automatically — no change needed |
| Inline styles on content elements | Breaks responsive scaling | Always use CSS classes and variables |
| Loading an external font or script | Breaks offline mode | Keep all assets local |
| Reordering script tags | JS reference errors at runtime | Respect the load order documented above |

---

## Checks Before Handing Off

- [ ] All questions have exactly 4 options and a valid `correctIndex`
- [ ] All 5 language objects in `bodmas-locales.js` have the same keys
- [ ] Explore sequence plays all steps with correct timing
- [ ] Correct answer shows celebration; wrong answer shows hint
- [ ] Progress dots advance correctly through all questions
- [ ] Summary shows accurate star rating and percentage
- [ ] Play Again resets cleanly
- [ ] Language switch mid-game works in all 5 languages
- [ ] Portrait blocking overlay appears on phone in portrait
- [ ] Audio plays on button click, correct, and wrong answer
- [ ] No console errors in Chrome DevTools
- [ ] Tested on: laptop (1920 px), tablet (768 px), phone landscape (667 px)
