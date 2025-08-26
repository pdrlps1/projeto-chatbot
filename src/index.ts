// src/index.ts
import { PLAYBOOKS, type TenantId } from "./playbooks";
import { buildMessages, buildSystemPrompt } from "./prompt";

export interface Env {
  AI: Ai;            // binding do Workers AI
  MODEL?: string;    // opcional: ex.: "@cf/meta/llama-3.1-8b-instruct"
}

// util: stream de linhas JSON no formato que seu front já espera
function streamJsonLines(text: string): ReadableStream {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/); // mantém espaçamento
  let i = 0;

  return new ReadableStream({
    start(controller) {
      function push() {
        if (i >= words.length) {
          controller.close();
          return;
        }
        const chunk = JSON.stringify({ response: words[i++] }) + "\n";
        controller.enqueue(encoder.encode(chunk));
        // pequeno delay para “efeito digitação”
        setTimeout(push, 10);
      }
      push();
    }
  });
}

type ChatMsg = { role: "user" | "assistant"; content: string };
type Flow = { phase?: 0 | 1 | 2 | 3 | undefined; nome?: string; motivo?: string };

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);

    // lista perfis p/ preencher o <select>
    if (url.pathname === "/profiles" && req.method === "GET") {
      const items = Object.keys(PLAYBOOKS).map((id) => ({
        id,
        name: PLAYBOOKS[id as TenantId].domain
      }));
      return Response.json({ profiles: items });
    }

    // chat (streaming)
    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const body = await req.json().catch(() => ({})) as {
          messages?: ChatMsg[];
          tenantId?: TenantId;
          flow?: Flow;
        };

        const tenantId = (body.tenantId ?? "clinica_demo") as TenantId;
        const msgs = body.messages ?? [];
        const flow = body.flow ?? { phase: 0 };

        const pb = PLAYBOOKS[tenantId];
        if (!pb) {
          return Response.json({ error: `tenantId inválido: ${tenantId}` }, { status: 400 });
        }

        // 1) mini-fluxo (nome → motivo), sem gastar IA
        if (flow.phase === 0) {
          const stream = streamJsonLines("Olá! Para começar, qual é o seu nome?");
          return new Response(stream, { headers: { "Content-Type": "application/json" } });
        }

        // última mensagem do usuário
        const lastUser = [...msgs].reverse().find(m => m.role === "user")?.content?.trim() || "";

        if (flow.phase === 1) {
          const nome = lastUser || "cliente";
          const stream = streamJsonLines(`Prazer, ${nome}! Qual é o motivo do seu contato?`);
          return new Response(stream, { headers: { "Content-Type": "application/json" } });
        }

        if (flow.phase === 2 && flow.nome && !flow.motivo) {
          // 2) agora usamos IA para acolher no contexto do tenant
          const system = [
            buildSystemPrompt(pb),
            `NUNCA responda fora do domínio "${pb.domain}". Se fugir do escopo, ofereça encaminhar para humano.`,
            `Responda em pt-BR, breve, com no máximo uma pergunta por vez.`
          ].join("\n");

          const model = (env.MODEL ?? "@cf/meta/llama-3.1-8b-instruct") as keyof AiModels;

          const userSummary = [
            "Gere uma saudação de acolhimento e próximos passos, mantendo o contexto do domínio.",
            `Nome: ${flow.nome}`,
            `Motivo: ${lastUser || "não informado"}`
          ].join("\n");

          const response = await env.AI.run(model, {
            messages: [
              { role: "system", content: system },
              // histórico curto para manter tom
              ...msgs.slice(-6),
              { role: "user", content: userSummary },
            ]
          });

          const text = (response as any)?.response || "Obrigado! Vamos prosseguir com seu atendimento agora.";
          const stream = streamJsonLines(text);
          return new Response(stream, { headers: { "Content-Type": "application/json" } });
        }

        // fallback: se chegar aqui, só humaniza a última pergunta dentro do contexto
        {
          const system = buildSystemPrompt(pb);
          const model = (env.MODEL ?? "@cf/meta/llama-3.1-8b-instruct") as keyof AiModels;
          const response = await env.AI.run(model, { messages: [{ role: "system", content: system }, ...msgs.slice(-10)] });
          const text = (response as any)?.response || "Certo, como posso ajudar?";
          const stream = streamJsonLines(text);
          return new Response(stream, { headers: { "Content-Type": "application/json" } });
        }
      } catch (e: any) {
        return Response.json({ error: e?.message || "internal_error" }, { status: 500 });
      }
    }

    // sirva seu index.html e chat.js como já estão (se o template não fizer isso automaticamente)
    if (url.pathname === "/" && req.method === "GET") {
      // se o template já serve arquivos estáticos, ignore este bloco
      // você pode continuar usando o bundler do template
    }

    return new Response("Not found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;
