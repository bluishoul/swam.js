import { defineConfig } from "vite";
import Inspect from "vite-plugin-inspect";
import jsdocMetaPlugin from "./src/plugins/jsdoc";

export default defineConfig({
  plugins: [Inspect(), jsdocMetaPlugin()],
});
