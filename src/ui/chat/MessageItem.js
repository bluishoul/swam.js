export class MessageItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const content = this.getAttribute("content");
    const sender = this.getAttribute("sender");
    this.shadowRoot.innerHTML = `
        <style>
          :host {
            /* Light theme message colors */
            --sender-bg: #e3e8f0;    /* Light blue-gray */
            --receiver-bg: #edf2f7;  /* Lighter blue-gray */
            --message-text: #2d3748;
          }

          @media (prefers-color-scheme: dark) {
            :host(:not([theme="light"])) {
              /* Dark theme message colors */
              --sender-bg: #2d3748;   /* Dark blue-gray */
              --receiver-bg: #1a202c; /* Darker blue-gray */
              --message-text: #ffffff;
            }
          }

          /* Dark theme styles when explicitly set */
          :host([theme="dark"]) {
            --sender-bg: #2d3748;
            --receiver-bg: #1a202c;
            --message-text: #ffffff;
          }

          .message-item {
            margin: 5px 0;
            padding: 8px;
            border-radius: 8px;
            max-width: 80%;
            color: var(--message-text);
          }
          .message-item.sender {
            background-color: var(--sender-bg);
            align-self: flex-start;
          }
          .message-item.receiver {
            background-color: var(--receiver-bg);
            align-self: flex-end;
          }
        </style>
        <div class="message-item ${sender}">
          ${content}
        </div>
      `;
  }
}

customElements.define("message-item", MessageItem);
