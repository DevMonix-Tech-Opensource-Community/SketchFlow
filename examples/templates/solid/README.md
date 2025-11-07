# Solid Template

Integrate Sketchflow-generated Solid components into a Vite-based Solid project.

## Setup

```bash
pnpm create vite my-solid-app --template solid-ts
cd my-solid-app
```

## Integrate Generated Files

1. Copy `GeneratedScreen.tsx` into `src/components/GeneratedScreen.tsx`.
2. Update `src/App.tsx`:

```tsx
import { Component } from "solid-js";
import { GeneratedScreen } from "./components/GeneratedScreen";

const App: Component = () => {
  return <GeneratedScreen />;
};

export default App;
```

3. Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```
