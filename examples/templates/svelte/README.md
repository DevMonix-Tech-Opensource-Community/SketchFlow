# Svelte Template

Embed Sketchflow-generated `.svelte` components inside a Vite-powered Svelte project.

## Setup

```bash
pnpm create vite my-svelte-app --template svelte-ts
cd my-svelte-app
```

## Integrate Generated Files

1. Copy `GeneratedScreen.svelte` into `src/lib/GeneratedScreen.svelte`.
2. Update `src/routes/+page.svelte` (or any route/component):

```svelte
<script lang="ts">
  import GeneratedScreen from "$lib/GeneratedScreen.svelte";
</script>

<GeneratedScreen />
```

3. Launch the dev server:

```bash
pnpm install
pnpm dev
```
