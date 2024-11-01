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
  return {
    type: "function",
    function: jsdocParamsToOpenAIFunction(
      func.name,
      func.__description__,
      func.__params__
    ),
  };
}

/**
 * Converts JSDoc parameter metadata into OpenAI function call schema format.
 * @param {string} functionName - The name of the function.
 * @param {string} functionDescription - The description of the function.
 * @param {Array} jsdocParams - The JSDoc parameters array.
 * @returns {Object} - An OpenAI function call schema.
 */
function jsdocParamsToOpenAIFunction(
  functionName,
  functionDescription,
  jsdocParams
) {
  const openAISchema = {
    name: functionName,
    description: functionDescription,
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  };

  jsdocParams.forEach((param) => {
    const paramName = param.name;
    const paramType = param.type.names[0];
    const paramDescription = param.description;

    openAISchema.parameters.properties[paramName] = {
      type: paramType,
      description: paramDescription,
    };

    if (!param.optional) {
      openAISchema.parameters.required.push(paramName);
    }

    if (param.defaultvalue) {
      openAISchema.parameters.properties[paramName].default =
        param.defaultvalue;
    }
  });

  return openAISchema;
}
