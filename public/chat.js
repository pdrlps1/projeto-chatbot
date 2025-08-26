/**
 * LLM Chat App Frontend
 *
 * Handles the chat UI interactions and communication with the backend API.
 */

// DOM elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

// Chat state
let chatHistory = [
  {
    role: "assistant",
    content:
      "Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?",
  },
];

let isProcessing = false;

// estado do tenant/flow
let tenantId = null;
let flow = {phase: 0};

// carrega perfis ao iniciar a página
const profileSelect = document.getElementById("profile-select");
const startFlowBtn = document.getElementById("start-flow");

fetch("/profiles").then(r => r.json()).then(({ profiles }) => {
  profiles.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.id} (${p.name})`;
    profileSelect.appendChild(opt);
  });
  tenantId = profiles?.[0]?.id || "clinica_demo";
  profileSelect.value = tenantId;
});

profileSelect?.addEventListener("change", () => {
  tenantId = profileSelect.value;
  // reset ao trocar de perfil
  chatMessages.innerHTML = `
    <div class="message assistant-message">
      <p>Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?</p>
    </div>`;
  chatHistory = [
    { role: "assistant", content: "Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?" }
  ];
  flow = { phase: 0 };
});

startFlowBtn?.addEventListener("click", async () => {
  // inicia o fluxo (fase 0 pede nome)
  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;
  typingIndicator.classList.add("visible");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory, tenantId, flow })
    });

    if (!response.ok) throw new Error("Failed to start flow");

    // stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";
    assistantMessageEl.innerHTML = "<p></p>";
    chatMessages.appendChild(assistantMessageEl);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.response) {
            responseText += json.response;
            assistantMessageEl.querySelector("p").textContent = responseText;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch { /* ignore parse */ }
      }
    }

    chatHistory.push({ role: "assistant", content: responseText });
    // após perguntar o nome, próxima fase = 1
    flow = { phase: 1 };

  } catch (e) {
    addMessageToChat("assistant", "Não consegui iniciar o fluxo agora.");
  } finally {
    typingIndicator.classList.remove("visible");
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
});

// Auto-resize textarea as user types
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Send message on Enter (without Shift)
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Send button click handler
sendButton.addEventListener("click", sendMessage);

/**
 * Sends a message to the chat API and processes the response
 */
async function sendMessage() {
  const message = userInput.value.trim();
  if (message === "" || isProcessing) return;

  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  addMessageToChat("user", message);
  userInput.value = "";
  userInput.style.height = "auto";
  typingIndicator.classList.add("visible");

  chatHistory.push({ role: "user", content: message });

  // promoção de fases simples no front:
  // phase 1: usuário informou o nome
  if (flow.phase === 1) {
    flow = { phase: 2, nome: message };
  }
  // phase 2: usuário informou o motivo (será usado no backend)
  // (flow.nome já foi setado acima)

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory, tenantId, flow })
    });

    if (!response.ok) throw new Error("Failed to get response");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";
    assistantMessageEl.innerHTML = "<p></p>";
    chatMessages.appendChild(assistantMessageEl);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.response) {
            responseText += json.response;
            assistantMessageEl.querySelector("p").textContent = responseText;
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch { /* ignore parse */ }
      }
    }

    chatHistory.push({ role: "assistant", content: responseText });

    // se estávamos na fase 2, backend gera acolhimento e encerramos o primeiro contato
    if (flow.phase === 2) {
      flow = { phase: 3, nome: flow.nome, motivo: message };
    }

  } catch (error) {
    addMessageToChat("assistant", "Sorry, there was an error processing your request.");
  } finally {
    typingIndicator.classList.remove("visible");
    isProcessing = false;
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}


/**
 * Helper function to add message to chat
 */
function addMessageToChat(role, content) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${role}-message`;
  messageEl.innerHTML = `<p>${content}</p>`;
  chatMessages.appendChild(messageEl);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
