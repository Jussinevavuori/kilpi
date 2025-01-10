import dts from "bun-plugin-dts";
import { Chalk } from "chalk";
import { watch } from "fs";
import fs from "node:fs/promises";
import Path from "path";

// Initialize chalk
const C = new Chalk();

/**
 * Function to run a build and measure the time.
 */
async function build() {
  // Start measuring build time
  const startingTime = performance.now();

  type Build = { entrypoints: string[]; outdir: string };

  /**
   * List of all entrypoints to outdirs, in order
   */
  const builds: Build[] = [
    { entrypoints: ["packages/core/src/index.ts"], outdir: "packages/core/dist" },
    { entrypoints: ["packages/server/src/index.ts"], outdir: "packages/server/dist" },
    { entrypoints: ["packages/client/src/index.ts"], outdir: "packages/client/dist" },
    { entrypoints: ["packages/react/src/server/index.tsx"], outdir: "packages/react/dist/server" },
    { entrypoints: ["packages/react/src/client/index.tsx"], outdir: "packages/react/dist/client" },
  ];

  /**
   * Build a single package
   */
  async function buildPackage(build: Build) {
    // Delete everything inside the outdir first (Do not delete entire outdir to avoid "flashing"
    // content in editor).
    await fs.rm(Path.resolve(build.outdir), { recursive: true }).catch(() => {}); // Safely Ignore

    // Build both esm and cjs versions
    await Promise.all([
      Bun.build({ ...build, format: "esm", naming: "[dir]/[name].js", plugins: [dts()] }),
      Bun.build({ ...build, format: "cjs" as any, naming: "[dir]/[name].cjs" }),
    ]);
  }

  /**
   * Build all packages
   */
  for (const build of builds) {
    await buildPackage(build);
    console.log(`📦 Built ${build.entrypoints}`);
  }

  /**
   * Measure build time in MS and return it.
   */
  return performance.now() - startingTime;
}

// If `--watch` flag is passed, standby to watch for changes
if (
  process.argv.includes("--watch") ||
  process.argv.includes("-w") ||
  process.argv.includes("--watch=true")
) {
  // Ensure only one build at a time
  const status = {
    isBuildRunning: false,
    buildNumber: 0,
  };

  // On change, run new build unless one already running
  async function handleChange(eventType?: string, filename?: string | null) {
    // Respect lock
    if (status.isBuildRunning) return;

    try {
      // Initialize lock and build number
      status.buildNumber++;
      status.isBuildRunning = true;

      // Log rebuild
      console.clear();
      if (filename && eventType) {
        console.log(`ℹ️  File changed: ${filename ?? "<null>"} (${eventType})`);
      }
      console.log(C.gray(`🔨 Rebuilding...`));

      // Build
      const buildTimeMs = await build();

      // Log build completed
      console.clear();
      console.log(`✅ Build ${status.buildNumber} finished in ${buildTimeMs.toFixed(2)}ms`);
      console.log(C.gray(`👀 Watching for changes...`));
    } catch (e) {
      console.error(`❌ Failed to build: ${e}`);
    } finally {
      // Unlock
      status.isBuildRunning = false;
    }
  }

  // Initial build
  await handleChange();

  // Setup watcher to run a new build whenever a file changes
  const watcher = watch(".", { recursive: true }, (eventType, filename) => {
    if (filename?.includes("/dist")) return;
    handleChange(eventType, filename);
  });

  // close watcher when Ctrl-C is pressed
  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });
} else {
  // Simply build, log and exit when not watching
  const buildTimeMs = await build();
  console.log(`✅ Build finished in ${buildTimeMs.toFixed(2)}ms`);
}
