# Preact Template

Mount Sketchflow-generated Preact components inside a Vite Preact project.

## Setup

```bash
pnpm create vite my-preact-app --template preact-ts
cd my-preact-app
```

## Integrate Generated Files

1. Copy `GeneratedScreen.tsx` into `src/components/GeneratedScreen.tsx`.
2. Update `src/app.tsx` (or any entry component):

```tsx
import { FunctionalComponent } from "preact";
import { GeneratedScreen } from "./components/GeneratedScreen";

const App: FunctionalComponent = () => <GeneratedScreen />;

export default App;
```

3. Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```
