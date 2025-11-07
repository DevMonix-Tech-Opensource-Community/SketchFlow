import {
  AdapterContext,
  AdapterResult,
  FrameworkAdapter,
  SketchNode,
  registerFrameworkAdapter
} from "@sketchflow/core";

export interface AngularAdapterOptions {
  componentName?: string;
}

const DEFAULT_COMPONENT_NAME = "generated-screen";

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

const renderNodes = (nodes: SketchNode[], depth = 3): string => {
  return nodes
    .map((node, index) => {
      const style = toInlineStyle(node.layout);
      const childContent = node.children.length ? `\n${renderNodes(node.children, depth + 1)}\n${indent(depth)}` : "";

      switch (node.type) {
        case "text": {
          const textValue = node.props?.text ?? node.name ?? "Label";
          return `${indent(depth)}<span class="node" style="${style}">${textValue}</span>`;
        }
        case "image": {
          const src = node.props?.src ?? "";
          const alt = node.props?.alt ?? node.name ?? "image";
          return `${indent(depth)}<img class="node" style="${style}" src="${src}" alt="${alt}" />`;
        }
        case "component":
        case "group":
        case "frame":
        default: {
          return `${indent(depth)}<div class="node" style="${style}">${childContent}</div>`;
        }
      }
    })
    .join("\n");
};

const generateAngularComponent = (context: AdapterContext, options: AngularAdapterOptions): AdapterResult => {
  const componentName = options.componentName ?? DEFAULT_COMPONENT_NAME;
  const className = componentName
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const templateBody = renderNodes(context.layout);

  const template = `<div class="sketchflow-root" style="position: relative">
${templateBody}
</div>
`;

  const componentTs = `import { Component } from "@angular/core";

@Component({
  selector: "${className}",
  standalone: true,
  templateUrl: "./${componentName}.html",
  styleUrls: ["./${componentName}.css"]
})
export class GeneratedComponent {}
`;

  const componentHtml = template;

  const componentCss = `.sketchflow-root {
  position: relative;
}

.node {
  position: absolute;
}
`;

  return {
    files: [
      { path: `${componentName}.ts`, contents: componentTs },
      { path: `${componentName}.html`, contents: componentHtml },
      { path: `${componentName}.css`, contents: componentCss }
    ]
  } satisfies AdapterResult;
};

export const angularAdapter: FrameworkAdapter = {
  framework: "angular",
  language: "ts",
  introspect: (context: AdapterContext) => ({
    nodeCount: context.layout.length,
    components: context.layout.filter((node) => node.type === "component").length
  }),
  generate: (context: AdapterContext) => {
    const options = (context.options ?? {}) as AngularAdapterOptions;
    return generateAngularComponent(context, options);
  }
};

export const registerAngularAdapter = () => {
  registerFrameworkAdapter(angularAdapter);
  return angularAdapter;
};
