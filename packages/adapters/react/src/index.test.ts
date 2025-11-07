import { describe, expect, it } from "vitest";
import { AdapterContext, SketchDocument, SketchNode } from "@sketchflow/core";
import { reactAdapter, renderReactNodes } from "./index";

const makeNode = (overrides: Partial<SketchNode> = {}): SketchNode => ({
  id: overrides.id ?? "node-1",
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
  id: "doc-1",
  name: "Sample",
  nodes: []
};

const sampleNodes: SketchNode[] = [
  makeNode({
    id: "root",
    children: [
      makeNode({
        id: "text-1",
        type: "text",
        props: { text: "Hello" },
        layout: { x: 16, y: 24, width: 128, height: 32 }
      }),
      makeNode({
        id: "image-1",
        type: "image",
        props: { src: "hero.png" },
        name: "Hero",
        layout: { x: 0, y: 72, width: 320, height: 200 }
      })
    ],
    layout: { x: 0, y: 0, width: 360, height: 640 }
  })
];

const context: AdapterContext = {
  document,
  layout: sampleNodes
};

describe("reactAdapter", () => {
  it("renders nodes into JSX", () => {
    const output = renderReactNodes(sampleNodes, 6);
    expect(output).toMatchInlineSnapshot(`
      "      <div key=\"root-0\" style={{ position: \"absolute\", left: 0, top: 0, width: 360, height: 640 }}>
              <span key=\"text-1-0\" style={{ position: \"absolute\", left: 16, top: 24, width: 128, height: 32 }}>{\"Hello\"}</span>
              <img key=\"image-1-1\" src=\"hero.png\" alt=\"Hero\" style={{ position: \"absolute\", left: 0, top: 72, width: 320, height: 200 }} />
            </div>"
    `);
  });

  it("produces a React component file", () => {
    const result = reactAdapter.generate(context);
    expect(result.files).toHaveLength(1);
    const file = result.files[0];
    expect(file.path).toBe("GeneratedScreen.tsx");
    expect(file.contents).toContain("export const GeneratedScreen");
    expect(file.contents).toContain("<span key=\"text-1-0\"");
  });

  it("reports introspection metadata", () => {
    const meta = reactAdapter.introspect(context);
    expect(meta).toEqual({ nodeCount: 1, components: 0 });
  });
});
