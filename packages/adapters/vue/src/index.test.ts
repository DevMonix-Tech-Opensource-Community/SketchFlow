import { describe, expect, it } from "vitest";
import { AdapterContext, SketchDocument, SketchNode } from "@sketchflow/core";
import { vueAdapter } from "./index.js";

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
  id: "doc-vue",
  name: "Vue Sample",
  nodes: []
};

const sampleNodes: SketchNode[] = [
  makeNode({
    id: "root",
    children: [
      makeNode({
        id: "text-1",
        type: "text",
        props: { text: "Hello Vue" },
        layout: { x: 10, y: 12, width: 120, height: 24 }
      })
    ],
    layout: { x: 0, y: 0, width: 320, height: 200 }
  })
];

const context: AdapterContext = {
  document,
  layout: sampleNodes
};

describe("vueAdapter", () => {
  it("produces a Vue single-file component", () => {
    const result = vueAdapter.generate(context);
    expect(result.files).toHaveLength(1);
    const file = result.files[0];
    expect(file.path).toBe("GeneratedScreen.vue");
    expect(file.contents).toContain("<template>");
    expect(file.contents).toContain("Hello Vue");
  });

  it("reports metadata", () => {
    const meta = vueAdapter.introspect(context);
    expect(meta).toEqual({ nodeCount: 1, components: 0 });
  });
});
