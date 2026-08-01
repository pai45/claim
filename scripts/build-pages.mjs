import { cpSync, existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "app", "api");
const apiBackupDir = path.join(root, ".app-api-pages-backup");
const pagesDistDir = path.join(root, ".next-verify");

rmSync(apiBackupDir, { recursive: true, force: true });
rmSync(pagesDistDir, { recursive: true, force: true });

if (existsSync(apiDir)) {
  cpSync(apiDir, apiBackupDir, { recursive: true });
  rmSync(apiDir, { recursive: true, force: true });
}

let result;

try {
  result = spawnSync(
    process.execPath,
    [path.join(root, "node_modules", "next", "dist", "bin", "next"), "build", "--webpack"],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        STATIC_EXPORT: "true",
      },
    },
  );
} finally {
  if (existsSync(apiBackupDir)) {
    rmSync(apiDir, { recursive: true, force: true });
    cpSync(apiBackupDir, apiDir, { recursive: true });
    rmSync(apiBackupDir, { recursive: true, force: true });
  }
}

process.exit(result?.status ?? 1);
