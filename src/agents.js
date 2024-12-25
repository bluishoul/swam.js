import { Agent } from "./types";

/**
 * Refund an item. Make sure you have the item_id of the form item_...
 * Ask for user confirmation before processing the refund.
 * @param {string} itemId - The ID of the item to refund.
 * @param {string} [reason=NOT SPECIFIED] - The reason for the refund.
 * @returns {string} - A success message indicating the refund was processed.
 */
function processRefund(itemId, reason = "NOT SPECIFIED") {
  console.log(`[mock] Refunding item ${itemId} because ${reason}...`);
  return "Success!";
}

/**
 * Apply a discount to the user's cart.
 * @returns {string} - A message indicating the discount was applied.
 */
function applyDiscount() {
  console.log("[mock] Applying discount...");
  return "Applied discount of 11%";
}

const triageAgent = new Agent({
  name: "Triage Agent",
  model: import.meta.env?.["VITE_DEFAULT_MODEL"] || "gpt-4o",
  instructions:
    "Determine which agent is best suited to handle the user's request, and transfer the conversation to that agent.",
  tool_choice: { type: "function", function: { name: "transferToRefunds" } },
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

/**
 * Call this function if a user is asking about a topic that
 * is not handled by the current agent.
 * @returns {Agent}
 */
function transferBackToTriage() {
  return triageAgent;
}

/**
 * Transfers the conversation to the Sales Agent.
 * @returns {Agent} The Sales Agent instance.
 */
function transferToSales() {
  return salesAgent;
}

/**
 * Transfers the conversation to the Refunds Agent.
 * @returns {Agent} The Refunds Agent instance.
 */
function transferToRefunds() {
  return refundsAgent;
}

triageAgent.functions = [transferToSales, transferToRefunds];
salesAgent.functions.push(transferBackToTriage);
refundsAgent.functions.push(transferBackToTriage);

export { triageAgent, salesAgent, refundsAgent, processRefund, applyDiscount };
