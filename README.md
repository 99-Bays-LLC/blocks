# Steal My Slop Blocks

Free website sections for [shadcn/ui](https://ui.shadcn.com) projects, with real, specific copy
instead of lorem ipsum. One file each, no dependencies, and they use your theme's colors.

**Live previews (phone and desktop, light and dark): [blocks.stealmyslop.com](https://blocks.stealmyslop.com)**

| Block | What it is |
| --- | --- |
| `hero-plain` | Left-aligned hero with a label, a specific headline, two buttons and three short proof points. |
| `hero-split` | Headline and one button on the left, a small product picture on the right drawn with plain elements. |
| `hero-signup` | Centred headline with one highlighted phrase and an accessible email form. |

## Install

You need a React + Tailwind project set up with shadcn/ui (`npx shadcn@latest init`). Then pick one:

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
project; keep the copyright notice in each file.
