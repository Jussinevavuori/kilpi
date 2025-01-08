import { $ } from "bun";
import dts from "bun-plugin-dts";
import { Chalk } from "chalk";
import { watch } from "fs";

// Initialize chalk
const C = new Chalk();

/**
 * Function to run a build and measure the time.
 */
async function build() {
  // Start measuring build time
  const startingTime = performance.now();

  // Read package.json
  const packageJson = await Bun.file("./package.json").json();
  const exports = packageJson.exports as Record<
    string,
    { types: string; import: string; require: string }
  >;

  // Common src and out directories
  const srcdir = "./src";
  const outdir = "./dist";

  // Get entrypoints based on exports (same file but in ./src, not in ./dist and as .ts, not .js).
  const entrypoints = (
    await Promise.all(
      Object.keys(exports).map(async (key) => {
        const tsPath = exports[key].import.replace(".js", ".ts").replace(outdir, srcdir);
        const tsxPath = tsPath.replace(".ts", ".tsx");

        if (await Bun.file(tsPath).exists()) return tsPath;
        if (await Bun.file(tsxPath).exists()) return tsxPath;

        return "";
      })
    )
  ).filter(Boolean);

  // Delete outdir first
  try {
    await $`rm -rf ${outdir}`;
  } catch (error) {
    console.error(`❌ Failed to delete outdir: ${error}`);
  }

  // Build both esm and cjs versions
  await Promise.all([
    Bun.build({
      entrypoints,
      outdir,
      plugins: [dts()],
      format: "esm",
      naming: "[dir]/[name].js",
    }),
    Bun.build({
      entrypoints,
      outdir,
      format: "cjs" as any,
      naming: "[dir]/[name].cjs",
    }),
  ]);

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
  async function handleChange() {
    // Respect lock
    if (status.isBuildRunning) return;

    try {
      // Initialize lock and build number
      status.buildNumber++;
      status.isBuildRunning = true;

      // Log rebuild
      console.clear();
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

  // Setup watcher to run a new build whenever ./src changes
  const watcher = watch("./src", { recursive: true }, handleChange);

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
