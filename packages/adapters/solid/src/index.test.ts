import { describe, expect, it } from "vitest";
import { AdapterContext, SketchDocument, SketchNode } from "@sketchflow/core";
import { solidAdapter } from "./index.js";

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
  id: "doc-solid",
  name: "Solid Sample",
  nodes: []
};

const sampleNodes: SketchNode[] = [
  makeNode({
    id: "root",
    children: [
      makeNode({
        id: "text-1",
        type: "text",
        props: { text: "Hello Solid" },
        layout: { x: 16, y: 24, width: 128, height: 32 }
      })
    ],
    layout: { x: 0, y: 0, width: 320, height: 200 }
  })
];

const context: AdapterContext = {
  document,
  layout: sampleNodes
};

describe("solidAdapter", () => {
  it("produces a Solid component file", () => {
    const result = solidAdapter.generate(context);
    expect(result.files).toHaveLength(1);
    const file = result.files[0];
    expect(file.path).toBe("GeneratedScreen.tsx");
    expect(file.contents).toContain("Component");
    expect(file.contents).toContain("Hello Solid");
  });

  it("reports metadata", () => {
    const meta = solidAdapter.introspect(context);
    expect(meta).toEqual({ nodeCount: 1, components: 0 });
  });
});
