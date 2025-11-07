# Three.js Template

Integrate Sketchflow-generated Three.js scenes into a TypeScript project powered by Vite.

## Setup

```bash
pnpm create vite my-three-app --template vanilla-ts
cd my-three-app
```

Install Three:

```bash
pnpm add three
```

## Integrate Generated Files

1. Copy the generated `CustomScene.ts` (or similar) into `src/CustomScene.ts`.
2. Update `src/main.ts` to bootstrap Three.js:

```ts
import "./style.css";
import { initScene } from "./CustomScene";

const canvas = document.createElement("canvas");
canvas.id = "sketchflow-canvas";
document.body.appendChild(canvas);

initScene({ canvasId: "sketchflow-canvas" });
```

3. Run the dev server:

```bash
pnpm install
pnpm dev
```
