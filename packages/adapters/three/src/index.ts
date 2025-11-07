import {
  AdapterContext,
  AdapterResult,
  FrameworkAdapter,
  SketchNode,
  registerFrameworkAdapter
} from "@sketchflow/core";

export interface ThreeAdapterOptions {
  sceneBackground?: string;
  sceneName?: string;
}

interface ThreeLayoutNode {
  id: string;
  type: SketchNode["type"];
  name?: string;
  props?: Record<string, unknown>;
  layout: SketchNode["layout"];
  children: ThreeLayoutNode[];
}

const DEFAULT_SCENE_NAME = "GeneratedScene";

const toSerializableNodes = (nodes: SketchNode[]): ThreeLayoutNode[] => {
  return nodes.map((node) => ({
    id: node.id,
    type: node.type,
    name: node.name,
    props: node.props,
    layout: node.layout,
    children: toSerializableNodes(node.children)
  }));
};

const toSceneFileName = (name: string | undefined) => {
  if (!name) {
    return DEFAULT_SCENE_NAME;
  }

  const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, "");
  return sanitized.length ? sanitized : DEFAULT_SCENE_NAME;
};

const generateThreeScene = (context: AdapterContext, options: ThreeAdapterOptions): AdapterResult => {
  const layoutNodes = toSerializableNodes(context.layout);
  const background = options.sceneBackground ?? "#222222";
  const sceneName = toSceneFileName(options.sceneName);

  const contents = `import * as THREE from "three";

export interface ThreeLayoutNode {
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
  children: ThreeLayoutNode[];
}

export const layoutNodes: ThreeLayoutNode[] = ${JSON.stringify(layoutNodes, null, 2)};

const addNodes = (nodes: ThreeLayoutNode[], parent: THREE.Object3D) => {
  nodes.forEach((node) => {
    const object = new THREE.Object3D();
    object.name = node.name ?? node.id;
    object.position.set(node.layout.x, node.layout.y, 0);
    object.userData = {
      type: node.type,
      props: node.props ?? {},
      layout: node.layout
    };

    if (typeof node.layout.rotation === "number") {
      object.rotation.z = (node.layout.rotation * Math.PI) / 180;
    }

    parent.add(object);

    if (node.children.length) {
      addNodes(node.children, object);
    }
  });
};

export const createScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(${JSON.stringify(background)});
  addNodes(layoutNodes, scene);
  return scene;
};
`;

  return {
    files: [
      {
        path: `${sceneName}.ts`,
        contents
      }
    ]
  } satisfies AdapterResult;
};

export const threeAdapter: FrameworkAdapter = {
  framework: "three",
  language: "ts",
  introspect: (context: AdapterContext) => {
    const walk = (nodes: SketchNode[]) =>
      nodes.reduce(
        (acc, node) => {
          acc.nodeCount += 1;
          if (node.type === "component") {
            acc.components += 1;
          }

          const childAcc = walk(node.children);
          acc.nodeCount += childAcc.nodeCount;
          acc.components += childAcc.components;
          return acc;
        },
        { nodeCount: 0, components: 0 }
      );

    const totals = walk(context.layout);
    return totals;
  },
  generate: (context: AdapterContext) => {
    const options = (context.options ?? {}) as ThreeAdapterOptions;
    return generateThreeScene(context, options);
  }
};

export const registerThreeAdapter = () => {
  registerFrameworkAdapter(threeAdapter);
  return threeAdapter;
};
