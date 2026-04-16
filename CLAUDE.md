# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PROJECT:SCORE is a static web-based self-diagnostic checklist for IT project ideas. It uses a **chessboard dual-track** concept: **♔ White** evaluates idea quality (value, originality, depth) and **♚ Black** evaluates execution readiness (planning, deliverables, validation). Each track has its own tab, scoring (0-10), and decision. 14 questions, 5 gates, and 6 flags. Korean-first UI, dark monochrome design.

## Architecture

**Zero-dependency static site** — no build step, no bundler, no package manager. Pure HTML/CSS/JS served directly.

| File | Role |
|------|------|
| `index.html` | Markup: header, hero, mode selector, tab bar (♔/♚), two tab panels (each with score card + questions), shared flags, footer, FAB |
| `app.js` | Core logic: state management, dual scoring (`compute()`), tab switching (`setTab()`), UI rendering (`updateUI()`), event binding (`bind()`) |
| `questions.md` | Source of truth: human-editable structured Markdown for all modes, types, axes, questions, gates, flags, decisions |
| `build.js` | MD→JS parser: reads `questions.md`, validates & sanitizes, outputs `questions.js`. Run via `node build.js` |
| `questions.js` | **Auto-generated** data module — do not edit directly. Contains MODES, TYPES, AXES, QUESTIONS, GATES, FLAGS, DECISIONS |
| `styles.css` | Chessboard design system: dark default + inverted white panel, tab bar, 8px grid, responsive breakpoints |
| `vercel.json` | Deployment config: build command (`node build.js`), CSP headers, security headers |

### Dual-Track Tab Structure

Two independent tabs, each with its own score card and decision:
- **♔ White tab** (`.tab-panel--white`): inverted white bg, 7 questions — V1-V3 (Value), O1-O2 (Originality), X1-X2 (Depth)
- **♚ Black tab** (`.tab-panel--black`): dark bg, 5 gates + 7 questions — S1-S3 (Planning), D1-D2 (Deliverables), E1-E2 (Validation)

Flags are shared below both tabs. Each flag has a `tone` field indicating which track it affects.

### State Flow

All user interactions → `set*()`/`toggle*()` → mutate `state` → `updateUI()` → `compute()` → re-render both score panels + tab bar badges. State is a single global object (mode, types, answers, gates, flags). `activeTab` is UI-only state, not persisted.

### Scoring Formulas

```
♔ White: whiteScore = (whiteRaw / whiteMaxWeight) × 10        // 0-10
♚ Black: blackScore = max(0, (blackRaw/blackMax)×8 + gateScore - penalties)  // 0-10
         gateScore  = (passedGates / 5) × 2                   // 0-2
```

Each track has its own decision based on mode-dependent thresholds (`whiteThresholds` / `blackThresholds`). White reject flags (R1) → white RETHINK. Black reject flags (R2/R3) → black RETHINK. Failed gates → black REVISE. Penalties (P1-P3) reduce black score only.

## Build Pipeline

`questions.md` is the single source of truth for all question data. The build step parses it into `questions.js`:

```bash
node build.js          # questions.md → questions.js
```

**Security in build.js**: HTML/XSS sanitization (`sanitize()`), strict ID validation (`validateId()`), numeric validation (`toNum()`), cross-reference checks (axes, flags), whitelist enforcement for tone/kind values. Build fails on any validation error.

**Local development**: open `index.html` in a browser or use any static server (`python3 -m http.server 8000`). Run `node build.js` after editing `questions.md`.

**No tests, no linter.** Manual testing only — verify all 3 modes, 5 types, both tabs' scoring, gates, flags, exports, and responsive breakpoints (860px/520px/360px).

**Deployment:** Vercel static hosting. `vercel.json` sets `buildCommand: "node build.js"` — pushing `questions.md` changes to git triggers Vercel rebuild automatically. CSP headers restrict script/style/font sources.

## Design System (Chessboard v3.0)

- **Monochrome palette**: 8-shade dark scale (`--bg-0` #0a0a0b through `--fg-0` #fafafa)
- **White panel**: inverted — white bg with `rgba(0,0,0,*)` for text/borders/accents
- **Tab bar**: white tab active = white bg; black tab active = dark bg with white accent line
- **Spacing**: strict 8px grid via `--sp-*` custom properties
- **Typography**: IBM Plex Mono (display/monospace), Pretendard Variable (body)
- **Selected state**: inverted bg/fg (context-dependent: white→dark in white panel, dark→white in black panel)
- **Responsive**: 3 breakpoints at 860px, 520px, 360px
- All colors via CSS vars — no hardcoded hex outside `:root`

## Conventions

- **CSS**: BEM-light naming (`.question__title`, `.tab-panel--white`, `.panel-section__head`)
- **JS**: `set*()` for mutations, `toggle*()` for booleans, `renderQuestionHTML()` shared renderer for both tones
- **HTML**: `data-*` attributes for element identification (`data-qid`, `data-gid`, `data-fid`, `data-val`, `data-tab`)
- **Korean text**: use `word-break: keep-all`
- **localStorage key**: `'project-score-v3.0'` — state cleared on each page load (fresh start by design)

## Modification Guide

- **Adding questions**: add a `### QID` block under `## 질문` in `questions.md`. Use `- axis:`, `- weight:`, `- title:`, `- hint:`, `#### 선택지` table. Axis determines tone (V/O/X = white, S/D/E = black). For type-sensitive wording: add `#### 타입별 제목` / `#### 타입별 힌트`. Then run `node build.js`.
- **Changing thresholds**: edit `- whiteThresholds:` or `- blackThresholds:` under the mode in `## 모드` section of `questions.md`
- **Adding flags**: add a `### FID` block under `## 플래그` with `- kind:`, `- tone:`, `- title:`, `- desc:`, `- penalty:`. Then run `node build.js`.
- **Never edit `questions.js` directly** — it will be overwritten on next build.
- **Styling white panel**: override `.tab-panel--white .your-class` using `rgba(0,0,0,*)` values — never use `var(--fg-*)` vars inside the inverted panel as they reference the wrong palette.
- **Score cards**: each tab has its own score card. White axes render into `#whiteAxisBars`, black axes into `#blackAxisBars`. Gate summary in `#gateScoreVal` (black panel only).
