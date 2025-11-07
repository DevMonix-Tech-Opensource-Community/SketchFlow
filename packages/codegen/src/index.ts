import {
  AdapterResult,
  FrameworkAdapter,
  registerFrameworkAdapter,
  registerLayoutEngine,
  useFrameworkAdapter
} from "@sketchflow/core";
import { defaultLayoutEngine, getLayoutEngine, listLayoutEngines } from "@sketchflow/layout";
import { parseSketch, SketchDataSource } from "@sketchflow/sketch";

export interface GenerationOptions {
  layout?: {
    engine?: string;
    options?: Record<string, unknown>;
  };
  adapterOptions?: Record<string, unknown>;
}

export interface GenerationRequest {
  source: SketchDataSource;
  framework: string;
  options?: GenerationOptions;
}

export interface GenerationArtifacts extends AdapterResult {
  metadata: {
    layoutEngine: string;
    adapter: string;
    nodeCount: number;
  };
}

const ensureLayoutEngine = (name?: string) => {
  if (!name) {
    return defaultLayoutEngine;
  }

  const engine = getLayoutEngine(name);
  if (!engine) {
    throw new Error(`Layout engine '${name}' is not registered.`);
  }

  return engine;
};

const ensureAdapter = (framework: string): FrameworkAdapter => {
  const adapter = useFrameworkAdapter(framework);
  if (!adapter) {
    throw new Error(`Framework adapter '${framework}' is not registered.`);
  }

  return adapter;
};

export const generateFrontend = async (request: GenerationRequest): Promise<GenerationArtifacts> => {
  const { source, framework, options } = request;
  const document = await parseSketch(source);

  const layoutEngine = ensureLayoutEngine(options?.layout?.engine);
  const layoutNodes = layoutEngine.apply(document.nodes);

  const adapter = ensureAdapter(framework);
  const context = {
    document,
    layout: layoutNodes,
    options: options?.adapterOptions
  };

  const result = await adapter.generate(context);

  return {
    ...result,
    metadata: {
      layoutEngine: layoutEngine.name,
      adapter: adapter.framework,
      nodeCount: layoutNodes.length
    }
  };
};

export { registerFrameworkAdapter, registerLayoutEngine, listLayoutEngines };
