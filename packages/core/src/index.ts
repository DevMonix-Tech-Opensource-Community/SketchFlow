import { z } from "zod";

export interface SketchNode {
  id: string;
  type: "frame" | "group" | "shape" | "text" | "image" | "component";
  name?: string;
  props?: Record<string, unknown>;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
  children: SketchNode[];
}

export const sketchNodeSchema: z.ZodType<SketchNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(["frame", "group", "shape", "text", "image", "component"]),
    name: z.string().optional(),
    props: z.record(z.any()).optional(),
    layout: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      rotation: z.number().optional()
    }),
    children: z.array(sketchNodeSchema)
  })
);

export const sketchDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(sketchNodeSchema)
});

export type SketchDocument = z.infer<typeof sketchDocumentSchema>;

export interface LayoutEngine {
  name: string;
  version: string;
  supports(node: SketchNode): boolean;
  apply(nodes: SketchNode[]): SketchNode[];
}

export interface AdapterContext {
  document: SketchDocument;
  layout: SketchNode[];
  options?: Record<string, unknown>;
}

export interface AdapterResult {
  files: Array<{
    path: string;
    contents: string;
  }>;
}

export interface FrameworkAdapter {
  readonly framework: string;
  readonly language: "ts" | "js" | "tsx";
  introspect(context: AdapterContext): Promise<Record<string, unknown>> | Record<string, unknown>;
  generate(context: AdapterContext): Promise<AdapterResult> | AdapterResult;
}

export interface SketchflowPluginRegistry {
  registerLayout(engine: LayoutEngine): void;
  getLayout(name: string): LayoutEngine | undefined;
  listLayouts(): LayoutEngine[];
  registerAdapter(adapter: FrameworkAdapter): void;
  getAdapter(framework: string): FrameworkAdapter | undefined;
  listAdapters(): FrameworkAdapter[];
}

class DefaultPluginRegistry implements SketchflowPluginRegistry {
  private layoutEngines = new Map<string, LayoutEngine>();
  private adapters = new Map<string, FrameworkAdapter>();

  registerLayout(engine: LayoutEngine): void {
    this.layoutEngines.set(engine.name, engine);
  }

  getLayout(name: string): LayoutEngine | undefined {
    return this.layoutEngines.get(name);
  }

  listLayouts(): LayoutEngine[] {
    return [...this.layoutEngines.values()];
  }

  registerAdapter(adapter: FrameworkAdapter): void {
    this.adapters.set(adapter.framework, adapter);
  }

  getAdapter(framework: string): FrameworkAdapter | undefined {
    return this.adapters.get(framework);
  }

  listAdapters(): FrameworkAdapter[] {
    return [...this.adapters.values()];
  }
}

const registry = new DefaultPluginRegistry();

export const registerLayoutEngine = (engine: LayoutEngine) => registry.registerLayout(engine);
export const useLayoutEngine = (name: string) => registry.getLayout(name);
export const availableLayoutEngines = () => registry.listLayouts();

export const registerFrameworkAdapter = (adapter: FrameworkAdapter) => registry.registerAdapter(adapter);
export const useFrameworkAdapter = (framework: string) => registry.getAdapter(framework);
export const availableFrameworkAdapters = () => registry.listAdapters();

export const validateSketchDocument = (input: unknown): SketchDocument => {
  const parsed = sketchDocumentSchema.parse(input);
  return parsed;
};

export { z };
