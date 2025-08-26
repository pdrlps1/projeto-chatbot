// src/playbooks.ts
export type IntentName = "agendar" | "preco" | "duvida_geral";
export type TenantId = "clinica_demo" | "imobiliaria_demo";

export interface Playbook {
  version: string;
  language: "pt-BR";
  domain: string;
  persona: {
    name: string;
    tone: "amigavel" | "profissional" | "neutro";
    emoji: "moderado" | "nenhum";
  };
  goals: string[];
  required_fields: string[];           // campos que precisamos capturar
  intents: { name: IntentName; utterances: string[] }[];
  flows: Record<
    string,
    {
      entry_intents?: IntentName[];
      rag_required?: boolean;
      policy?: string;
      fallback?: string;
      nodes?: {
        id: string;
        ask?: string;
        type?: "choice" | "text" | "summary";
        choices?: string[];
        validate?: { enum?: string[]; whatsapp?: boolean };
        capture?: string | string[];
        next?: string | Record<string, string>;
        complete?: boolean;
      }[];
    }
  >;
  handoff_rules: {
    incerteza_resposta?: string;
    palavras_gatilho?: string[];
  };
  privacy: { pii_masking: boolean; consent_required: boolean };
}

export const PLAYBOOKS: Record<TenantId, Playbook> = {
  clinica_demo: {
    version: "1.0.0",
    language: "pt-BR",
    domain: "clinica_dermatologica",
    persona: { name: "Ana", tone: "amigavel", emoji: "moderado" },
    goals: ["triagem", "agendamento", "qualificação"],
    required_fields: ["nome", "contato", "tipo_consulta"],
    intents: [
      { name: "agendar", utterances: ["marcar", "consulta", "horário", "agendar"] },
      { name: "preco", utterances: ["preço", "valor", "custa"] },
      { name: "duvida_geral", utterances: ["duvida", "informação", "atende"] },
    ],
    flows: {
      triagem_agendamento: {
        entry_intents: ["agendar"],
        nodes: [
          {
            id: "saudacao",
            ask: "Oi! Sou a Ana da Clínica Demo. Você quer agendar consulta, tirar dúvidas ou conhecer valores?",
            type: "choice",
            choices: ["Agendar", "Dúvidas", "Valores"],
            next: { Agendar: "tipo_consulta", "Dúvidas": "faq", Valores: "politica_precos" },
          },
          {
            id: "tipo_consulta",
            ask: "Qual o tipo de consulta? (Dermatológica geral, Estética, Retorno)",
            validate: { enum: ["Dermatológica geral", "Estética", "Retorno"] },
            capture: "tipo_consulta",
            next: "contato",
          },
          {
            id: "contato",
            ask: "Perfeito! Seu nome e um WhatsApp para confirmarmos?",
            validate: { whatsapp: true },
            capture: ["nome", "contato"],
            next: "confirmacao",
          },
          {
            id: "confirmacao",
            type: "summary",
            complete: true,
          },
        ],
      },
      faq: { rag_required: true },
      politica_precos: { policy: "nao_divulgar_preco", fallback: "encaminhar_recepcao" },
    },
    handoff_rules: {
      incerteza_resposta: "score < 0.65 => handoff",
      palavras_gatilho: ["falar com humano", "atendente", "reclamação"],
    },
    privacy: { pii_masking: true, consent_required: true },
  },

  imobiliaria_demo: {
    version: "1.0.0",
    language: "pt-BR",
    domain: "imobiliaria",
    persona: { name: "Leo", tone: "profissional", emoji: "nenhum" },
    goals: ["triagem", "encaminhar_corretor"],
    required_fields: ["nome", "contato", "tipo_operacao", "bairro"],
    intents: [
      { name: "agendar", utterances: ["visita", "ver imóvel", "agendar visita"] },
      { name: "preco", utterances: ["preço", "aluguel", "compra", "valor"] },
      { name: "duvida_geral", utterances: ["imóvel", "casa", "apartamento", "bairro"] },
    ],
    flows: {
      triagem: {
        entry_intents: ["duvida_geral", "agendar"],
        nodes: [
          {
            id: "saudacao",
            ask: "Olá! Sou o Leo da Imobiliária Demo. Você procura aluguel ou compra?",
            type: "choice",
            choices: ["Aluguel", "Compra"],
            capture: "tipo_operacao",
            next: "bairro",
          },
          {
            id: "bairro",
            ask: "Qual bairro você prefere?",
            capture: "bairro",
            next: "contato",
          },
          {
            id: "contato",
            ask: "Seu nome e um WhatsApp para enviarmos opções?",
            validate: { whatsapp: true },
            capture: ["nome", "contato"],
            next: "confirmacao",
          },
          { id: "confirmacao", type: "summary", complete: true },
        ],
      },
      politica_precos: { policy: "não_fixar_preço_sem_cadastrar", fallback: "encaminhar_corretor" },
    },
    handoff_rules: { incerteza_resposta: "score < 0.6 => handoff", palavras_gatilho: [] },
    privacy: { pii_masking: true, consent_required: true },
  },
};
