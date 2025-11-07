# React Template

Use this template to wire generated Sketchflow components into a Vite-powered React app.

## Setup

```bash
pnpm create vite my-react-app --template react-ts
cd my-react-app
```

## Integrate Generated Files

1. Copy the generated files from `output/GeneratedScreen.tsx` into `src/components/GeneratedScreen.tsx`.
2. Update `src/App.tsx`:

```tsx
import { GeneratedScreen } from "./components/GeneratedScreen";
	export default function App() {
  return <GeneratedScreen />;
}
```

3. Run the app:

```bash
pnpm install
pnpm dev
```
