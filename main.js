import Swarm from "./src/swarm.js";
import OpenAI from "openai";
import { triageAgent } from "./src/agents.js";

const openai_client = new OpenAI({
  dangerouslyAllowBrowser: true,
  baseURL: import.meta.env?.["VITE_OPENAI_BASE_URL"],
  apiKey: import.meta.env?.["VITE_OPENAI_API_KEY"],
});

const swarm = new Swarm(openai_client);

let messages = [];
let agent = triageAgent;
let answering = false;
const conversationsElement = document.querySelector("#conversations");

function renderConversations(messages) {
  conversationsElement.innerHTML = messages
    .map((message) => {
      switch (message.role) {
        case "user":
          return `<li>You: ${message.content}</li>`;
        case "assistant":
          return `<li>${message.sender}: ${
            message.content || message?.tool_calls?.[0]?.function?.name || ""
          }</li>`;
      }
    })
    .join("\n");
}

document.querySelector("#userInput").addEventListener("keyup", async (e) => {
  if (answering) return;
  if (e.key === "Enter" || e.keyCode === 13) {
    const content = e.target.value;
    messages.push({ role: "user", content });
    e.target.value = "";
    e.target.placeholder = "Type response to agent";
    renderConversations(messages);
    answering = true;
    let response = await swarm.run({
      agent: agent,
      messages,
      contextVariables: {},
      stream: false,
      debug: true,
    });
    messages = [...messages, ...response.messages];
    agent = response.agent;
    renderConversations(messages);
    answering = false;
  }
});
