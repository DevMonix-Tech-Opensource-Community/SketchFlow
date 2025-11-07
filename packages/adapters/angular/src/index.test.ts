import { describe, expect, it } from "vitest";
import { AdapterContext, SketchDocument, SketchNode } from "@sketchflow/core";
import { angularAdapter } from "./index.js";

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
  id: "doc-angular",
  name: "Angular Sample",
  nodes: []
};

const sampleNodes: SketchNode[] = [
  makeNode({
    id: "root",
    children: [
      makeNode({
        id: "text-1",
        type: "text",
        props: { text: "Hello Angular" },
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

describe("angularAdapter", () => {
  it("produces Angular component files", () => {
    const result = angularAdapter.generate(context);
    expect(result.files).toHaveLength(3);
    const [tsFile, htmlFile, cssFile] = result.files;
    expect(tsFile.path).toBe("generated-screen.ts");
    expect(tsFile.contents).toContain("@Component");
    expect(htmlFile.contents).toContain("Hello Angular");
    expect(htmlFile.contents).toContain("hero.png");
    expect(cssFile.contents).toContain(".sketchflow-root");
  });

  it("reports metadata", () => {
    const meta = angularAdapter.introspect(context);
    expect(meta).toEqual({ nodeCount: 1, components: 0 });
  });
});
