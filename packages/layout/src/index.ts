import {
  LayoutEngine,
  SketchNode,
  availableLayoutEngines,
  registerLayoutEngine,
  useLayoutEngine
} from "@sketchflow/core";

type Constraints = {
  horizontalGap?: number;
  verticalGap?: number;
  padding?: number;
};

export interface LayoutEngineOptions extends Constraints {
  name: string;
  version?: string;
  supports?: (node: SketchNode) => boolean;
  apply: (nodes: SketchNode[]) => SketchNode[];
}

export const createLayoutEngine = (options: LayoutEngineOptions): LayoutEngine => {
  const {
    name,
    version = "0.1.0",
    supports = () => true,
    apply
  } = options;

  if (!name) {
    throw new Error("Layout engine must have a name");
  }

  return {
    name,
    version,
    supports,
    apply
  };
};

const isLayoutEngine = (engine: LayoutEngine | LayoutEngineOptions): engine is LayoutEngine => {
  return typeof (engine as LayoutEngine).apply === "function" && typeof engine.version === "string";
};

const resolveLayoutEngine = (engine: LayoutEngine | LayoutEngineOptions): LayoutEngine => {
  if (isLayoutEngine(engine)) {
    return engine;
  }

  return createLayoutEngine(engine);
};

export const registerLayout = (engine: LayoutEngine | LayoutEngineOptions) => {
  const instance = resolveLayoutEngine(engine);
  registerLayoutEngine(instance);
  return instance;
};

export const getLayoutEngine = (name: string) => useLayoutEngine(name);
export const listLayoutEngines = () => availableLayoutEngines();

const cloneNode = (node: SketchNode): SketchNode => ({
  ...node,
  layout: { ...node.layout },
  props: node.props ? { ...node.props } : undefined,
  children: node.children.map(cloneNode)
});

const passthroughLayout = registerLayout({
  name: "passthrough",
  version: "0.1.0",
  apply: (nodes) => nodes.map(cloneNode)
});

export const defaultLayoutEngine = passthroughLayout;
