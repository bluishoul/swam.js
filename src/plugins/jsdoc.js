import MagicString from "magic-string";
import jsdoc from "jsdoc-api";
import globrex from "globrex";

export default function jsdocMetaPlugin(glob = "*agents.js") {
  return {
    name: "vite-plugin-jsdoc-meta",
    async transform(code, id) {
      const result = globrex(glob);
      if (!result.regex.test(id)) return;

      const data = await jsdoc.explain({ source: code });
      const functions = data.filter(({ kind }) => kind === "function");
      const s = new MagicString(code);
      let hasChanges = false;

      for (const func of functions) {
        hasChanges = true;
        const {
          name,
          params,
          description,
          meta: {
            range: [start, end],
          },
        } = func;
        s.appendRight(
          end,
          `\n${name}.__description__ = ${JSON.stringify(
            description
          )};\n${name}.__params__ = ${JSON.stringify(params, null, 2)};`
        );
      }

      if (!hasChanges) {
        return null;
      }

      return {
        code: s.toString(),
        map: s.generateMap(),
      };
    },
  };
}
