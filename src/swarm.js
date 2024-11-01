import OpenAI from "openai";

// Import statements
import { functionToJson, debugPrint, mergeChunk } from "./util.js";
import { Agent, Function, Response, Result } from "./types.js";

const CTX_VARS_NAME = "context_variables";

export default class Swarm {
  constructor(client = null) {
    this.client = client || new OpenAI();
  }

  async getChatCompletion(
    agent,
    history,
    contextVariables,
    modelOverride,
    stream,
    debug
  ) {
    contextVariables = { ...contextVariables };
    const instructions =
      typeof agent.instructions === "function"
        ? agent.instructions(contextVariables)
        : agent.instructions;
    const messages = [{ role: "system", content: instructions }, ...history];
    debugPrint(debug, "Getting chat completion for...:", messages);

    const tools = agent.functions.map((f) => functionToJson(f));
    tools.forEach((tool) => {
      const params = tool.function.parameters;
      delete params.properties[CTX_VARS_NAME];
      params.required = params.required.filter((req) => req !== CTX_VARS_NAME);
    });

    const createParams = {
      model: modelOverride || agent.model,
      messages: messages,
      tools: tools.length ? tools : null,
      tool_choice: agent.tool_choice,
      stream: stream,
    };

    if (tools.length)
      createParams.parallel_tool_calls = agent.parallel_tool_calls;

    return this.client.chat.completions.create(createParams);
  }

  handleFunctionResult(result, debug) {
    if (result instanceof Result) return result;
    if (result instanceof Agent)
      return new Result({
        value: JSON.stringify({ assistant: result.name }),
        agent: result,
      });
    try {
      return new Result({ value: String(result) });
    } catch (e) {
      const errorMessage = `Failed to cast response to string: ${result}. Ensure agent functions return a string or Result object. Error: ${e.message}`;
      debugPrint(debug, errorMessage);
      throw new TypeError(errorMessage);
    }
  }

  async handleToolCalls(toolCalls, functions, contextVariables, debug) {
    const functionMap = Object.fromEntries(functions.map((f) => [f.name, f]));
    const partialResponse = new Response({
      messages: [],
      agent: null,
      context_variables: {},
    });

    for (const toolCall of toolCalls) {
      const name = toolCall.function.name;
      const func = functionMap[name];
      if (!func) {
        debugPrint(debug, `Tool ${name} not found in function map.`);
        partialResponse.messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          tool_name: name,
          content: `Error: Tool ${name} not found.`,
        });
        continue;
      }
      const args = JSON.parse(toolCall.function.arguments);
      debugPrint(debug, `Processing tool call: ${name} with arguments`, args);

      if (func.__params__.map(({ name }) => name).includes(CTX_VARS_NAME))
        args[CTX_VARS_NAME] = contextVariables;
      const rawResult = await func(args);
      const result = this.handleFunctionResult(rawResult, debug);

      partialResponse.messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        tool_name: name,
        content: result.value,
      });
      Object.assign(
        partialResponse.context_variables,
        result.context_variables
      );
      if (result.agent) partialResponse.agent = result.agent;
    }

    return partialResponse;
  }

  async *runAndStream(
    agent,
    messages,
    contextVariables = {},
    modelOverride = null,
    debug = false,
    maxTurns = Infinity,
    executeTools = true
  ) {
    let activeAgent = agent;
    contextVariables = { ...contextVariables };
    let history = [...messages];
    const initLen = messages.length;

    while (history.length - initLen < maxTurns) {
      let message = {
        content: "",
        sender: agent.name,
        role: "assistant",
        function_call: null,
        tool_calls: [],
      };

      const completion = await this.getChatCompletion(
        activeAgent,
        history,
        contextVariables,
        modelOverride,
        true,
        debug
      );

      yield { delim: "start" };
      for await (const chunk of completion) {
        const delta = JSON.parse(chunk.choices[0].delta.json());
        if (delta.role === "assistant") delta.sender = activeAgent.name;
        yield delta;
        mergeChunk(message, delta);
      }
      yield { delim: "end" };

      if (!message.tool_calls.length) {
        debugPrint(debug, "Ending turn.");
        break;
      }

      const toolCalls = message.tool_calls.map(
        (toolCall) =>
          new ChatCompletionMessageToolCall({
            id: toolCall.id,
            function: new Function({
              arguments: toolCall.function.arguments,
              name: toolCall.function.name,
            }),
            type: toolCall.type,
          })
      );

      const partialResponse = await this.handleToolCalls(
        toolCalls,
        activeAgent.functions,
        contextVariables,
        debug
      );
      history.push(...partialResponse.messages);
      Object.assign(contextVariables, partialResponse.context_variables);
      if (partialResponse.agent) activeAgent = partialResponse.agent;
    }

    yield {
      response: new Response({
        messages: history.slice(initLen),
        agent: activeAgent,
        context_variables: contextVariables,
      }),
    };
  }

  async run({
    agent,
    messages = [],
    contextVariables = {},
    modelOverride = null,
    stream = false,
    debug = false,
    maxTurns = Infinity,
    executeTools = true,
  }) {
    if (stream) {
      return this.runAndStream(
        agent,
        messages,
        contextVariables,
        modelOverride,
        debug,
        maxTurns,
        executeTools
      );
    }
    let activeAgent = agent;
    contextVariables = { ...contextVariables };
    let history = [...messages];
    const initLen = messages.length;

    while (history.length - initLen < maxTurns && activeAgent) {
      const completion = await this.getChatCompletion(
        activeAgent,
        history,
        contextVariables,
        modelOverride,
        stream,
        debug
      );
      const message = completion.choices[0].message;
      debugPrint(debug, "Received completion:", message);
      message.sender = activeAgent.name;
      history.push(JSON.parse(JSON.stringify(message)));

      if (!message.tool_calls || !message.tool_calls.length || !executeTools) {
        debugPrint(debug, "Ending turn.");
        break;
      }

      const partialResponse = await this.handleToolCalls(
        message.tool_calls,
        activeAgent.functions,
        contextVariables,
        debug
      );
      history.push(...partialResponse.messages);
      Object.assign(contextVariables, partialResponse.context_variables);
      if (partialResponse.agent) activeAgent = partialResponse.agent;
    }

    return new Response({
      messages: history.slice(initLen),
      agent: activeAgent,
      context_variables: contextVariables,
    });
  }
}
