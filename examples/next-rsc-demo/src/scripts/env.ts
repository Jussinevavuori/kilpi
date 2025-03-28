/**
 * Use Bun.file to copy `../../.env.example` as `.env` if it does not exist.
 */
async function createEnv() {
  console.log();
  console.log(`🟢 Creating .env`);

  // Files
  const envExampleFile = Bun.file("./.env.example");
  const envFile = Bun.file("./.env");

  // If `.env` exists, do nothing
  if (await envFile.exists()) {
    console.log(`🟢 > .env already exists`);
    return;
  }

  // Copy `.env.example` as `.env` with header content
  await Bun.write(envFile, HEADER + (await envExampleFile.text()));
  console.log(`🟢 > Created .env from .env.example`);
}

createEnv();

const HEADER = `

# =============================================================================
#
# THIS FILE IS AUTO-GENERATED BY THE "bun run bootstrap" SCRIPT.
#
# THE VALUES HAVE BEEN AUTOMATICALLY COPIED FROM .env.example
#
# YOU DO NOT NEED TO EDIT THIS FILE MANUALLY, AND THESE VALUES ARE NOT SECRET.
#
# ============================================================================

`;
