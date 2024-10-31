import { Agent } from "./types";

function processRefund(itemId, reason = "NOT SPECIFIED") {
  // Refund an item. Make sure you have the item_id of the form item_...
  // Ask for user confirmation before processing the refund.
  console.log(`[mock] Refunding item ${itemId} because ${reason}...`);
  return "Success!";
}

function applyDiscount() {
  // Apply a discount to the user's cart.
  console.log("[mock] Applying discount...");
  return "Applied discount of 11%";
}

const triageAgent = new Agent({
  name: "Triage Agent",
  model: import.meta.env?.["VITE_DEFAULT_MODEL"] || "gpt-4o",
  instructions:
    "Determine which agent is best suited to handle the user's request, and transfer the conversation to that agent.",
});

const salesAgent = new Agent({
  name: "Sales Agent",
  model: import.meta.env?.["VITE_DEFAULT_MODEL"] || "gpt-4o",
  instructions: "Be super enthusiastic about selling bees.",
});

const refundsAgent = new Agent({
  name: "Refunds Agent",
  model: import.meta.env?.["VITE_DEFAULT_MODEL"] || "gpt-4o",
  instructions:
    "Help the user with a refund. If the reason is that it was too expensive, offer the user a refund code. If they insist, then process the refund.",
  functions: [processRefund, applyDiscount],
});

function transferBackToTriage() {
  // Call this function if a user is asking about a topic that is not handled by the current agent.
  return triageAgent;
}

function transferToSales() {
  return salesAgent;
}

function transferToRefunds() {
  return refundsAgent;
}

triageAgent.functions = [transferToSales, transferToRefunds];
salesAgent.functions.push(transferBackToTriage);
refundsAgent.functions.push(transferBackToTriage);

export { triageAgent, salesAgent, refundsAgent, processRefund, applyDiscount };
