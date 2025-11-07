# Angular Template

Wire Sketchflow-generated Angular component trio into a standard Angular workspace.

## Setup

```bash
pnpm dlx @angular/cli new my-angular-app --style=scss --routing=false
cd my-angular-app
```

## Integrate Generated Files

1. Copy the generated files (`generated-screen.ts`, `generated-screen.html`, `generated-screen.css`) into `src/app/generated/`.
2. Export the component in `src/app/generated/generate-screen.ts` if needed:

```ts
export { GeneratedScreenComponent } from "./generated-screen";
```

3. Declare and render the component by updating `src/app/app.module.ts` and `src/app/app.component.html`:

```ts
// app.module.ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { GeneratedScreenComponent } from "./generated/generated-screen";

@NgModule({
  declarations: [AppComponent, GeneratedScreenComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<app-generated-screen></app-generated-screen>
```

4. Install dependencies and serve:

```bash
pnpm install
pnpm start
```
