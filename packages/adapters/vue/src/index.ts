import {
  AdapterContext,
  AdapterResult,
  FrameworkAdapter,
  SketchNode,
  registerFrameworkAdapter
} from "@sketchflow/core";

export interface VueAdapterOptions {
  componentName?: string;
}

const DEFAULT_COMPONENT_NAME = "GeneratedScreen";

const toInlineStyle = (layout: SketchNode["layout"]): string => {
  const styles = [
    `position: absolute`,
    `left: ${layout.x}px`,
    `top: ${layout.y}px`,
    `width: ${layout.width}px`,
    `height: ${layout.height}px`
  ];

  if (typeof layout.rotation === "number") {
    styles.push(`transform: rotate(${layout.rotation}deg)`);
  }

  return styles.join("; ");
};

const indent = (depth: number) => "  ".repeat(depth);

const renderNodes = (nodes: SketchNode[], depth: number = 3): string => {
  return nodes
    .map((node, index) => {
      const key = `${node.id}-${index}`;
      const style = toInlineStyle(node.layout);
      const attributes = [`key="${key}"`, `style="${style}"`];
      const childContent = node.children.length ? `\n${renderNodes(node.children, depth + 1)}\n${indent(depth)}` : "";

      switch (node.type) {
        case "text": {
          const textValue = node.props?.text ?? node.name ?? "Label";
          return `${indent(depth)}<span ${attributes.join(" ")}>${textValue}</span>`;
        }
        case "image": {
          const src = node.props?.src ?? "";
          const alt = node.name ?? "image";
          return `${indent(depth)}<img ${attributes.join(" ")} src="${src}" alt="${alt}" />`;
        }
        case "component":
        case "group":
        case "frame":
        default: {
          return `${indent(depth)}<div ${attributes.join(" ")}>${childContent}</div>`;
        }
      }
    })
    .join("\n");
};

const generateVueComponent = (context: AdapterContext, options: VueAdapterOptions): AdapterResult => {
  const componentName = options.componentName ?? DEFAULT_COMPONENT_NAME;
  const templateBody = renderNodes(context.layout);

  const contents = `<template>
  <div class="sketchflow-root" style="position: relative">
${templateBody}
  </div>
</template>

<script setup lang="ts">
</script>
`;

  return {
    files: [
      {
        path: `${componentName}.vue`,
        contents
      }
    ]
  } satisfies AdapterResult;
};

export const vueAdapter: FrameworkAdapter = {
  framework: "vue",
  language: "ts",
  introspect: (context: AdapterContext) => ({
    nodeCount: context.layout.length,
    components: context.layout.filter((node) => node.type === "component").length
  }),
  generate: (context: AdapterContext) => {
    const options = (context.options ?? {}) as VueAdapterOptions;
    return generateVueComponent(context, options);
  }
};

export const registerVueAdapter = () => {
  registerFrameworkAdapter(vueAdapter);
  return vueAdapter;
};
