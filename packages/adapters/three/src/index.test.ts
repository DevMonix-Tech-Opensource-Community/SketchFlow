import { describe, expect, it } from "vitest";
import { AdapterContext, SketchDocument, SketchNode } from "@sketchflow/core";
import { threeAdapter } from "./index.js";

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
  id: "doc-three",
  name: "Three Sample",
  nodes: []
};

const sampleNodes: SketchNode[] = [
  makeNode({
    id: "root",
    name: "Root",
    children: [
      makeNode({
        id: "text-1",
        type: "text",
        props: { text: "Hello Three" },
        layout: { x: 10, y: 12, width: 120, height: 24 }
      }),
      makeNode({
        id: "image-1",
        type: "image",
        props: { src: "hero.png", alt: "Hero" },
        layout: { x: 32, y: 56, width: 160, height: 160 },
        children: [
          makeNode({
            id: "component-1",
            type: "component",
            name: "Card",
            layout: { x: 0, y: 0, width: 80, height: 60 }
          })
        ]
      })
    ],
    layout: { x: 0, y: 0, width: 320, height: 400 }
  })
];

const context: AdapterContext = {
  document,
  layout: sampleNodes
};

describe("threeAdapter", () => {
  it("serializes layout nodes and exports scene helpers", async () => {
    const result = await threeAdapter.generate(context);
    expect(result.files).toHaveLength(1);
    const file = result.files[0];
    expect(file.path).toBe("GeneratedScene.ts");
    expect(file.contents).toContain("export const layoutNodes");
    expect(file.contents).toContain("createScene");
    expect(file.contents).toContain("hero.png");
    expect(file.contents).toContain("component-1");
  });

  it("respects adapter options for background", async () => {
    const result = await threeAdapter.generate({
      ...context,
      options: { sceneBackground: "#123456" }
    });

    const file = result.files[0];
    expect(file.contents).toContain("#123456");
  });

  it("reports metadata", () => {
    const meta = threeAdapter.introspect(context);
    expect(meta).toEqual({ nodeCount: 4, components: 1 });
  });
});
