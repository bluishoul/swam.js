export class ChatInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
        <style>
          .input-container {
            display: flex;
            padding: 10px;
            border-top: 1px solid var(--chat-border);
            background-color: var(--chat-bg);
          }
          input {
            flex: 1;
            padding: 8px;
            border: 1px solid var(--input-border);
            border-radius: 4px;
            background-color: var(--input-bg);
            color: var(--chat-text);
          }
          input::placeholder {
            color: var(--chat-text);
            opacity: 0.6;
          }
          button {
            margin-left: 5px;
            padding: 8px 12px;
            border: none;
            background-color: var(--button-bg);
            color: var(--button-text);
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            opacity: 0.9;
          }
        </style>
        <div class="input-container">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      `;
    this.input = this.shadowRoot.querySelector("input");
    this.button = this.shadowRoot.querySelector("button");

    this.button.addEventListener("click", this.handleSend.bind(this));
    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleSend();
      }
    });
  }

  handleSend() {
    const event = new CustomEvent("send-message", {
      detail: this.input.value,
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
    this.input.value = "";
  }
}

customElements.define("chat-input", ChatInput);
