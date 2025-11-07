import {
  AdapterContext,
  AdapterResult,
  FrameworkAdapter,
  SketchNode,
  registerFrameworkAdapter
} from "@sketchflow/core";

export interface ReactAdapterOptions {
  componentName?: string;
  style?: "inline" | "css" | "tailwind";
}

const DEFAULT_COMPONENT = "GeneratedScreen";

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

const indent = (size: number) => " ".repeat(size);

const renderNodes = (nodes: SketchNode[], depth: number): string => {
  return nodes
    .map((node: SketchNode, index: number) => {
      const key = `${node.id}-${index}`;
      const style = toStyle(node.layout);
      const childContent = node.children.length ? `\n${renderNodes(node.children, depth + 2)}\n${indent(depth)}` : "";

      switch (node.type) {
        case "text": {
          const label = JSON.stringify(node.props?.text ?? node.name ?? "Label");
          return `${indent(depth)}<span key="${key}" style=${style}>{${label}}</span>`;
        }
        case "image": {
          const src = JSON.stringify(node.props?.src ?? "");
          const alt = JSON.stringify(node.name ?? "image");
          return `${indent(depth)}<img key="${key}" src=${src} alt=${alt} style=${style} />`;
        }
        case "component":
        case "group":
        case "frame": {
          return `${indent(depth)}<div key="${key}" style=${style}>${childContent}</div>`;
        }
        default: {
          return `${indent(depth)}<div key="${key}" style=${style} />`;
        }
      }
    })
    .join("\n");
};

const generateComponent = (context: AdapterContext, options: ReactAdapterOptions): AdapterResult => {
  const componentName = options.componentName ?? DEFAULT_COMPONENT;
  const body = renderNodes(context.layout, 6);

  const contents = `import React from "react";

export const ${componentName}: React.FC = () => {
  return (
    <div style={{ position: "relative" }}>
${body}
    </div>
  );
};
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

export const reactAdapter: FrameworkAdapter = {
  framework: "react",
  language: "tsx",
  introspect: (context: AdapterContext) => ({
    nodeCount: context.layout.length,
    components: context.layout.filter((node: SketchNode) => node.type === "component").length
  }),
  generate: (context: AdapterContext) => {
    const options = (context.options ?? {}) as ReactAdapterOptions;
    return generateComponent(context, options);
  }
};

export const registerReactAdapter = () => {
  registerFrameworkAdapter(reactAdapter);
  return reactAdapter;
};

export const renderReactNodes = renderNodes;
