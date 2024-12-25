export class MessageList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
        <style>
          .messages {
            display: flex;
            flex-direction: column;
          }
        </style>
        <div class="messages"></div>
      `;
  }

  addMessage(content, sender) {
    const messageItem = document.createElement("message-item");
    messageItem.setAttribute("content", content);
    messageItem.setAttribute("sender", sender);
    this.shadowRoot.querySelector(".messages").appendChild(messageItem);
  }
}

customElements.define("message-list", MessageList);
