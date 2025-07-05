# Rust Backend Contribution Rules for AI Assistant

## Core Philosophy

* Prioritise correctness, clarity, and maintainability over micro-optimisation.
* Use Rust idioms consistently; avoid trying to "write JavaScript in Rust".
* Compose small, focused modules and services.

## Project Structure

* Top-level folders:

```
src/
  main.rs             // binary entry point
  lib.rs              // core logic entry point (used for tests, binaries)
  api/                // HTTP layer (handlers, routes)
  domain/             // core business logic (pure)
  infrastructure/     // DB, cache, external services
  config/             // config loading and schema
  utils/              // helpers (pure logic only)
tests/                // integration tests
migrations/           // DB migrations
```

## Module Guidelines

* `api`: expose only types and logic directly tied to request/response cycle.

  * Handlers should be thin: parse input ➜ call domain ➜ return output.
* `domain`: contains business rules, entities, services.

  * No HTTP, DB, or logging dependencies here.
* `infrastructure`: bridge external systems (Postgres, Redis, external APIs).

  * Use traits defined in `domain` to allow mocking.

## Naming Conventions

* `snake_case` for functions, files, modules.
* `CamelCase` for types, structs, enums.
* `SCREAMING_SNAKE_CASE` for constants.

## Error Handling

* Define a custom `Error` enum per layer (`api::Error`, `domain::Error`, etc.).
* Use `thiserror::Error` or `anyhow` where appropriate.
* Always propagate errors with `?` unless there's a clear reason to handle them explicitly.

## Testing

* Every module gets its own `mod tests` block.
* Integration tests live in `tests/` and call binaries or public interfaces.
* Use `assert_eq!` and detailed error messages.
* Mock infrastructure via traits and test adapters.

## Dependency Management

* Use `cargo add` to track new dependencies.
* Prefer audited crates. Justify unknown ones in PR description.
* Group dependencies in `Cargo.toml`: std, async, DB, web, utils.

## Async Code

* Use `tokio` or `async-std`—but never mix them.
* `await` only at IO boundaries.
* Avoid spawning untracked tasks (`tokio::spawn`) unless necessary.

## Logging & Observability

* Use `tracing` crate; instrument all public API handlers and async services.
* No `println!` in production code.
* Emit structured logs; avoid interpolated strings.

## Security Practices

* Validate all inputs at API boundary.
* Sanitize logs (no secrets, no raw requests).
* Use `dotenv` or secrets managers—never commit credentials.

## TODO Discipline

* Use inline `// TODO: reason` comments only with actionable follow-up.
* Mirror all TODOs in `TODO.md` at the repo root with a short context.
* AI assistant must scan `TODO.md` after each code response.

## AI Assistant Output Rules

* Output full `.rs` files with `// src/...` comments.
* Use idiomatic Rust only—no pseudo-code or TypeScript-style shorthands.
* Keep modules <300 LOC; break up longer ones.
* Include full tests and mock infrastructure when applicable.
* Prefer `fn main()` -> `Result<(), Box<dyn Error>>` signature for binaries.

## Code Review Checklist

* [ ] Does this follow module structure?
* [ ] Are all public types documented?
* [ ] Are fallible functions properly handled?
* [ ] Are all TODOs in code reflected in `TODO.md`?
* [ ] Is logging structured and complete?
* [ ] Are tests meaningful, covering happy and edge paths?
