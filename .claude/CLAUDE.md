# CLAUDE.md

Repository instructions for AI coding agents working on interactive game with math learning modules.

Use this file as the technical source of truth during coding.

---

## 0. Agent Operating Rules

1. Read this file before editing code.
2. Inspect the existing repository structure before proposing changes.
3. Follow existing project conventions, package manager, scripts, naming, and folder structure.
4. Do not introduce new frameworks, build tools, UI libraries, state libraries, analytics SDKs, or heavy dependencies unless the repository already uses them or the user explicitly approves them.
5. Make the smallest safe change that satisfies the task.
6. Do not remove telemetry, validation, accessibility, offline, or responsive behavior while fixing UI or logic issues.
7. Do not mark work complete until relevant checks have been run or clearly state which checks could not be run and why.
8. Prefer deterministic, testable code over clever code.

---

Keep the following concerns separate:

- Screen rendering
- Interaction logic
- Validation logic
- Telemetry emission
- Module configuration/data
- Asset loading
- Responsive layout

---

## 1. Screen Flow Rules

Default learning flow:

```text
intro -> prediction -> interaction/test -> feedback -> reasoning/transfer -> summary
```

Rules:

- Do not reveal the answer before required prediction steps.
- Do not allow next-screen navigation to bypass required input unless the spec defines a skip state.
- Do not lose state when moving between screens unless reset is intentional.
- Every required user action must have a clear enabled/disabled state.
- Every disabled action must have an obvious reason in UI or state.
- Retry behavior must be deterministic.
- Reset behavior must return the module to a clean initial state.

---

## 2. Interaction Implementation Rules

Use interactions that work reliably on:

- Interactive panels
- Tablets
- Low-end Android devices
- Touch input
- Mouse input
- Keyboard where applicable

Rules:

- Do not rely on hover-only interactions.
- Drag-and-drop must have a fallback or accessible alternative if the project supports one.
- Avoid fragile pixel-perfect hit detection where possible.
- Use scalable units and responsive layouts.
- Animations must not cause validation or state race conditions.
- Any animation that changes the answer state must be tied to explicit state, not visual timing alone.

---

## 3. Validator Rules

Validators must be pure or near-pure functions that are easy to test.

Rules:

- Sanitize and normalize input before validation.
- Handle empty input.
- Handle whitespace and casing where relevant.
- Handle equivalent fractions where relevant.
- Handle decimal/fraction equivalence only when allowed by the storyboard.
- Handle algebraically equivalent expressions for Template C when relevant.
- Return reason codes for common wrong-answer patterns when possible.
- Do not use unsafe `eval`.
- Do not validate by comparing rendered text from the DOM.
- Write or update tests for validator edge cases.

Minimum validator tests for math modules:

- Correct canonical answer
- Correct equivalent answer
- Incorrect answer
- Empty answer
- Extra spaces
- Different valid formatting
- Boundary value
- Retry after wrong attempt
- Multiple rapid submissions

---

## 4. Responsive and Device Rules

Required targets:

- Interactive panel
- Laptop
- Tablet
- Low-end Android

Rules:

- Avoid fixed dimensions that break on small screens.
- Avoid text overflow and clipped math expressions.
- Avoid UI elements that require precise mouse movement.
- Test portrait and landscape where supported.
- Ensure modals, popups, and feedback panels are usable on small screens.
- Keep important controls visible without excessive scrolling.

---

## 5. Offline and Asset Rules

Modules must not depend on live network access for core learning interactions.

Rules:

- Do not load images, fonts, scripts, audio, or video from external CDNs unless the existing platform explicitly requires it.
- Optimize images and SVGs.
- Avoid large unused assets.
- Avoid runtime calls that block module completion when offline.
- If a service worker or asset manifest exists, update it when assets change.

---

## 6. Performance Rules

Rules:

- Avoid unnecessary re-renders.
- Avoid long main-thread blocking tasks.
- Avoid large JSON blobs in the initial load unless required.
- Lazy-load non-critical assets if the project supports it.
- Ensure low-end Android does not lag during core interactions.

---

## 7. Accessibility and Classroom Usability Rules

Rules:

- Use semantic HTML where possible.
- Add labels for inputs.
- Ensure buttons have clear text or accessible labels.
- Do not communicate correctness only through color.
- Keep contrast readable.
- Make feedback text understandable.
- Ensure keyboard focus is not trapped.
- Respect reduced-motion settings when feasible.
- Avoid tiny tap targets.

---

## 8. Error Handling Rules

Rules:

- Invalid input should show clear feedback without crashing.
- Missing config should fail loudly during development.
- Missing optional assets should degrade gracefully if possible.
- Missing required assets should produce a clear error.
- Telemetry failures must not block the learning interaction unless the platform requires it.
- Do not swallow errors silently in validators, telemetry, or screen transitions.

---

## 9. Security and Data Rules

Rules:

- Never commit credentials, tokens, private URLs, or secrets.
- Do not log PII.
- Avoid injecting raw user input into HTML.
- Prefer textContent over innerHTML unless sanitized and necessary.
- Keep third-party code minimal and approved.

---

## 10. Final Agent Reminder

Do not optimize for producing more files or more code. Optimize for a small, correct, testable module that preserves pedagogy, validation, telemetry, responsiveness, offline behavior, and handover readiness.
