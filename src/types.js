/**
 * Represents an Agent with instructions, model, functions, and tool choice preferences.
 */
export class Agent {
  constructor({
    name,
    instructions,
    model,
    functions = [],
    tool_choice = null,
  }) {
    this.name = name;
    this.instructions = instructions;
    this.model = model;
    this.functions = functions;
    this.tool_choice = tool_choice;
  }
}

/**
 * Represents an agent function with name, description, and parameters.
 */
export class AgentFunction {
  constructor({ name, description = "", parameters = {} }) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }
}

/**
 * Represents a single chat completion message, including role, content, and optional function calls.
 */
export class ChatCompletionMessage {
  constructor({ role, content, function_call = null, tool_calls = [] }) {
    this.role = role;
    this.content = content;
    this.function_call = function_call;
    this.tool_calls = tool_calls;
  }
}

/**
 * Represents a tool call request within a chat completion message.
 */
export class ChatCompletionMessageToolCall {
  constructor({ id, function: func, type }) {
    this.id = id;
    this.function = func;
    this.type = type;
  }
}

/**
 * Represents a function that can be called within the context of an agent, with arguments and a name.
 */
export class Function {
  constructor({ name, arguments: args }) {
    this.name = name;
    this.arguments = args;
  }
}

/**
 * Represents a Response object holding messages, agent, and context variables.
 */
export class Response {
  constructor({ messages = [], agent = null, context_variables = {} }) {
    this.messages = messages;
    this.agent = agent;
    this.context_variables = context_variables;
  }
}

/**
 * Represents the result of a function or tool call, with optional agent and context variables.
 */
export class Result {
  constructor({ value, agent = null, context_variables = {} }) {
    this.value = value;
    this.agent = agent;
    this.context_variables = context_variables;
  }
}
