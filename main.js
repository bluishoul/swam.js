import Swarm from "./src/swarm.js";
import OpenAI from "openai";
import { triageAgent } from "./src/agents.js";
import { runDemoLoop } from "./src/repl.js";

const openai_client = new OpenAI({
  dangerouslyAllowBrowser: true,
  baseURL: import.meta.env?.["VITE_OPENAI_BASE_URL"],
  apiKey: import.meta.env?.["VITE_OPENAI_API_KEY"],
});

const swarm = new Swarm(openai_client);

runDemoLoop({
  swarm,
  startingAgent: triageAgent,
  contextVariables: {},
  stream: false,
  debug: true,
});
