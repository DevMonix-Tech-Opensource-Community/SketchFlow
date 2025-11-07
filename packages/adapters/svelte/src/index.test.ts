import { describe, expect, it } from "vitest";
import { AdapterContext, SketchDocument, SketchNode } from "@sketchflow/core";
import { svelteAdapter } from "./index.js";

const makeNode = (overrides: Partial<SketchNode> = {}): SketchNode => ({
  id: overrides.id ?? "node",
  type: overrides.type ?? "frame",
  name: overrides.name,
  props: overrides.props,
  layout: {
    x: overrides.layout?.x ?? 0,
    y: overrides.layout?.y ?? 0,
    width: overrides.layout?.width ?? 100,
    height: overrides.layout?.height ?? 100,
    rotation: overrides.layout?.rotation
  },
  children: overrides.children ?? []
});

const document: SketchDocument = {
  id: "doc-svelte",
  name: "Svelte Sample",
  nodes: []
};

const sampleNodes: SketchNode[] = [
  makeNode({
    id: "root",
    children: [
      makeNode({
        id: "text-1",
        type: "text",
        props: { text: "Hello Svelte" },
        layout: { x: 10, y: 12, width: 120, height: 24 }
      }),
      makeNode({
        id: "image-1",
        type: "image",
        props: { src: "hero.png", alt: "Hero" },
        layout: { x: 32, y: 56, width: 160, height: 160 }
      })
    ],
    layout: { x: 0, y: 0, width: 320, height: 400 }
  })
];

const context: AdapterContext = {
  document,
  layout: sampleNodes
};

describe("svelteAdapter", () => {
  it("produces a Svelte component", () => {
    const result = svelteAdapter.generate(context);
    expect(result.files).toHaveLength(1);
    const file = result.files[0];
    expect(file.path).toBe("GeneratedScreen.svelte");
    expect(file.contents).toContain("<script lang=\"ts\">");
    expect(file.contents).toContain("Hello Svelte");
    expect(file.contents).toContain("hero.png");
  });

  it("reports metadata", () => {
    const meta = svelteAdapter.introspect(context);
    expect(meta).toEqual({ nodeCount: 1, components: 0 });
  });
});
