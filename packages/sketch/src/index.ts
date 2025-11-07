import { SketchDocument, SketchNode, sketchDocumentSchema, validateSketchDocument, z } from "@sketchflow/core";

type Point = { x: number; y: number };
type Size = { width: number; height: number };

type SketchVector = {
  id?: string;
  name?: string;
  type: "frame" | "group" | "shape" | "text" | "image" | "component";
  position: Point;
  size: Size;
  rotation?: number;
  props?: Record<string, unknown>;
  children?: SketchVector[];
};

type WireframePrimitive = {
  id?: string;
  type: "canvas" | "box" | "button" | "text" | "image";
  label?: string;
  position: Point;
  size: Size;
  rotation?: number;
  metadata?: Record<string, unknown>;
  children?: WireframePrimitive[];
};

export type SketchDataSource =
  | { kind: "json"; payload: unknown }
  | { kind: "vectors"; payload: SketchVector }
  | { kind: "vectors"; payload: SketchVector[] }
  | { kind: "wireframe"; payload: WireframePrimitive }
  | { kind: "wireframe"; payload: WireframePrimitive[] }
  | { kind: "document"; payload: SketchDocument };

export interface SketchParser {
  readonly name: string;
  readonly version: string;
  supports(source: SketchDataSource): boolean;
  parse(source: SketchDataSource): Promise<SketchDocument> | SketchDocument;
}

class ParserRegistry {
  private parsers = new Map<string, SketchParser>();

  register(parser: SketchParser) {
    this.parsers.set(parser.name, parser);
  }

  list() {
    return [...this.parsers.values()];
  }

  resolve(source: SketchDataSource): SketchParser | undefined {
    return this.list().find((parser) => parser.supports(source));
  }
}

const registry = new ParserRegistry();

export const registerSketchParser = (parser: SketchParser) => {
  registry.register(parser);
  return parser;
};

export const availableSketchParsers = () => registry.list();

export const parseSketch = async (source: SketchDataSource): Promise<SketchDocument> => {
  if (source.kind === "document") {
    return validateSketchDocument(source.payload);
  }

  const parser = registry.resolve(source);
  if (parser) {
    const result = await parser.parse(source);
    return validateSketchDocument(result);
  }

  if (source.kind === "json") {
    return sketchDocumentSchema.parse(source.payload);
  }

  throw new Error("No registered parser can handle the provided sketch source.");
};

const vectorSchema: z.ZodType<SketchVector> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    type: z.enum(["frame", "group", "shape", "text", "image", "component"]),
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.object({ width: z.number().min(0), height: z.number().min(0) }),
    rotation: z.number().optional(),
    props: z.record(z.any()).optional(),
    children: z.array(vectorSchema).optional()
  })
);

const createNodeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `node-${Math.random().toString(36).slice(2, 10)}`;
};

const wireframeSchema: z.ZodType<WireframePrimitive> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    type: z.enum(["canvas", "box", "button", "text", "image"]),
    label: z.string().optional(),
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.object({ width: z.number().min(0), height: z.number().min(0) }),
    rotation: z.number().optional(),
    metadata: z.record(z.any()).optional(),
    children: z.array(wireframeSchema).optional()
  })
);

const toSketchType = (primitive: WireframePrimitive["type"]): SketchNode["type"] => {
  switch (primitive) {
    case "text":
      return "text";
    case "image":
      return "image";
    case "button":
      return "component";
    case "canvas":
    case "box":
    default:
      return "frame";
  }
};

const toSketchNodeFromWireframe = (primitive: WireframePrimitive): SketchNode => ({
  id: primitive.id ?? createNodeId(),
  type: toSketchType(primitive.type),
  name: primitive.label,
  props:
    primitive.type === "text"
      ? { text: primitive.label ?? primitive.metadata?.text }
      : primitive.type === "image"
        ? { src: primitive.metadata?.src ?? primitive.metadata?.url ?? primitive.label }
        : primitive.metadata,
  layout: {
    x: primitive.position.x,
    y: primitive.position.y,
    width: primitive.size.width,
    height: primitive.size.height,
    rotation: primitive.rotation
  },
  children: (primitive.children ?? []).map(toSketchNodeFromWireframe)
});

const vectorsParser: SketchParser = {
  name: "vectors",
  version: "0.1.0",
  supports: (source) => source.kind === "vectors",
  parse: (source): SketchDocument => {
    const payload = source.payload;
    const vectors = Array.isArray(payload) ? payload : [payload];
    const parsed = z.array(vectorSchema).parse(vectors);

    const toNode = (vector: SketchVector): SketchNode => ({
      id: vector.id ?? createNodeId(),
      type: vector.type,
      name: vector.name,
      props: vector.props,
      layout: {
        x: vector.position.x,
        y: vector.position.y,
        width: vector.size.width,
        height: vector.size.height,
        rotation: vector.rotation
      },
      children: (vector.children ?? []).map(toNode)
    });

    return {
      id: createNodeId(),
      name: "Vector import",
      nodes: parsed.map(toNode)
    } satisfies SketchDocument;
  }
};

registerSketchParser(vectorsParser);

const wireframeParser: SketchParser = {
  name: "wireframe",
  version: "0.1.0",
  supports: (source) => source.kind === "wireframe",
  parse: (source): SketchDocument => {
    const payload = source.payload;
    const primitives = Array.isArray(payload) ? payload : [payload];
    const parsed = z.array(wireframeSchema).parse(primitives);

    return {
      id: createNodeId(),
      name: "Wireframe import",
      nodes: parsed.map(toSketchNodeFromWireframe)
    } satisfies SketchDocument;
  }
};

registerSketchParser(wireframeParser);
