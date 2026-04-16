# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PROJECT:SCORE is a static web-based self-diagnostic checklist for IT project ideas. It uses a **chessboard dual-tone** concept: **♔ White** evaluates idea quality (value, originality, depth) and **♚ Black** evaluates execution readiness (planning, deliverables, validation). 14 questions, 5 gates, and 6 flags produce a 0-10 score. Korean-first UI, dark monochrome design.

## Architecture

**Zero-dependency static site** — no build step, no bundler, no package manager. Pure HTML/CSS/JS served directly.

| File | Role |
|------|------|
| `index.html` | Markup: header, hero, 5 sections (modes, gates, white questions, black questions, flags), score card, footer, FAB |
| `app.js` | Core logic: state management, scoring (`compute()`), UI rendering (`updateUI()`), event binding (`bind()`) |
| `questions.js` | Data-only module: MODES, TYPES, AXES (with `tone: 'white'|'black'`), QUESTIONS, GATES, FLAGS, DECISIONS |
| `styles.css` | Chessboard design system: dark default + inverted white section, 8px grid, responsive breakpoints |

### Dual-Tone Structure

Questions are split by axis tone (`AXES[q.axis].tone`):
- **♔ White (7 questions)**: V1-V3 (Value), O1-O2 (Originality), X1-X2 (Depth) — "Is this idea worth pursuing?"
- **♚ Black (7 questions)**: S1-S3 (Planning), D1-D2 (Deliverables), E1-E2 (Validation) — "Are you ready to execute?"

The White section (`.section--white`) uses inverted colors (white bg, dark text) — a literal chessboard effect.

### State Flow

All user interactions → `set*()`/`toggle*()` → mutate `state` → `updateUI()` → `compute()` → re-render score card. State is a single global object (mode, types, answers, gates, flags).

### Scoring Formula

```
whiteScore = (whiteRaw / whiteMaxWeight) × 4   // 0-4
blackScore = (blackRaw / blackMaxWeight) × 4   // 0-4
gateScore  = (passedGates / 5) × 2             // 0-2
total      = max(0, white + black + gate - penalties)  // 0-10
```

Hard reject flags → immediate "RETHINK". Failed gates → "REVISE". Score thresholds are mode-dependent (learn/build/showcase).

## Development

**No build commands.** Open `index.html` in a browser or use any static server:
```bash
python3 -m http.server 8000
```

**No tests, no linter.** Manual testing only — verify all 3 modes, 5 types, scoring, gates, flags, exports, and responsive breakpoints (860px/520px/360px).

**Deployment:** Vercel static hosting. Framework preset: Other, no build command, root output directory.

## Design System (Chessboard v2.0)

- **Monochrome palette**: 8-shade dark scale (`--bg-0` #0a0a0b through `--fg-0` #fafafa)
- **White section**: inverted — white bg with `rgba(0,0,0,*)` for text/borders/accents; selected options invert to dark bg
- **Spacing**: strict 8px grid via `--sp-*` custom properties
- **Typography**: IBM Plex Mono (display/monospace), Pretendard Variable (body)
- **Selected state**: inverted bg/fg (context-dependent: white→dark in white section, dark→white in black section)
- **Responsive**: 3 breakpoints at 860px, 520px, 360px
- All colors via CSS vars — no hardcoded hex outside `:root`

## Conventions

- **CSS**: BEM-light naming (`.question__title`, `.tone-score--white`)
- **JS**: `set*()` for mutations, `toggle*()` for booleans, `renderQuestionHTML()` shared renderer for both tones
- **HTML**: `data-*` attributes for element identification (`data-qid`, `data-gid`, `data-fid`, `data-val`)
- **Korean text**: use `word-break: keep-all`
- **localStorage key**: `'project-score-v2.0'` — state cleared on each page load (fresh start by design)

## Modification Guide

- **Adding questions**: add to `QUESTIONS` array in `questions.js` with `id`, `axis`, `weight`, `title`, `hint`, `options`. Axis determines tone (V/O/X = white, S/D/E = black). For type-sensitive wording: add `titleByType`/`hintByType`.
- **Changing thresholds**: edit `MODES[mode].thresholds` in `questions.js`
- **Adding flags**: add to `FLAGS` array with `id`, `kind` ('reject'|'penalty'), `title`, `desc`, and `penalty` value if applicable. Note: 'P' prefix flags (P1-P3) are penalties — don't create axis code 'P' to avoid ID conflicts.
- **Styling white section**: override `.section--white .your-class` using `rgba(0,0,0,*)` values — never use `var(--fg-*)` vars inside the inverted section as they reference the wrong palette.
- **Score card**: tone scores render into `#whiteAxisBars`/`#blackAxisBars`. Gate summary in `#gateScoreVal`.
