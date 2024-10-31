import Swarm from "./swarm.js";

export function processAndPrintStreamingResponse(response) {
  let content = "";
  let lastSender = "";

  for (const chunk of response) {
    if ("sender" in chunk) {
      lastSender = chunk.sender;
    }

    if ("content" in chunk && chunk.content != null) {
      if (!content && lastSender) {
        process.stdout.write(`\x1b[94m${lastSender}:\x1b[0m `);
        lastSender = "";
      }
      process.stdout.write(chunk.content);
      content += chunk.content;
    }

    if ("tool_calls" in chunk && chunk.tool_calls != null) {
      for (const toolCall of chunk.tool_calls) {
        const { name } = toolCall.function;
        if (!name) continue;
        process.stdout.write(
          `\x1b[94m${lastSender}: \x1b[95m${name}\x1b[0m()\n`
        );
      }
    }

    if ("delim" in chunk && chunk.delim === "end" && content) {
      process.stdout.write("\n"); // End of response message
      content = "";
    }

    if ("response" in chunk) {
      return chunk.response;
    }
  }
}

export function prettyPrintMessages(messages) {
  for (const message of messages) {
    if (message.role !== "assistant") continue;

    console.log(`\x1b[94m${message.sender}\x1b[0m`);

    // Print response, if any
    if (message.content) {
      console.log(`${message.content}\n`);
    }

    // Print tool calls in purple, if any
    const toolCalls = message.tool_calls || [];
    if (toolCalls.length > 1) console.log("\n");

    for (const toolCall of toolCalls) {
      const { name, arguments: args } = toolCall.function;
      const argStr = JSON.stringify(JSON.parse(args)).replace(/:/g, "=");
      console.log(`\x1b[95m${name}\x1b[0m(${argStr.slice(1, -1)})\n`);
    }
  }
}

export async function runDemoLoop({
  swarm,
  startingAgent,
  contextVariables = {},
  stream = false,
  debug = false,
}) {
  const client = swarm || new Swarm();
  console.log("Starting Swarm.js 🐝");

  let messages = [];
  let agent = startingAgent;

  while (true) {
    const userInput = await prompt("User: ");
    if (!userInput) {
      break;
    }
    messages.push({ role: "user", content: userInput });

    let response = await client.run({
      agent: agent,
      messages: messages,
      contextVariables: contextVariables,
      stream: stream,
      debug: debug,
    });

    if (stream) {
      response = processAndPrintStreamingResponse(response);
    } else {
      prettyPrintMessages(response.messages);
    }

    messages = [...messages, ...response.messages];
    agent = response.agent;
  }
}
