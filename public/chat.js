/**
<<<<<<< HEAD
 * LLM Chat App Frontend
 *
 * Handles the chat UI interactions and communication with the backend API.
 */

// DOM elements
=======
 * Chat frontend (refatorado e simplificado)
 * - Seleciona perfil (tenant)
 * - Cria sessão (/api/session) -> conversationId
 * - Envia mensagens (/api/chat) com streaming de resposta
 */

// DOM
>>>>>>> 50507d483f6515aa75cf5aef7a3980ea8e2a2d87
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
<<<<<<< HEAD

// Chat state
let chatHistory = [
  {
    role: "assistant",
    content:
      "Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?",
  },
];
let isProcessing = false;

// Auto-resize textarea as user types
=======
const profileSelect = document.getElementById("profile-select");
const startFlowBtn = document.getElementById("start-flow");

// Estado mínimo
let conversationId = null;
let tenantId = null;
let isProcessing = false;

// Utils
function addMessageToChat(role, content) {
  const el = document.createElement("div");
  el.className = `message ${role}-message`;
  el.innerHTML = `<p>${content}</p>`;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function setUIBusy(busy) {
  isProcessing = busy;
  userInput.disabled = busy;
  sendButton.disabled = busy;
  typingIndicator.classList.toggle("visible", busy);
}
async function streamAssistantResponse(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let responseText = "";

  const assistantEl = document.createElement("div");
  assistantEl.className = "message assistant-message";
  assistantEl.innerHTML = "<p></p>";
  chatMessages.appendChild(assistantEl);

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
          assistantEl.querySelector("p").textContent = responseText;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      } catch {
        /* ignora linhas inválidas */
      }
    }
  }
  return responseText;
}

// Carrega perfis (tenants) para o <select>
fetch("/profiles")
  .then((r) => r.json())
  .then(({ profiles }) => {
    profiles.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id; // slug, ex: "clinica_demo"
      opt.textContent = `${p.id} (${p.name})`;
      profileSelect.appendChild(opt);
    });
    tenantId = profiles?.[0]?.id || "clinica_demo";
    profileSelect.value = tenantId;
  })
  .catch(() => {
    addMessageToChat("assistant", "Não foi possível carregar os perfis.");
  });

// Troca de perfil: limpa conversa e estado
profileSelect?.addEventListener("change", () => {
  tenantId = profileSelect.value;
  conversationId = null;
  chatMessages.innerHTML = `
    <div class="message assistant-message">
      <p>Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?</p>
    </div>`;
});

// Inicia sessão (pergunta “nome” vem do backend)
startFlowBtn?.addEventListener("click", async () => {
  try {
    setUIBusy(true);
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId }),
    });
    if (!res.ok) throw new Error("Failed to start session");
    const data = await res.json();
    conversationId = data.conversationId || null;
    addMessageToChat(
      "assistant",
      data.reply || "Olá! Para começar, qual é o seu nome?"
    );
  } catch (e) {
    addMessageToChat("assistant", "Não consegui iniciar a conversa agora.");
  } finally {
    setUIBusy(false);
    userInput.focus();
  }
});

// Auto-resize do textarea
>>>>>>> 50507d483f6515aa75cf5aef7a3980ea8e2a2d87
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

<<<<<<< HEAD
// Send message on Enter (without Shift)
=======
// Envia com Enter (sem Shift)
>>>>>>> 50507d483f6515aa75cf5aef7a3980ea8e2a2d87
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

<<<<<<< HEAD
// Send button click handler
sendButton.addEventListener("click", sendMessage);

/**
 * Sends a message to the chat API and processes the response
 */
async function sendMessage() {
  const message = userInput.value.trim();

  // Don't send empty messages
  if (message === "" || isProcessing) return;

  // Disable input while processing
  isProcessing = true;
  userInput.disabled = true;
  sendButton.disabled = true;

  // Add user message to chat
  addMessageToChat("user", message);

  // Clear input
  userInput.value = "";
  userInput.style.height = "auto";

  // Show typing indicator
  typingIndicator.classList.add("visible");

  // Add message to history
  chatHistory.push({ role: "user", content: message });

  try {
    // Create new assistant response element
    const assistantMessageEl = document.createElement("div");
    assistantMessageEl.className = "message assistant-message";
    assistantMessageEl.innerHTML = "<p></p>";
    chatMessages.appendChild(assistantMessageEl);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send request to API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: chatHistory,
      }),
    });

    // Handle errors
    if (!response.ok) {
      throw new Error("Failed to get response");
    }

    // Process streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let responseText = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk
      const chunk = decoder.decode(value, { stream: true });

      // Process SSE format
      const lines = chunk.split("\n");
      for (const line of lines) {
        try {
          const jsonData = JSON.parse(line);
          if (jsonData.response) {
            // Append new content to existing text
            responseText += jsonData.response;
            assistantMessageEl.querySelector("p").textContent = responseText;

            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      }
    }

    // Add completed response to chat history
    chatHistory.push({ role: "assistant", content: responseText });
  } catch (error) {
    console.error("Error:", error);
    addMessageToChat(
      "assistant",
      "Sorry, there was an error processing your request.",
    );
  } finally {
    // Hide typing indicator
    typingIndicator.classList.remove("visible");

    // Re-enable input
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
=======
// Botão Enviar
sendButton.addEventListener("click", sendMessage);

// Envio de mensagem do usuário
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || isProcessing) return;

  // Se ainda não iniciou, cria a sessão automaticamente
  if (!conversationId) {
    try {
      setUIBusy(true);
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      conversationId = data.conversationId || null;
      addMessageToChat(
        "assistant",
        data.reply || "Olá! Para começar, qual é o seu nome?"
      );
    } catch {
      setUIBusy(false);
      addMessageToChat("assistant", "Não consegui iniciar a conversa agora.");
      return;
    } finally {
      setUIBusy(false);
    }
  }

  // UI imediata
  setUIBusy(true);
  addMessageToChat("user", message);
  userInput.value = "";
  userInput.style.height = "auto";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message }),
    });
    if (!response.ok) throw new Error("Failed to get response");
    await streamAssistantResponse(response);
  } catch (error) {
    addMessageToChat(
      "assistant",
      "Sorry, there was an error processing your request."
    );
  } finally {
    setUIBusy(false);
    userInput.focus();
  }
}
>>>>>>> 50507d483f6515aa75cf5aef7a3980ea8e2a2d87
