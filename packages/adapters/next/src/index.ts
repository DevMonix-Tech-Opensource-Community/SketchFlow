import { FrameworkAdapter, AdapterContext, AdapterResult, registerFrameworkAdapter } from "@sketchflow/core";
import { reactAdapter } from "@sketchflow/adapter-react";

const PAGE_PATH = "app/page.tsx";
const COMPONENT_DIR = "app/components";

const pageTemplate = (componentImportPath: string) => `import type { Metadata } from "next";
import dynamic from "next/dynamic";

const GeneratedComponent = dynamic(() => import("${componentImportPath}"));

export const metadata: Metadata = {
  title: "Generated"
};

export default function Page() {
  return <GeneratedComponent />;
}
`;

const generateNextPage = async (context: AdapterContext): Promise<AdapterResult> => {
  const componentResult = await reactAdapter.generate(context);
  const files: AdapterResult["files"] = [];

  for (const file of componentResult.files) {
    files.push({
      path: `${COMPONENT_DIR}/${file.path}`,
      contents: file.contents
    });
  }

  files.push({
    path: PAGE_PATH,
    contents: pageTemplate(`./components/${componentResult.files[0]?.path ?? "GeneratedScreen"}`)
  });

  return { files } satisfies AdapterResult;
};

export const nextAdapter: FrameworkAdapter = {
  framework: "next",
  language: "tsx",
  introspect: (context: AdapterContext) => reactAdapter.introspect(context),
  generate: (context: AdapterContext) => generateNextPage(context)
};

export const registerNextAdapter = () => {
  registerFrameworkAdapter(nextAdapter);
  return nextAdapter;
};
