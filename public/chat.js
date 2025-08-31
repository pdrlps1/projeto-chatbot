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

// ----- Dashboard (MVP) -----
const statsFrom = document.getElementById("stats-from");
const statsTo = document.getElementById("stats-to");
const statsBtn = document.getElementById("stats-refresh");
const statsArea = document.getElementById("stats-area");

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}
function isoAddDays(iso, d) {
  const dt = new Date(iso + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + d);
  return dt.toISOString().slice(0, 10);
}

function renderStats(data) {
  const { totalContatos, contatosPorDia, topMotivos, ultimasConversas, range } =
    data;
  statsArea.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <div style="flex:1;min-width:180px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px;">
        <div style="color:#6b7280;font-size:12px;">Total de contatos</div>
        <div style="font-size:22px;font-weight:700;">${totalContatos}</div>
        <div style="color:#9ca3af;font-size:12px;">${range.from} → ${
    range.to
  }</div>
      </div>
      <div style="flex:2;min-width:260px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px;">
        <div style="color:#6b7280;font-size:12px;margin-bottom:6px;">Contatos por dia</div>
        <div style="font-family:monospace;white-space:pre-wrap;line-height:1.2;max-height:140px;overflow:auto;">${
          contatosPorDia.length
            ? contatosPorDia.map((d) => `${d.day}: ${d.count}`).join("\n")
            : "—"
        }</div>
      </div>
      <div style="flex:1;min-width:220px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px;">
        <div style="color:#6b7280;font-size:12px;margin-bottom:6px;">Top motivos</div>
        <ul style="margin-left:16px;">
          ${
            topMotivos.length
              ? topMotivos
                  .map((m) => `<li>${m.motivo} — <b>${m.count}</b></li>`)
                  .join("")
              : "<li>—</li>"
          }
        </ul>
      </div>
    </div>
    <div style="margin-top:10px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px;">
      <div style="color:#6b7280;font-size:12px;margin-bottom:6px;">Últimas conversas</div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="text-align:left;border-bottom:1px solid #e5e7eb;">
            <th style="padding:6px;">Data</th>
            <th style="padding:6px;">Nome</th>
            <th style="padding:6px;">Motivo</th>
            <th style="padding:6px;">Fase</th>
            <th style="padding:6px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            ultimasConversas.length
              ? ultimasConversas
                  .map(
                    (c) => `
                <tr>
                  <td style="padding:6px;border-bottom:1px solid #f3f4f6;">${
                    c.created_at
                  }</td>
                  <td style="padding:6px;border-bottom:1px solid #f3f4f6;">${
                    c.nome ?? "—"
                  }</td>
                  <td style="padding:6px;border-bottom:1px solid #f3f4f6;">${
                    c.motivo ?? "—"
                  }</td>
                  <td style="padding:6px;border-bottom:1px solid #f3f4f6;">${
                    c.phase
                  }</td>
                  <td style="padding:6px;border-bottom:1px solid #f3f4f6;">${
                    c.status
                  }</td>
                </tr>`
                  )
                  .join("")
              : `<tr><td colspan="5" style="padding:8px;color:#9ca3af;">—</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

async function loadStats() {
  if (!tenantId) return;
  const params = new URLSearchParams({
    tenantId,
    from: statsFrom.value || isoAddDays(isoToday(), -29),
    to: statsTo.value || isoToday(),
  });
  const res = await fetch(`/api/stats?${params.toString()}`);
  if (!res.ok) {
    statsArea.textContent = "Falha ao carregar métricas.";
    return;
  }
  const data = await res.json();
  renderStats(data);
}

// init datas (últimos 30 dias)
statsTo.value = isoToday();
statsFrom.value = isoAddDays(statsTo.value, -29);

// handlers
statsBtn?.addEventListener("click", loadStats);
profileSelect?.addEventListener("change", () => {
  // já recarrega as métricas ao trocar de perfil
  loadStats();
});

// carrega na primeira renderização (após perfis carregados)
setTimeout(loadStats, 600);
