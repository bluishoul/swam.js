/**
 * Prints debug messages with a timestamp if debugging is enabled.
 * @param {boolean} debug - Flag to enable or disable debugging output.
 * @param {...string} args - Messages to print.
 */
export function debugPrint(debug, ...args) {
  if (!debug) return;
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  const message = args.map(JSON.stringify).join(" ");
  console.log(`[${timestamp}] ${message}`);
}

/**
 * Recursively merges fields from a source object into a target object.
 * @param {Object} target - The object to merge into.
 * @param {Object} source - The object to merge from.
 */
function mergeFields(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "string") {
      target[key] += value;
    } else if (value !== null && typeof value === "object") {
      if (!target[key]) target[key] = {};
      mergeFields(target[key], value);
    }
  }
}

/**
 * Merges delta chunks into the final response object.
 * @param {Object} finalResponse - The response object to merge into.
 * @param {Object} delta - The delta object to merge from.
 */
export function mergeChunk(finalResponse, delta) {
  delete delta.role;
  mergeFields(finalResponse, delta);

  const toolCalls = delta.tool_calls;
  if (toolCalls && toolCalls.length > 0) {
    const index = toolCalls[0].index;
    delete toolCalls[0].index;
    if (!finalResponse.tool_calls) finalResponse.tool_calls = [];
    if (!finalResponse.tool_calls[index]) finalResponse.tool_calls[index] = {};
    mergeFields(finalResponse.tool_calls[index], toolCalls[0]);
  }
}

/**
 * Converts a JavaScript function to a JSON-serializable dictionary with its signature.
 * @param {Function} func - The function to be converted.
 * @returns {Object} - JSON representation of the function's signature.
 */
export function functionToJson(func) {
  const typeMap = {
    string: "string",
    number: "number",
    boolean: "boolean",
    object: "object",
    undefined: "null",
  };

  let parameters = {};
  let required = [];

  const paramRegex = /\(([^)]+)\)/;
  const paramString = func.toString().match(paramRegex)?.[1];

  if (paramString) {
    const params = paramString.split(",").map((p) => p.trim());
    params.forEach((param) => {
      const [name, type] = param.split("=");
      const paramType = typeMap[typeof eval(type)] || "string";
      parameters[name] = { type: paramType };
      if (!type) required.push(name);
    });
  }

  return {
    type: "function",
    function: {
      name: func.name,
      description: func.description || "",
      parameters: {
        type: "object",
        properties: parameters,
        required: required,
      },
    },
  };
}
