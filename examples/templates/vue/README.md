# Vue Template

Use this template to mount Sketchflow-generated Vue Single File Components inside a Vite app.

## Setup

```bash
pnpm create vite my-vue-app --template vue-ts
cd my-vue-app
```

## Integrate Generated Files

1. Copy `GeneratedScreen.vue` from your Sketchflow output into `src/components/GeneratedScreen.vue`.
2. Update `src/App.vue`:

```vue
<script setup lang="ts">
import GeneratedScreen from "./components/GeneratedScreen.vue";
</script>

<template>
  <GeneratedScreen />
</template>
```

3. Start the dev server:

```bash
pnpm install
pnpm dev
```
