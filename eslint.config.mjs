import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    ".next-verify/**",
    ".app-api-pages-backup/**",
    "out/**",
    "build/**",
    // Byte-for-byte upstream Employee Benefits source, hosted as an iframe.
    "public/employee-benefits/**",
    // Expo shell. Separate toolchain and its own React Native lint config.
    "mobile/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
