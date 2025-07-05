# React Code Generation Rules for AI Assistant

## Core Principles

* Keep components small and purpose-driven—single responsibility only.
* Favour composition over configuration; props decide behaviour, not massive prop-driven config objects.
* Prioritise readability; premature optimisation is a bug.

## Directory & File Structure

* `src/pages/*` — page‑level route components; async‑loaded with `React.lazy`.
* `src/components/*` — shared presentational primitives.
* One advanced feature/component ➜ one folder:

```
MyWidget/
  MyWidget.tsx           // public entry
  components/            // internal UI pieces
  hooks/                 // ≤5 related hooks per file; split beyond that
  utils/                 // one purpose per file (mappers, converters, etc.)
  index.ts               // re‑export public API
```

## Component Decomposition Rules

* Split a component when **any** of these is true:

  1. JSX > 40 logical lines.
  2. More than 5 props.
  3. Multiple mutually exclusive render branches (`if/else`, `switch`).
  4. Contains state unrelated to primary purpose.
* Move each branch into a sub‑component named after intent (`EmptyState`, `LoadingState`, etc.).
* Push data‑transform or side‑effect logic into custom hooks or utility functions.

## Hooks

* Prefix every hook with `use`.
* One hook per file unless tightly coupled helpers (≤5 small hooks) make sense.
* Separate concerns: data‑fetch, UI state, and DOM interactions live in distinct hooks.

## Utils

* Pure, stateless functions only—no React imports.
* Co‑locate with the component that owns them; promote to `src/utils` only when reused by three or more features.

## TODO Discipline

* Any placeholder link, unfinished task, or future assumption **must** add a line to `TODO.md`:

  ```
  [MyWidget] Hook up to /settings route once implemented.
  ```
* AI assistant must scan `TODO.md` after every response; resolve, update, or escalate lingering items.

## AI Assistant Output Guidelines

* Emit TypeScript (`.tsx`) by default.
* No default exports—use named exports exclusively.
* Output files in this order: path comment (`// src/...`), then fenced code block.
* Keep each code block under \~120 lines; split into more files otherwise.
* Extract magic strings and numbers into constants.

## Testing and checking

* Fix TS and eslint errors
* Run i18n key checking with `npm run check-i18n:fix` to ensure translation hygiene

## Styling

* Use Tailwind; wrapper classNames live in component file.
* Avoid inline styles except truly dynamic cases.

## Naming

* `PascalCase` for components.
* `camelCase` for variables & functions & folders.
* `UPPER_SNAKE_CASE` for constants and enum‑style maps.
* All pages should be named with Page postfix eg. DashboardPage, LoginPage, SignupPage, etc.
* DO NOT CREATE INDEX FILES AND DO NOT IMPORT FROM THEM

## Performance

* Memoise components that render identically for the same props.
* Split bundles when a page or feature chunk exceeds \~30 kB gzipped.
* Use `Suspense` + `lazy` for pages and heavy sub‑trees.
