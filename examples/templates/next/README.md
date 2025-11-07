# Next.js Template

Plug Sketchflow-generated components into a modern Next.js (App Router) project.

## Setup

```bash
pnpm create next-app@latest my-next-app --typescript --eslint --app
cd my-next-app
```

## Integrate Generated Files

1. Copy `GeneratedScreen.tsx` into `app/components/GeneratedScreen.tsx`.
2. Update `app/page.tsx` to render the generated component:

```tsx
import { GeneratedScreen } from "./components/GeneratedScreen";

export default function Page() {
  return <GeneratedScreen />;
}
```

3. Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```
