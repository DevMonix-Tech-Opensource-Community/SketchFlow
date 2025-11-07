import {
  AdapterContext,
  AdapterResult,
  FrameworkAdapter,
  SketchNode,
  registerFrameworkAdapter
} from "@sketchflow/core";

export interface SolidAdapterOptions {
  componentName?: string;
}

const DEFAULT_COMPONENT_NAME = "GeneratedScreen";

const toStyle = (layout: SketchNode["layout"]): string => {
  const rules = [
    `position: "absolute"`,
    `left: ${layout.x}`,
    `top: ${layout.y}`,
    `width: ${layout.width}`,
    `height: ${layout.height}`
  ];

  if (typeof layout.rotation === "number") {
    rules.push(`transform: "rotate(${layout.rotation}deg)"`);
  }

  return `{{ ${rules.join(", ")} }}`;
};

const indent = (depth: number) => " ".repeat(depth);

const renderNodes = (nodes: SketchNode[], depth: number): string => {
  return nodes
    .map((node: SketchNode, index: number) => {
      const key = `${node.id}-${index}`;
      const style = toStyle(node.layout);
      const childContent = node.children.length ? `\n${renderNodes(node.children, depth + 2)}\n${indent(depth)}` : "";

      switch (node.type) {
        case "text": {
          const label = JSON.stringify(node.props?.text ?? node.name ?? "Label");
          return `${indent(depth)}<span data-key="${key}" style=${style}>{${label}}</span>`;
        }
        case "image": {
          const src = JSON.stringify(node.props?.src ?? "");
          const alt = JSON.stringify(node.props?.alt ?? node.name ?? "image");
          return `${indent(depth)}<img data-key="${key}" src=${src} alt=${alt} style=${style} />`;
        }
        case "component":
        case "group":
        case "frame": {
          return `${indent(depth)}<div data-key="${key}" style=${style}>${childContent}</div>`;
        }
        default: {
          return `${indent(depth)}<div data-key="${key}" style=${style} />`;
        }
      }
    })
    .join("\n");
};

const generateSolidComponent = (context: AdapterContext, options: SolidAdapterOptions): AdapterResult => {
  const componentName = options.componentName ?? DEFAULT_COMPONENT_NAME;
  const body = renderNodes(context.layout, 6);

  const contents = `import type { Component } from "solid-js";

export const ${componentName}: Component = () => {
  return (
    <div style={{ position: "relative" }}>
${body}
    </div>
  );
};

export default ${componentName};
`;

  return {
    files: [
      {
        path: `${componentName}.tsx`,
        contents
      }
    ]
  } satisfies AdapterResult;
};

export const solidAdapter: FrameworkAdapter = {
  framework: "solid",
  language: "tsx",
  introspect: (context: AdapterContext) => ({
    nodeCount: context.layout.length,
    components: context.layout.filter((node) => node.type === "component").length
  }),
  generate: (context: AdapterContext) => {
    const options = (context.options ?? {}) as SolidAdapterOptions;
    return generateSolidComponent(context, options);
  }
};

export const registerSolidAdapter = () => {
  registerFrameworkAdapter(solidAdapter);
  return solidAdapter;
};
