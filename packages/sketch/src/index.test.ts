import { describe, expect, it } from "vitest";
import { parseSketch, registerSketchParser } from "./index.js";
import type { SketchDataSource } from "./index.js";
import type { SketchDocument, SketchNode } from "@sketchflow/core";

const minimalDoc = (nodes: SketchNode[]): SketchDocument => ({
  id: "doc",
  name: "Test",
  nodes
});

describe("parseSketch", () => {
  it("accepts pre-validated documents", async () => {
    const result = await parseSketch({ kind: "document", payload: minimalDoc([]) });
    expect(result.name).toBe("Test");
  });

  it("parses vector primitives", async () => {
    const result = await parseSketch({
      kind: "vectors",
      payload: {
        type: "text",
        position: { x: 10, y: 20 },
        size: { width: 100, height: 20 },
        props: { text: "Hello" }
      }
    });

    const nodes = result.nodes;
    expect(nodes[0]?.type).toBe("text");
    expect(nodes[0]?.props).toEqual({ text: "Hello" });
  });

  it("parses wireframe primitives", async () => {
    const result = await parseSketch({
      kind: "wireframe",
      payload: {
        type: "button",
        label: "Click",
        position: { x: 0, y: 0 },
        size: { width: 120, height: 48 }
      }
    });

    expect(result.nodes[0]?.type).toBe("component");
    expect(result.nodes[0]?.props?.label ?? result.nodes[0]?.name).toBe("Click");
  });

  it("supports custom parser registration", async () => {
    registerSketchParser({
      name: "noop",
      version: "0.0.1",
      supports: (source: SketchDataSource) => source.kind === "json",
      parse: (_source: SketchDataSource) => ({
        id: "noop",
        name: "Noop",
        nodes: [
          {
            id: "noop-node",
            type: "frame",
            layout: { x: 0, y: 0, width: 10, height: 10 },
            children: []
          } as SketchNode
        ]
      } satisfies SketchDocument)
    });

    const result = await parseSketch({ kind: "json", payload: { anything: true } });
    expect(result.id).toBe("noop");
    expect(result.nodes).toHaveLength(1);
  });
});
