import { describe, expect, it, vi } from "vitest";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildProgram } from "./index.js";
import { registerLayout } from "@sketchflow/layout";

const SAMPLE_DOCUMENT = {
  id: "doc-cli",
  name: "CLI Sample",
  nodes: [
    {
      id: "frame-1",
      type: "frame",
      layout: { x: 0, y: 0, width: 320, height: 200 },
      children: [
        {
          id: "text-1",
          type: "text",
          layout: { x: 8, y: 12, width: 160, height: 24 },
          props: { text: "Hello CLI" },
          children: []
        },
        {
          id: "image-1",
          type: "image",
          layout: { x: 12, y: 48, width: 96, height: 96 },
          props: { src: "hero.png", alt: "Hero" },
          children: []
        },
        {
          id: "group-1",
          type: "group",
          layout: { x: 180, y: 12, width: 120, height: 120 },
          children: [
            {
              id: "text-2",
              type: "text",
              layout: { x: 0, y: 0, width: 110, height: 24 },
              props: { text: "Nested label" },
              children: []
            },
            {
              id: "component-1",
              type: "component",
              name: "Card",
              layout: { x: 0, y: 40, width: 120, height: 72 },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

const createTempDir = async () => mkdtemp(join(tmpdir(), "sketchflow-cli-"));

const testLayout = registerLayout({
  name: "test-cli-layout",
  version: "0.0.1",
  apply: (nodes) => nodes
});

const writeSampleDocument = async (dir: string) => {
  const filePath = join(dir, "sample.json");
  await writeFile(filePath, JSON.stringify(SAMPLE_DOCUMENT, null, 2), "utf-8");
  return filePath;
};

const runGenerate = async (args: string[]) => {
  const program = buildProgram();
  await program.parseAsync(["node", "sketchflow", "generate", ...args]);
};

const cleanupDir = async (dir: string) => {
  await rm(dir, { recursive: true, force: true });
};

describe("sketchflow CLI", () => {
  it("lists registered layout engines", async () => {
    const program = buildProgram();
    let output = "";
    const spy = vi.spyOn(process.stdout, "write").mockImplementation((value) => {
      output += String(value);
      return true;
    });

    try {
      await program.parseAsync(["node", "sketchflow", "list-layouts"]);
    } finally {
      spy.mockRestore();
    }

    expect(output).toContain(testLayout.name);
  });

  it("generates React components to the output directory", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "react-output");

      await runGenerate(["-i", inputPath, "-f", "react", "-o", outputDir, "-l", testLayout.name]);

      const component = await readFile(join(outputDir, "GeneratedScreen.tsx"), "utf-8");
      expect(component).toContain("export const GeneratedScreen");
      expect(component).toContain("React.FC");
      expect(component).toContain("hero.png");
      expect(component).toContain("Nested label");
    } finally {
      await cleanupDir(tempDir);
    }
  });

  it("generates Next.js page and components", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "next-output");

      await runGenerate(["-i", inputPath, "-f", "next", "-o", outputDir, "-l", testLayout.name]);

      const page = await readFile(join(outputDir, "app/page.tsx"), "utf-8");
      const component = await readFile(join(outputDir, "app/components/GeneratedScreen.tsx"), "utf-8");

      expect(page).toContain("export const metadata");
      expect(page).toContain("GeneratedComponent");
      expect(component).toContain("React.FC");
      expect(component).toContain("hero.png");
    } finally {
      await cleanupDir(tempDir);
    }
  });

  it("generates Vue single-file component", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "vue-output");

      await runGenerate(["-i", inputPath, "-f", "vue", "-o", outputDir, "-l", testLayout.name]);

      const component = await readFile(join(outputDir, "GeneratedScreen.vue"), "utf-8");
      expect(component).toContain("<template>");
      expect(component).toContain("Hello CLI");
      expect(component).toContain("hero.png");
      expect(component).toContain("Nested label");
    } finally {
      await cleanupDir(tempDir);
    }
  });

  it("generates Svelte component", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "svelte-output");

      await runGenerate(["-i", inputPath, "-f", "svelte", "-o", outputDir, "-l", testLayout.name]);

      const component = await readFile(join(outputDir, "GeneratedScreen.svelte"), "utf-8");
      expect(component).toContain("<script lang=\"ts\">");
      expect(component).toContain("Hello CLI");
      expect(component).toContain("hero.png");
      expect(component).toContain("Nested label");
    } finally {
      await cleanupDir(tempDir);
    }
  });

  it("generates Angular component trio", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "angular-output");

      await runGenerate(["-i", inputPath, "-f", "angular", "-o", outputDir, "-l", testLayout.name]);

      const componentTs = await readFile(join(outputDir, "generated-screen.ts"), "utf-8");
      const componentHtml = await readFile(join(outputDir, "generated-screen.html"), "utf-8");
      const componentCss = await readFile(join(outputDir, "generated-screen.css"), "utf-8");

      expect(componentTs).toContain("@Component");
      expect(componentHtml).toContain("Hello CLI");
      expect(componentHtml).toContain("hero.png");
      expect(componentCss).toContain(".sketchflow-root");
    } finally {
      await cleanupDir(tempDir);
    }
  });

  it("generates Three.js scene file with custom options", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "three-output");

      await runGenerate([
        "-i",
        inputPath,
        "-f",
        "three",
        "-o",
        outputDir,
        "-l",
        testLayout.name,
        "--adapter-option",
        "sceneName=CustomScene",
        "--adapter-option",
        "sceneBackground=#abcdef"
      ]);

      const sceneFile = await readFile(join(outputDir, "CustomScene.ts"), "utf-8");
      expect(sceneFile).toContain("createScene");
      expect(sceneFile).toContain("#abcdef");
      expect(sceneFile).toContain("layoutNodes");
    } finally {
      await cleanupDir(tempDir);
    }
  });

  it("generates Solid component", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "solid-output");

      await runGenerate(["-i", inputPath, "-f", "solid", "-o", outputDir, "-l", testLayout.name]);

      const component = await readFile(join(outputDir, "GeneratedScreen.tsx"), "utf-8");
      expect(component).toContain("Component");
      expect(component).toContain("Hello CLI");
      expect(component).toContain("Nested label");
    } finally {
      await cleanupDir(tempDir);
    }
  });

  it("generates Preact component", async () => {
    const tempDir = await createTempDir();
    try {
      const inputPath = await writeSampleDocument(tempDir);
      const outputDir = join(tempDir, "preact-output");

      await runGenerate(["-i", inputPath, "-f", "preact", "-o", outputDir, "-l", testLayout.name]);

      const component = await readFile(join(outputDir, "GeneratedScreen.tsx"), "utf-8");
      expect(component).toContain("FunctionComponent");
      expect(component).toContain("Hello CLI");
      expect(component).toContain("Nested label");
    } finally {
      await cleanupDir(tempDir);
    }
  });
});
