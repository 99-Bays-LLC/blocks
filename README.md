# Steal My Slop Blocks

Free website sections for [shadcn/ui](https://ui.shadcn.com) projects, with real, specific copy
instead of lorem ipsum. One file each, no dependencies, and they use your theme's colors.

**Live previews (phone and desktop, light and dark): [blocks.stealmyslop.com](https://blocks.stealmyslop.com)**

| Block | What it is |
| --- | --- |
| `hero-plain` | Left-aligned hero with a label, a specific headline, two buttons and three short proof points. |
| `hero-split` | Headline and one button on the left, a small product picture on the right drawn with plain elements. |
| `hero-signup` | Centred headline with one highlighted phrase and an accessible email form. |
| `burst-depth` | Hero over a calm 3D burst of light that turns towards the pointer. Theme colors, tap to pulse. |
| `burst-drift` | Hero over a 3D burst that drifts on its own; rays bend away from the pointer. |
| `burst-flare` | Hero over a burst turned inside out: dots near the centre, tails streaking outwards. |
| `burst-part` | Hero over light streaks that step aside and stretch as the pointer passes. |
| `burst-fan` | Hero over a flat fan of light with a few dashed, moving rays. |

## Install

You need a React + Tailwind CSS 4 project set up with shadcn/ui (`npx shadcn@latest init`, which installs Tailwind 4). The blocks use Tailwind 4 class names. Then pick one:

```bash
# From the website
npx shadcn@latest add https://blocks.stealmyslop.com/r/hero-plain.json

# Straight from this repository
npx shadcn@latest add 99-Bays-LLC/blocks/hero-plain
```

Or add the registry to `components.json` once and install by short name:

```json
"registries": {
  "@stealmyslop": "https://blocks.stealmyslop.com/r/{name}.json"
}
```

```bash
npx shadcn@latest add @stealmyslop/hero-plain
```

The file lands in your components folder. Import it on a page and edit the words in `copy` at the
top of the file.

## Colors

Blocks only use shadcn/ui's color names: `background`, `foreground`, `primary`,
`primary-foreground`, `muted`, `muted-foreground` and `border`. Change your theme and every block
follows.

## About this repository

This repository is published automatically from the Steal My Slop website, so pull requests here
would be overwritten. Found a bug or want a block? [Open an issue](https://github.com/99-Bays-LLC/blocks/issues).

## License

[MIT](./LICENSE). Copyright (c) 2026 99 Bays LLC. Use, change, share and sell the blocks in any
project; keep the MIT notice in each file.
