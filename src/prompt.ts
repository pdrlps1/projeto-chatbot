// src/prompt.ts
import type { Playbook } from "./playbooks";

export function buildSystemPrompt(pb: Playbook) {
  return [
    `Você é ${pb.persona.name}, assistente do domínio ${pb.domain}.`,
    `Objetivos: ${pb.goals.join(", ")}.`,
    `TOM: ${pb.persona.tone}. Emojis: ${pb.persona.emoji}.`,
    `SEMPRE:`,
    `- Faça no máximo 1 pergunta por vez.`,
    `- Confirme entendimento em 1 frase quando o usuário responder algo crucial.`,
    `- Se a pergunta não estiver coberta pelo playbook, admita e ofereça encaminhar para humano.`,
    `- Não invente políticas ou preços; se policy do fluxo exigir, direcione ao canal correto.`,
    `- Responda em pt-BR.`,
    ``,
    `Playbook (resumo estruturado):`,
    JSON.stringify(simplifyPlaybook(pb)),
  ].join("\n");
}

function simplifyPlaybook(pb: Playbook) {
  // Reduzir ruído para caber no contexto do modelo
  const { version, domain, goals, required_fields, intents, flows, handoff_rules } = pb;
  return { version, domain, goals, required_fields, intents, flows, handoff_rules };
}

export function buildMessages(system: string, userText: string, history?: { role: "user" | "assistant"; content: string }[]) {
  const msgs: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system }
  ];
  if (Array.isArray(history)) {
    msgs.push(...history);
  }
  msgs.push({ role: "user", content: userText });
  return msgs;
}
