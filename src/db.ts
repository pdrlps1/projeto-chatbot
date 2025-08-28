export type Role = "user" | "assistant" | "system";

export async function getTenantBySlug(env: { DB: D1Database }, slug: string) {
  const { results } = await env.DB.prepare(
    "SELECT id, slug, name FROM tenants WHERE slug=?1 LIMIT 1"
  )
    .bind(slug)
    .all();
  return results?.[0] as { id: string; slug: string; name: string } | undefined;
}

export async function getTenantById(env: { DB: D1Database }, id: string) {
  const { results } = await env.DB.prepare(
    "SELECT id, slug, name FROM tenants WHERE id=?1 LIMIT 1"
  )
    .bind(id)
    .all();
  return results?.[0] as { id: string; slug: string; name: string } | undefined;
}

export async function createConversation(env: EnvLike, tenantId: string) {
  const stmt = env.DB.prepare(
    "INSERT INTO conversations (tenant_id) VALUES (?1) RETURNING id, phase, status, created_at"
  ).bind(tenantId);
  const { results } = await stmt.run();
  return results?.[0] as {
    id: string;
    phase: number;
    status: string;
    created_at: string;
  };
}

export async function getConversation(env: EnvLike, id: string) {
  const stmt = env.DB.prepare(
    "SELECT id, tenant_id, status, phase, nome, motivo, created_at FROM conversations WHERE id=?1"
  ).bind(id);
  const { results } = await stmt.all();
  return results?.[0] as any | undefined;
}

export async function updateConversation(
  env: EnvLike,
  id: string,
  patch: Partial<{
    phase: number;
    nome: string;
    motivo: string;
    status: string;
  }>
) {
  const sets: string[] = [];
  const binds: any[] = [];
  let i = 1;

  for (const [k, v] of Object.entries(patch)) {
    sets.push(`${k}=?${i++}`);
    binds.push(v);
  }
  binds.push(id);

  const sql = `UPDATE conversations SET ${sets.join(", ")} WHERE id=?${i}`;
  await env.DB.prepare(sql)
    .bind(...binds)
    .run();
}

export async function insertMessage(
  env: EnvLike,
  conversationId: string,
  role: Role,
  content: string
) {
  await env.DB.prepare(
    "INSERT INTO messages (conversation_id, role, content) VALUES (?1, ?2, ?3)"
  )
    .bind(conversationId, role, content)
    .run();
}

export async function listMessages(
  env: EnvLike,
  conversationId: string,
  limit = 12
) {
  const stmt = env.DB.prepare(
    "SELECT role, content FROM messages WHERE conversation_id=?1 ORDER BY created_at DESC LIMIT ?2"
  ).bind(conversationId, limit);
  const { results } = await stmt.all();
  // retorna em ordem cronológica
  return (results ?? []).reverse() as { role: Role; content: string }[];
}

type EnvLike = { DB: D1Database };
