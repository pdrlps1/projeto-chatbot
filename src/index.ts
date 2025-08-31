// src/index.ts

import {
  createConversation,
  getConversation,
  updateConversation,
  insertMessage,
  listMessages,
  getTenantBySlug,
  getTenantById,
} from "./db";
import { PLAYBOOKS, type TenantId } from "./playbooks";
import { buildMessages, buildSystemPrompt } from "./prompt";

export interface Env {
  AI: Ai; // binding do Workers AI
  DB: D1Database;
  MODEL?: string; // opcional: ex.: "@cf/meta/llama-3.1-8b-instruct"
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
    },
  });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}
function addDaysISO(baseISO: string, delta: number) {
  const d = new Date(baseISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

type ChatMsg = { role: "user" | "assistant"; content: string };
type Flow = {
  phase?: 0 | 1 | 2 | 3 | undefined;
  nome?: string;
  motivo?: string;
};

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);

    // lista perfis p/ preencher o <select>
    if (url.pathname === "/profiles" && req.method === "GET") {
      const items = Object.keys(PLAYBOOKS).map((id) => ({
        id,
        name: PLAYBOOKS[id as TenantId].domain,
      }));
      return Response.json({ profiles: items });
    }

    // POST /api/chat { conversationId, message }
    if (url.pathname === "/api/chat" && req.method === "POST") {
      try {
        const body = (await req.json().catch(() => ({}))) as {
          conversationId?: string;
          message?: string;
        };

        const message = (body.message ?? "").trim();
        if (!message)
          return Response.json(
            { error: 'campo "message" é obrigatório' },
            { status: 400 }
          );

        // compat: se não vier conversationId, cria uma sessão default
        let conversationId = body.conversationId;
        let conv = conversationId
          ? await getConversation(env, conversationId)
          : undefined;

        if (!conv) {
          // cria sessão default em clinica_demo
          const created = await createConversation(env, "t_clinica"); // ou mapeie pelo PLAYBOOKS se preferir
          conversationId = created.id;
          conv = await getConversation(env, conversationId);
          // saudação já foi inserida na rota /api/session; aqui seguimos direto
        }

        // Salva mensagem do usuário
        await insertMessage(env, conversationId!, "user", message);

        // Deriva tenant a partir do conversations.tenant_id → mapeie para seu PLAYBOOKS
        // Nesta sprint, vamos assumir:
        // t_clinica -> "clinica_demo", t_imob -> "imobiliaria_demo"
        const tenantMap: Record<string, TenantId> = {
          t_clinica: "clinica_demo",
          t_imob: "imobiliaria_demo",
        };
        // depois de obter 'conv'
        const tenant = await getTenantById(env, conv.tenant_id);
        const tenantSlug = (tenant?.slug ?? "clinica_demo") as TenantId;
        const pb = PLAYBOOKS[tenantSlug];

        // Mini-engine de fases no servidor
        const phase = Number(conv.phase ?? 0);

        if (phase === 0) {
          await updateConversation(env, conversationId!, { phase: 1 });
          const stream = streamJsonLines(
            "Olá! Para começar, qual é o seu nome?"
          );
          await insertMessage(
            env,
            conversationId!,
            "assistant",
            "Olá! Para começar, qual é o seu nome?"
          );
          return new Response(stream, {
            headers: { "Content-Type": "application/json" },
          });
        }

        if (phase === 1) {
          // assume a última msg como nome
          await updateConversation(env, conversationId!, {
            phase: 2,
            nome: message,
          });
          const reply = `Prazer, ${message}! Qual é o motivo do seu contato?`;
          await insertMessage(env, conversationId!, "assistant", reply);
          return new Response(streamJsonLines(reply), {
            headers: { "Content-Type": "application/json" },
          });
        }

        if (phase === 2) {
          // agora coletamos motivo e pedimos acolhimento ao modelo
          await updateConversation(env, conversationId!, {
            phase: 3,
            motivo: message,
          });

          const system = [
            buildSystemPrompt(pb),
            `NUNCA responda fora do domínio "${pb.domain}". Se fugir do escopo, ofereça encaminhar para humano.`,
            `Responda em pt-BR, breve, com no máximo uma pergunta por vez.`,
          ].join("\n");

          // histórico curto do DB
          const history = await listMessages(env, conversationId!, 12);
          const model = (env.MODEL ??
            "@cf/meta/llama-3.1-8b-instruct") as keyof AiModels;

          const userSummary = [
            "Gere uma saudação de acolhimento e próximos passos, mantendo o contexto do domínio.",
            `Nome: ${conv.nome ?? "cliente"}`,
            `Motivo: ${message}`,
          ].join("\n");

          const result = await env.AI.run(model, {
            messages: [
              { role: "system", content: system },
              ...history,
              { role: "user", content: userSummary },
            ],
          });

          const text =
            (result as any)?.response ||
            "Obrigado! Vamos prosseguir com seu atendimento.";
          await insertMessage(env, conversationId!, "assistant", text);
          return new Response(streamJsonLines(text), {
            headers: { "Content-Type": "application/json" },
          });
        }

        // fase >= 3 → conversa livre no contexto
        // fase >= 3 → conversa livre, sem recomeçar apresentação
        {
          const history = await listMessages(env, conversationId!, 12);
          const model = (env.MODEL ??
            "@cf/meta/llama-3.1-8b-instruct") as keyof AiModels;

          // estado atual da conversa, já com nome/motivo
          const state = [
            `ESTADO: fase=${conv.phase};`,
            `nome=${conv.nome ?? "cliente"};`,
            `motivo=${conv.motivo ?? "não informado"};`,
          ].join(" ");

          const system = [
            buildSystemPrompt(pb),
            // regras anti-repetição
            "Regra anti-repetição:",
            "- Você JÁ cumprimentou e JÁ coletou nome e motivo.",
            "- NÃO se apresente novamente.",
            "- NÃO peça o nome novamente.",
            "- Prossiga objetivamente no assunto do usuário, 1 pergunta por vez, dentro do domínio.",
          ].join("\n");

          const result = await env.AI.run(model, {
            messages: [
              { role: "system", content: system },
              { role: "system", content: state }, // deixa explícito pro modelo
              ...history,
            ],
          });

          const text =
            (result as any)?.response ||
            "Certo, vamos avançar a partir do que já combinamos.";
          await insertMessage(env, conversationId!, "assistant", text);
          return new Response(streamJsonLines(text), {
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (e: any) {
        return Response.json(
          { error: e?.message || "internal_error" },
          { status: 500 }
        );
      }
    }

    // POST /api/session { tenantId: <slug> }
    if (url.pathname === "/api/session" && req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as {
        tenantId?: TenantId;
      };
      const tenantSlug = (body.tenantId ?? "clinica_demo") as TenantId;

      // 1) resolve slug -> id no banco
      const tenantRow = await getTenantBySlug(env, tenantSlug);
      if (!tenantRow) {
        return Response.json(
          { error: `tenant não encontrado: ${tenantSlug}` },
          { status: 400 }
        );
      }

      // 2) cria conversa com o **id** real
      const conv = await createConversation(env, tenantRow.id);

      await insertMessage(
        env,
        conv.id,
        "assistant",
        "Olá! Para começar, qual é o seu nome?"
      );

      return Response.json({
        conversationId: conv.id,
        reply: "Olá! Para começar, qual é o seu nome?",
        phase: 1,
      });
    }

    // sirva seu index.html e chat.js como já estão (se o template não fizer isso automaticamente)
    if (url.pathname === "/" && req.method === "GET") {
      // se o template já serve arquivos estáticos, ignore este bloco
      // você pode continuar usando o bundler do template
    }

    // GET /api/stats?tenantId=clinica_demo&from=2025-08-01&to=2025-08-29
    if (url.pathname === "/api/stats" && req.method === "GET") {
      const tenantSlug = (url.searchParams.get("tenantId") ??
        "clinica_demo") as TenantId;
      const tenantRow = await getTenantBySlug(env, tenantSlug);
      if (!tenantRow)
        return Response.json(
          { error: `tenant não encontrado: ${tenantSlug}` },
          { status: 400 }
        );

      const to = url.searchParams.get("to") ?? todayISO();
      const from = url.searchParams.get("from") ?? addDaysISO(to, -29); // últimos 30 dias

      // total de contatos no período
      const totalQ = await env.DB.prepare(
        "SELECT COUNT(*) AS c FROM conversations WHERE tenant_id=?1 AND date(created_at) BETWEEN ?2 AND ?3"
      )
        .bind(tenantRow.id, from, to)
        .all();
      const totalContatos = Number(totalQ.results?.[0]?.c ?? 0);

      // por dia (para gráfico)
      const byDayQ = await env.DB.prepare(
        `SELECT substr(created_at,1,10) AS day, COUNT(*) AS c
     FROM conversations
     WHERE tenant_id=?1 AND date(created_at) BETWEEN ?2 AND ?3
     GROUP BY day ORDER BY day`
      )
        .bind(tenantRow.id, from, to)
        .all();
      const contatosPorDia = (byDayQ.results ?? []).map((r) => ({
        day: r.day,
        count: Number(r.c),
      }));

      // top motivos (normalizado simples)
      const motivosQ = await env.DB.prepare(
        `SELECT COALESCE(TRIM(LOWER(motivo)),'(vazio)') AS motivo, COUNT(*) AS c
     FROM conversations
     WHERE tenant_id=?1 AND motivo IS NOT NULL AND motivo != '' AND date(created_at) BETWEEN ?2 AND ?3
     GROUP BY motivo ORDER BY c DESC LIMIT 5`
      )
        .bind(tenantRow.id, from, to)
        .all();
      const topMotivos = (motivosQ.results ?? []).map((r) => ({
        motivo: r.motivo,
        count: Number(r.c),
      }));

      // últimas conversas
      const lastQ = await env.DB.prepare(
        `SELECT id, substr(created_at,1,16) AS created_at, nome, motivo, phase, status
     FROM conversations
     WHERE tenant_id=?1 AND date(created_at) BETWEEN ?2 AND ?3
     ORDER BY created_at DESC LIMIT 10`
      )
        .bind(tenantRow.id, from, to)
        .all();
      const ultimasConversas = lastQ.results ?? [];

      return Response.json({
        tenantId: tenantSlug,
        range: { from, to },
        totalContatos,
        contatosPorDia,
        topMotivos,
        ultimasConversas,
      });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
