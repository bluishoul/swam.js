export class ChatContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
        <style>
          :host {
            /* Light theme default variables */
            --chat-bg: #ffffff;
            --chat-border: #ccc;
            --chat-text: #000000;
            --input-bg: #ffffff;
            --input-border: #ccc;
            --button-bg: #007bff;
            --button-text: #ffffff;
          }

          @media (prefers-color-scheme: dark) {
            :host(:not([theme="light"])) {
              /* Dark theme variables */
              --chat-bg: #1a1a1a;
              --chat-border: #333;
              --chat-text: #ffffff;
              --input-bg: #2d2d2d;
              --input-border: #444;
              --button-bg: #0056b3;
              --button-text: #ffffff;
            }
          }

          /* Explicit dark theme styles */
          :host([theme="dark"]) {
            --chat-bg: #1a1a1a;
            --chat-border: #333;
            --chat-text: #ffffff;
            --input-bg: #2d2d2d;
            --input-border: #444;
            --button-bg: #0056b3;
            --button-text: #ffffff;
          }

          .chat-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 300px;
            border: 1px solid var(--chat-border);
            border-radius: 5px;
            overflow: hidden;
            background-color: var(--chat-bg);
            color: var(--chat-text);
          }
          .message-list {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
          }
        </style>
        <div class="chat-container">
          <message-list class="message-list"></message-list>
          <chat-input></chat-input>
        </div>
      `;

    this.messageList = this.shadowRoot.querySelector("message-list");

    this.shadowRoot
      .querySelector("chat-input")
      .addEventListener("send-message", (event) => {
        this.addMessage(event.detail, "receiver");
      });
  }

  addMessage(content, sender) {
    this.messageList.addMessage(content, sender);
  }

  setTheme(theme) {
    if (theme === 'dark') {
      this.setAttribute('theme', 'dark');
    } else {
      this.removeAttribute('theme');
    }
  }
}

customElements.define("chat-container", ChatContainer); 