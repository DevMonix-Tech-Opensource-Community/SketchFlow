# Sketchflow

Sketchflow is a draw-to-frontend framework that turns UI sketches into production-grade code across modern web stacks such as React, Next.js, Vue, Svelte, Angular, Three.js, Solid, and Preact.

## Vision

1. Designers and developers sketch UI flows on paper, whiteboards, or design tools.
2. Sketchflow ingests the sketch, understands layout semantics, and transforms it into a normalized sketch document.
3. Pluggable layout engines translate raw geometry into layout primitives.
4. Framework adapters emit idiomatic components, routing, and styling for the target technology stack.

## Packages

- `@sketchflow/core` – shared schemas, plugin registry, and validation utilities.
- `@sketchflow/sketch` – ingest free-form sketches (JSON, vector streams, etc.) and normalize into Sketchflow documents.
- `@sketchflow/layout` – layout engine helpers and a default passthrough engine.
- `@sketchflow/codegen` – orchestrates parsing, layout, and code generation across registered frameworks.
- `packages/adapters/*` – framework adapters for React, Next.js, Vue, Svelte, Angular, Three.js, Solid, and Preact.
- `@sketchflow/cli` – CLI surface for listing layouts and generating framework-specific projects.

## Getting Started

```bash
pnpm install
pnpm build
```

### Quick experiment

```bash
pnpm --filter @sketchflow/cli exec sketchflow list-layouts

# generate code with optional layout config and adapter overrides
pnpm --filter @sketchflow/cli exec sketchflow generate \
  --input ./packages/cli/examples/sample-document.json \
  --framework react \
  --layout-config ./layouts/passthrough.json \
  --adapter-option componentName=LandingScreen \
  --out ./output/react \
  --save-summary ./output/react/summary.json
```

The CLI prints a concise summary of generated files and can export metadata for tooling via `--save-summary`. Layout engines can be configured inline with `--layout` or through a JSON descriptor passed to `--layout-config`.

To call the codegen APIs directly:

```ts
import { generateFrontend } from "@sketchflow/codegen";
import { registerReactAdapter } from "@sketchflow/adapter-react";

registerReactAdapter();

const result = await generateFrontend({
  source: {
    kind: "document",
    payload: {
      id: "doc-1",
      name: "Generated",
      nodes: []
    }
  },
  framework: "react",
  options: {
    layout: { engine: "passthrough" }
  }
});

console.log(result.metadata, result.files);
```

### Templates

Starter integration guides live under `examples/templates/<framework>`. Use these to wire Sketchflow output into your preferred stack:

- [React](examples/templates/react/README.md)
- [Next.js](examples/templates/next/README.md)
- [Vue](examples/templates/vue/README.md)
- [Svelte](examples/templates/svelte/README.md)
- [Angular](examples/templates/angular/README.md)
- [Solid](examples/templates/solid/README.md)
- [Preact](examples/templates/preact/README.md)
- [Three.js](examples/templates/three/README.md)

Each template directory also provides an executable [`setup.sh`](examples/templates/react/setup.sh) script that bootstraps a runnable demo using the Sketchflow CLI and the framework’s scaffolding tool. Invoke with an optional app name, e.g. `./examples/templates/react/setup.sh my-react-demo`.

Setup scripts share a common interface:

```bash
./examples/templates/<framework>/setup.sh \
  my-demo-app \
  --layout passthrough \
  --adapter-option componentName=LandingScreen
```

Flags:
- `--layout <engine>` – choose any layout engine registered with the CLI (defaults to `passthrough`).
- `--adapter-option key=value` – forward adapter-specific overrides; repeat for multiple options.

Scripts dynamically detect generated filenames (e.g. component or scene names) and update scaffolded projects automatically.

### Developer Experience

The `.vscode` folder contains curated [extension recommendations](.vscode/extensions.json) and a reusable [`sketchflow-generate` snippet](.vscode/sketchflow.code-snippets) to streamline CLI usage inside VS Code.

## Next Steps

1. Implement real parsers (paper capture, design tool importers).
2. Add smart layout engines (constraints, responsive grids, auto-spacing).
3. Provide GUI preview tooling on top of the CLI workflows.
4. Expand example templates into runnable starter apps for every framework.
5. Add CI automation, linting presets, and golden-file regression tests.
