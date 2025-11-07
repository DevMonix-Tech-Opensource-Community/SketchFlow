#!/usr/bin/env node

import { Command } from "commander";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateFrontend, listLayoutEngines } from "@sketchflow/codegen";
import { registerReactAdapter } from "@sketchflow/adapter-react";
import { registerNextAdapter } from "@sketchflow/adapter-next";
import { registerVueAdapter } from "@sketchflow/adapter-vue";
import { registerSvelteAdapter } from "@sketchflow/adapter-svelte";
import { registerAngularAdapter } from "@sketchflow/adapter-angular";
import { registerThreeAdapter } from "@sketchflow/adapter-three";
import { registerSolidAdapter } from "@sketchflow/adapter-solid";
import { registerPreactAdapter } from "@sketchflow/adapter-preact";
import { parseSketch } from "@sketchflow/sketch";
import type { LayoutEngine } from "@sketchflow/core";

const loadSketch = async (path: string) => {
  const contents = await readFile(resolve(path), "utf-8");
  const parsed = JSON.parse(contents);
  return parsed;
};

const ensureAdapters = () => {
  registerReactAdapter();
  registerNextAdapter();
  registerVueAdapter();
  registerSvelteAdapter();
  registerAngularAdapter();
  registerThreeAdapter();
  registerSolidAdapter();
  registerPreactAdapter();
};

const collectAdapterOption = (value: string, previous: string[]) => {
  previous.push(value);
  return previous;
};

const loadLayoutConfig = async (path?: string): Promise<{ engine?: string; options?: Record<string, unknown> } | undefined> => {
  if (!path) {
    return undefined;
  }

  const contents = await readFile(resolve(path), "utf-8");
  return JSON.parse(contents) as { engine?: string; options?: Record<string, unknown> };
};

const parseAdapterOptions = (entries: string[] | undefined): Record<string, unknown> | undefined => {
  if (!entries?.length) {
    return undefined;
  }

  return entries.reduce<Record<string, string>>((acc, entry) => {
    const index = entry.indexOf("=");
    if (index === -1) {
      acc[entry] = "true";
      return acc;
    }

    const key = entry.slice(0, index).trim();
    const rawValue = entry.slice(index + 1).trim();
    if (!key) {
      return acc;
    }

    acc[key] = rawValue;
    return acc;
  }, {});
};

const saveSummary = async (
  path: string | undefined,
  summary: {
    metadata: { layoutEngine: string; adapter: string; nodeCount: number };
    files: Array<{ path: string }>;
  }
) => {
  if (!path) {
    return;
  }

  const targetPath = resolve(process.cwd(), path);
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, JSON.stringify(summary, null, 2), "utf-8");
};

export const buildProgram = () => {
  const program = new Command();

  program.name("sketchflow").description("Sketch-to-frontend CLI").version("0.1.0");

  program
    .command("list-layouts")
    .description("List registered layout engines")
    .action(() => {
      const engines = listLayoutEngines();
      engines.forEach((engine: LayoutEngine) => {
        process.stdout.write(`${engine.name}@${engine.version}\n`);
      });
    });

  program
    .command("generate")
    .description("Generate frontend code from a sketch JSON file")
    .requiredOption("-i, --input <file>", "Sketch JSON file")
    .requiredOption("-f, --framework <name>", "Target framework", "react")
    .option("-l, --layout <engine>", "Layout engine to apply")
    .option("--layout-config <file>", "Layout configuration JSON ({ \"engine\", \"options\" })")
    .option("-o, --out <dir>", "Output directory", "output")
    .option(
      "--adapter-option <key=value>",
      "Adapter-specific option (repeatable, e.g. sceneBackground=#000000)",
      collectAdapterOption,
      [] as string[]
    )
    .option("--save-summary <file>", "Write generation summary metadata to a JSON file")
    .action(async (options: {
      input: string;
      framework: string;
      layout?: string;
      layoutConfig?: string;
      out: string;
      adapterOption?: string[];
      saveSummary?: string;
    }) => {
      ensureAdapters();
      const data = await loadSketch(options.input);
      const sketch = await parseSketch({ kind: "json", payload: data });
      const layoutConfig = await loadLayoutConfig(options.layoutConfig);
      const adapterOptions = parseAdapterOptions(options.adapterOption);
      const result = await generateFrontend({
        source: { kind: "document", payload: sketch },
        framework: options.framework,
        options: {
          layout: {
            engine: options.layout ?? layoutConfig?.engine,
            options: layoutConfig?.options
          },
          adapterOptions
        }
      });

      const outDir = resolve(process.cwd(), options.out);
      await mkdir(outDir, { recursive: true });

      for (const file of result.files) {
        const targetPath = resolve(outDir, file.path);
        const targetDir = dirname(targetPath);
        await mkdir(targetDir, { recursive: true });
        await writeFile(targetPath, file.contents, "utf-8");
      }

      await saveSummary(options.saveSummary, {
        metadata: result.metadata,
        files: result.files.map((file) => ({ path: file.path }))
      });

      console.log("");
      console.log(`Generated ${result.files.length} file(s) for '${result.metadata.adapter}' using layout '${result.metadata.layoutEngine}'.`);
      console.log(`Nodes processed: ${result.metadata.nodeCount}`);
      for (const file of result.files) {
        console.log(` • ${file.path}`);
      }
    });

  return program;
};

const isDirectRun = () => {
  if (!process.argv[1]) {
    return false;
  }

  const currentFile = fileURLToPath(import.meta.url);
  return process.argv[1] === currentFile;
};

if (isDirectRun()) {
  buildProgram()
    .parseAsync(process.argv)
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
