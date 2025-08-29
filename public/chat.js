/**
 * Chat frontend (refatorado e simplificado)
 * - Seleciona perfil (tenant)
 * - Cria sessão (/api/session) -> conversationId
 * - Envia mensagens (/api/chat) com streaming de resposta
 */

// DOM
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
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
userInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Envia com Enter (sem Shift)
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

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
