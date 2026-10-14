---
version: 1
name: Eidolon-site
description: "A futuristic storybook for a Claude Code skill. Day is parchment under a pale sky, with gilt initials and a violet mirror light. Night is deep forest indigo, lit by moonlight and candle gold. Fraunces carries the tale, Instrument Sans carries the interface, IBM Plex Mono carries every command. Inline SVG line art only, drawn in currentColor, so the illustrations change scheme with the page."

fonts:
  display: Fraunces
  text: Instrument Sans
  mono: IBM Plex Mono

colors:
  day:
    bg: "#F5EEDC"        # parchment, the page floor
    surface: "#FCF8EE"   # vellum, cards and tables
    sky: "#DCE6EE"       # top of the hero sky
    text: "#1E1A36"      # ink
    muted: "#544D66"     # secondary text
    link: "#4A36B0"      # mirror violet, links and the accent
    label: "#7E5410"     # gilt for small labels and kickers
    gold: "#A06D14"      # gilt for large display type and initials
    mirror: "#1F6F86"    # mirror cyan for icons and inline code
    glow: "#F2B65A"      # candle glow, decoration only
    line: "#D9CDB0"      # hairline
    glass: "rgb(252 248 238 / 0.72)"
    focus: "#5B3FD0"
    btn: "#231D45"
    onbtn: "#FBF4E2"
    codebg: "#211B3E"
    codetext: "#F3ECDA"
    block: "#A0262B"
    ask: "#7A5200"
    allow: "#2B6A3D"
  night:
    bg: "#0C1024"        # deep forest indigo
    surface: "#141A35"   # one step toward the reader
    sky: "#070A1A"
    text: "#ECE8F7"      # moonlight
    muted: "#ABA9C9"
    link: "#A7E1EE"      # mirror cyan
    label: "#E9C47E"     # candle gold, small
    gold: "#F1C46A"      # candle gold, large
    mirror: "#8FD8E8"
    glow: "#F5B95C"
    line: "#2A3157"
    glass: "rgb(12 16 36 / 0.66)"
    focus: "#8FE3F0"
    btn: "#F1C46A"
    onbtn: "#17122B"
    codebg: "#070A18"
    codetext: "#DDE6F5"
    block: "#FF9C92"
    ask: "#F2CD72"
    allow: "#92DDA8"

typography:
  display-xl: { family: Fraunces, size: "clamp(3rem, 1.5rem + 6.2vw, 7rem)", weight: 360, lineHeight: 0.96, tracking: "-0.03em", axes: "SOFT 100, WONK 1" }
  display-lg: { family: Fraunces, size: "clamp(2.5rem, 1.6rem + 3.8vw, 4.75rem)", weight: 380, lineHeight: 1.0, tracking: "-0.025em" }
  display-md: { family: Fraunces, size: "clamp(2rem, 1.45rem + 2.3vw, 3.25rem)", weight: 400, lineHeight: 1.05, tracking: "-0.02em" }
  display-sm: { family: Fraunces, size: "clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)", weight: 450, lineHeight: 1.2, tracking: "-0.01em" }
  dek: { family: Fraunces, style: italic, size: "clamp(1.125rem, 1rem + 0.6vw, 1.5rem)", weight: 350, lineHeight: 1.4 }
  body: { family: Instrument Sans, size: "clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)", weight: 400, lineHeight: 1.65 }
  small: { family: Instrument Sans, size: "0.875rem", weight: 400, lineHeight: 1.5 }
  label: { family: Instrument Sans, size: "0.75rem", weight: 600, lineHeight: 1.3, tracking: "0.14em", case: upper }
  code: { family: IBM Plex Mono, size: "0.9em", weight: 400, lineHeight: 1.6 }

spacing: { 2xs: 4px, xs: 8px, sm: 16px, md: 24px, lg: 32px, xl: 48px, 2xl: 64px, 3xl: 96px, 4xl: 128px }
rounded: { sm: 6px, md: 12px, lg: 20px, arch: "999px 999px 20px 20px", pill: 999px }
motion: { quick: 160ms, base: 280ms, shine: 700ms, breathe: 6s, flicker: 3.2s, aurora: 48s, orrery: 120s }
---

# Eidolon site design

## Overview

The site tells a technical product as a tale. A reader arrives at a splash page that looks like the frontispiece of an illustrated book. A lantern hangs over a forest whose trunks are circuit traces, a dashed path winds to a gate, and a crescent moon sits over the trees. The headline is set large in Fraunces with its soft, slightly wonky italic. Below the fold, the product is told in chapters, each opened by an illuminated initial and a small line drawing. The mood is the moment in a fairy tale when the ordinary city and the enchanted kingdom share a doorway: a magic mirror, a lit lantern, a map of kingdoms, a key.

The polish is Bay Area product craft: a 12 column grid, fluid type, a sticky glass bar, stacked soft shadows, hairlines in place of heavy borders, and one accent per scheme. The storybook lives in the display type, the illustrations and the captions. The body text stays plain, short and exact, because the readers have to trust every number on these pages. Every fact also sits in plain body text, so no reader has to decode a drawing to find a number.

## Colors

Two schemes, chosen by `prefers-color-scheme`. There is no toggle. Every token is a CSS custom property on `:root`, with the night values in the dark media query. `check.mjs` reads both blocks and measures the pairs below on every run.

### Day: parchment and sky

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#F5EEDC` | Background: parchment, warm and never white |
| `--surface` | `#FCF8EE` | Surface: vellum for cards, tables and the ledger |
| `--sky` | `#DCE6EE` | Top stop of the hero sky gradient |
| `--glass` | vellum at 72 percent | Glass for the sticky bar and the proof strip |
| `--text` | `#1E1A36` | Ink: body text and headlines |
| `--muted` | `#544D66` | Muted: captions, secondary text |
| `--link` | `#4A36B0` | Accent: mirror violet for links |
| `--label` | `#7E5410` | Gilt for small kickers and labels |
| `--gold` | `#A06D14` | Gilt for large display type and initials |
| `--mirror` | `#1F6F86` | Mirror cyan for icons and inline code |
| `--glow` | `#F2B65A` | Glow: candle light, decoration only |
| `--line` | `#D9CDB0` | Border: hairlines |

### Night: forest indigo, moonlight and candle gold

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#0C1024` | Background: deep forest indigo |
| `--surface` | `#141A35` | Surface: one step toward the reader |
| `--sky` | `#070A1A` | Top stop of the hero sky gradient |
| `--glass` | indigo at 66 percent | Glass |
| `--text` | `#ECE8F7` | Ink: moonlight |
| `--muted` | `#ABA9C9` | Muted |
| `--link` | `#A7E1EE` | Accent: mirror cyan |
| `--label` | `#E9C47E` | Candle gold for small labels |
| `--gold` | `#F1C46A` | Candle gold for large type |
| `--mirror` | `#8FD8E8` | Mirror cyan for icons and inline code |
| `--glow` | `#F5B95C` | Glow |
| `--line` | `#2A3157` | Border: hairlines |

### Measured contrast

Ratios use WCAG 2 relative luminance. Text needs 4.5 to 1. Display type at 28 px and up needs 3 to 1.

| Pair | Day, on bg and surface | Night, on bg and surface |
|---|---|---|
| text | 14.44 and 15.76 | 15.65 and 14.20 |
| muted | 6.90 and 7.53 | 8.29 and 7.53 |
| link | 7.42 and 8.10 | 13.13 and 11.92 |
| label | 5.74 and 6.26 | 11.35 and 10.30 |
| gold, large type only | 3.87 and 4.22 | 11.52 and 10.45 |
| mirror | 4.94 and 5.39 | 11.80 and 10.71 |
| block, ask, allow on bg | 6.46, 5.98, 5.61 | 9.35, 12.33, 11.77 |
| onbtn on btn | 14.36 | 11.09 |
| focus on bg | 5.92 | 12.92 |

Gold in day is for large type only. Small gilt text uses `--label`. Text and muted are also measured on `--sky`, because the hero text sits on the sky gradient.

## Typography

- **Fraunces** is the storybook face: headlines, deks, kickers in italic, chapter numerals, illuminated initials and pull quotes. Use the `SOFT` axis at 100 and `WONK` at 1 for the hero and the initials, so the italic leans like a hand drawn letter. Weight stays between 340 and 460. Never bold.
- **Instrument Sans** is the interface face: body text, navigation, buttons, tables and labels. It is humanist, and narrow enough for tables at 375 px.
- **IBM Plex Mono** is for commands, paths, hashes and commit ids. A hash breaks anywhere (`overflow-wrap: anywhere`) so it never pushes the page sideways.
- Fallbacks: `Fraunces, "Iowan Old Style", Georgia, serif`, then `"Instrument Sans", "Segoe UI", system-ui, sans-serif`, then `"IBM Plex Mono", ui-monospace, Consolas, monospace`.
- Fonts come only from `fonts.googleapis.com`, in one stylesheet link per page, with a `fonts.gstatic.com` preconnect and `display=swap`. `check.mjs` reads the `fonts` list in this file and checks that every page links each family.

### Scale

The scale is fluid with `clamp()` and steps by about 1.33 at desktop. The values are in the front matter. Body text holds a 68 character measure. The hero headline holds about 12 characters per line.

### Numerals

Tables, the proof strip and the ledger use `font-variant-numeric: tabular-nums lining-nums`. Chapter numerals in Fraunces use old style figures (`onum`) for the bookish feel. Hashes and commits stay in mono.

## Layout

- **Grid.** 12 columns, 24 px gutters, content width 1200 px, reading column 68ch. The hero splits 7 and 5. Above 1024 px a chapter puts its opener in a sticky left column of 4 and the body in 8. Below that it stacks.
- **Gutters.** `clamp(16px, 4vw, 48px)` at the page edge. At 375 px that is 16 px.
- **Spacing.** An 8 px rhythm with a 4 px half step: `2xs` 4, `xs` 8, `sm` 16, `md` 24, `lg` 32, `xl` 48, `2xl` 64, `3xl` 96, `4xl` 128. Chapters sit `3xl` apart. Cards pad `lg`. List items sit `xs` apart.
- **Phone.** At 375 px there is no horizontal scroll. Tables marked `stack` turn each row into a card with labels from `data-label`. A wide table scrolls inside its own frame.

## Shapes, borders and glass

- Radii: `sm` 6 px for chips and code, `md` 12 px for cards and tables, `lg` 20 px for the ledger and the map, `arch` for door cards (a round top like a doorway), `pill` for buttons and the proof strip.
- Borders are 1 px hairlines in `--line`. On the night scheme a card adds a 1 px inner highlight on its top edge, white at 6 percent, like light on glass.
- Glass is for things that float over content: the sticky masthead and the proof strip. Glass is `--glass` with `backdrop-filter: blur(16px) saturate(140%)`. Without `backdrop-filter` support it falls back to a solid `--surface`. Never put body text on glass over a busy illustration.

## Elevation, shadow and glow

| Level | Day | Night | Use |
|---|---|---|---|
| 0 | flat | flat | Sections, hero text |
| 1 | hairline | hairline and top highlight | Tables, code, chips |
| 2 | `0 1px 1px` and `0 12px 32px -12px`, ink at 4 and 14 percent | the same, black at 50 percent | Cards, doors |
| 3 | level 2 and `0 30px 80px -30px` | level 2 and a gold glow at 18 percent | The ledger, hovered cards |

Glow is candle light. It sits behind the lantern, in the gate of the hero scene and on a hovered card at night. Glow is radial, soft and warm, and it never sits behind text.

## Motion

- Durations: `quick` 160 ms for color and focus, `base` 280 ms for lifts, `shine` 700 ms for the mirror sweep. Ease out is `cubic-bezier(.2,.7,.2,1)`. Ease in and out is `cubic-bezier(.65,0,.35,1)`.
- **Lantern breathing.** The halo scales from 0.96 to 1.04 and its opacity moves from 0.7 to 1 over 6 s, in and out, forever. The flame flickers on a 3.2 s cycle with small steps.
- **Orrery ring.** A dashed clockwork ring turns once in 120 s around the lantern.
- **Aurora drift.** Three blurred radial fields of violet, cyan and gold drift and turn over 48 s, and reverse.
- **Reveal on scroll.** Inside `@supports (animation-timeline: view())`, cards and figures rise 24 px and fade in as they enter the viewport. Outside that block nothing is hidden, so a browser without scroll timelines shows everything at rest.
- **Reduced motion.** Under `prefers-reduced-motion: reduce` every animation and transition stops, and every reveal shows at rest.

## Iconography and illustration

- Inline SVG line art only, drawn with `stroke="currentColor"`: 1.5 px on a 24 px grid for icons, 1.25 px for scenes. Every drawing follows the scheme.
- The motifs: lantern, mirror, gate, key, map, clockwork, and a forest of circuits whose trunks are traces that bend at 45 degrees and end in a via.
- Fill is allowed only for the flame and the glow, in `--glow` and `--gold`.
- No raster images, no stock art, no emoji. `check.mjs` refuses raster image references.
- A meaningful SVG has `role="img"` and a `title` or `aria-label`. A decorative SVG has `aria-hidden="true"`.

## Components

- **Masthead.** One `header.masthead`, sticky, glass. The lantern mark and wordmark at left, the dateline in mono label size, the site nav at right with `aria-current="page"` on one link. On a phone the nav takes its own row.
- **Hero, index.** Full viewport. Sky gradient from `--sky` to `--bg`, aurora behind, the scene SVG along the bottom, the lantern at right with halo and orrery. Kicker, headline, dek, two buttons, proof strip.
- **Page hero, deep pages.** About 60 percent of the viewport. Kicker, headline, dek, lead and a vignette.
- **Buttons.** Primary: `--btn` fill, `--onbtn` text, pill, 48 px tall. Quiet: transparent, hairline border, ink text. Both carry the mirror shine, a skewed band of light that sweeps across on hover and focus in 700 ms. Focus is a 2 px `--focus` outline at a 3 px offset on every interactive element.
- **Install panel.** A surface card right under the hero buttons, repeated on the release page. A segmented control (Windows, macOS and Linux, Operator door) built from three visually hidden radio inputs and their labels, so it works without script. Each segment holds one code block with the exact commands, a Copy button at its top right and a one line caption. Under the panel, one plain line says there is no npm package.
- **Copy button.** A small pill inside the code block, hidden until the page script adds `can-copy` to `<html>`. A click copies the whole block, then the label reads "Copied" for 1.5 s through `aria-live="polite"`. Without script the block is plain selectable text and the button does not render.
- **Proof strip.** A glass pill row of short facts, each with a small line icon, in tabular numerals.
- **Map of chapters.** The table of contents as a map card: numbered stops joined by a dashed path.
- **Chapter opener.** Kicker in Fraunces italic ("Chapter III"), the title at `display-md`, a 96 px vignette.
- **Illuminated initial.** The first letter of the first paragraph in a chapter: Fraunces at 3.4em, `--gold`, in a framed square with a hairline and a soft glow in its corner.
- **Feature card.** Surface, `md` radius, level 2, an icon, a title at `display-sm`, short text. It lifts 2 px on hover.
- **Door card.** Arched top, level 2, a label with the door number, then the full facts list.
- **Verdict chip.** A small pill with a 6 px dot. Block uses `--block`, ask uses `--ask`, allow uses `--allow`, always as text on the surface with a border in the same hue.
- **Table.** Hairline rows, a header row in label type, tabular numerals, a caption in Fraunces italic. A stack table becomes cards on a phone.
- **Exhibit.** A verbatim artifact (a settings group, a verdict, a log line, an agent file, a wave plan) in a code block that wraps its lines, with a label ("Exhibit A") and a one line caption above it. Never paraphrase an exhibit.
- **Code block.** `--codebg` with `--codetext`, `sm` radius, its own horizontal scroll. Inline code uses `--mirror`.
- **Pull quote.** Fraunces italic at `display-sm`, a gilt rule at left, the file caption in label type. The words stay verbatim.
- **Aside.** A margin note with a dashed hairline border, a label ("Still open" or "What this does not do") and small text.
- **Footer colophon.** One `footer.colophon` with a small lantern, the sourcing line, the fonts, the MIT License and the credits link.

## Voice

- Body text follows ASD-STE100 as `ste.mjs` measures it: short active sentences in the simple present, one topic each, plain words, at most 25 words, and no semicolons, contractions, soft modals or -ing verb forms outside technical names. Every page stays at 80 percent or more with no hard failure.
- Headlines, kickers, deks, captions and vignette titles may speak in the storybook voice: lanterns, gates, ledgers, the workshop. They never add a fact that the body does not hold.
- Pull quotes are verbatim, with their file caption.
- No names of people, except the credits link and the maker page. No en or em dashes anywhere.
- No superlatives and no sales words. Every number on the front page carries a link or a command that checks it.

## Do

- Keep every number, hash, command and link exact, and in mono where it is code.
- Let one accent lead per scheme: violet by day, cyan by night, with gilt for type.
- Draw every illustration in `currentColor` and look at it in both schemes.
- Keep the hero text off the busiest part of the scene.
- Show the honest limits next to the claims, as asides and the known gaps.
- Keep the one first-party script for the copy buttons under 25 lines, inline, identical on every page that has it, and free of network, storage and dynamic code. `check.mjs` enforces this.

## Do not

- Add an external script, a tracker, a second script, raster images or a theme toggle.
- Use bold display type, shadows on text, or glow behind text.
- Hide content until an animation runs.
- Shorten a pull quote, or move a fact into a caption only.
- Use the gold token for small text in day.
