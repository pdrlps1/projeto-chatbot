// src/index.ts
import { PLAYBOOKS, type TenantId } from "./playbooks";
import { buildMessages, buildSystemPrompt } from "./prompt";

export interface Env {
  AI: Ai;                       // binding do Workers AI
  MODEL?: string;               // opcional: defina em vars do Worker, ex: "@cf/meta/llama-3.1-8b-instruct"
}

type ChatMsg = { role: "user" | "assistant"; content: string };

export default {
  async fetch(req, env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true, ts: new Date().toISOString() });
    }

    if (url.pathname === "/agent/respond" && req.method === "POST") {
      try {
        const body = (await req.json().catch(() => ({}))) as {
          tenantId?: TenantId;
          message?: string;
          history?: ChatMsg[];
        };

        const tenantId = (body.tenantId ?? "clinica_demo") as TenantId;
        const message = (body.message ?? "").trim();
        const history = body.history ?? [];

        if (!message) {
          return Response.json({ error: 'campo "message" é obrigatório' }, { status: 400 });
        }

        const pb = PLAYBOOKS[tenantId];
        if (!pb) {
          return Response.json({ error: `tenantId inválido: ${tenantId}` }, { status: 400 });
        }

        const system = buildSystemPrompt(pb);
        const messages = buildMessages(system, message, history);

        const model = (env.MODEL ?? "@cf/meta/llama-3.1-8b-instruct") as keyof AiModels;
        const result = await env.AI.run(model, { messages });

        // result.response é o texto gerado
        return Response.json({
          tenantId,
          reply: (result as any)?.response ?? "",
          model,
        });
      } catch (e: any) {
        return Response.json({ error: e?.message ?? "internal_error" }, { status: 500 });
      }
    }

    if (url.pathname === "/agent/playbook" && req.method === "GET") {
      const tenantId = (url.searchParams.get("tenantId") ?? "clinica_demo") as TenantId;
      const pb = PLAYBOOKS[tenantId];
      if (!pb) return Response.json({ error: `tenantId inválido: ${tenantId}` }, { status: 400 });
      return Response.json({ tenantId, playbook: pb });
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
