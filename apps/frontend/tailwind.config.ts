import type { Config } from "tailwindcss";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  // load CJS preset under an ESM project
  presets: [require("../../packages/tokens/dist/tailwind.preset.cjs")],
};
export default config;
