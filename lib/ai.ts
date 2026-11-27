import "server-only";

export type AiProviderName = "openai" | "gemini" | "none";

export interface AiConfig {
  provider: AiProviderName;
  apiKey: string;
  baseUrl: string;
  model: string;
  maxInputChars: number;
  chatEnabled: boolean;
}

export interface AiStatus {
  configured: boolean;
  provider: AiProviderName;
  model: string;
  reason?: string;
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

/** Trim whitespace and strip accidental wrapping quotes from an env value. */
function envValue(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["'`]|["'`]$/g, "").trim();
}

function positiveInt(raw: string, fallback: number): number {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveProvider(): AiProviderName {
  const requested = envValue("AI_PROVIDER").toLowerCase();
  const openAiKey = envValue("AI_API_KEY");
  const geminiKey = envValue("GEMINI_API_KEY");

  if (requested === "none") return "none";

  // Honour the requested provider only when its key exists. Otherwise fall back
  // to whichever key was actually filled in, so a populated GEMINI_API_KEY is
  // never ignored just because AI_PROVIDER still says "openai".
  if (requested === "gemini") {
    if (geminiKey) return "gemini";
    if (openAiKey) return "openai";
    return "gemini";
  }
  if (openAiKey) return "openai";
  if (geminiKey) return "gemini";
  return "openai";
}

export function getAiConfig(): AiConfig {
  const provider = resolveProvider();

  const apiKey =
    provider === "gemini" ? envValue("GEMINI_API_KEY") : envValue("AI_API_KEY");

  const model =
    (provider === "gemini" ? envValue("GEMINI_MODEL") : envValue("AI_MODEL")) ||
    (provider === "gemini" ? "gemini-3.1-flash-lite" : "gpt-4o-mini");

  return {
    provider,
    apiKey,
    baseUrl: (envValue("AI_BASE_URL") || DEFAULT_BASE_URL).replace(/\/+$/, ""),
    model,
    maxInputChars: positiveInt(envValue("AI_MAX_INPUT_CHARS"), 48_000),
    chatEnabled: envValue("AI_ENABLE_CHAT") !== "false",
  };
}

export function aiStatus(): AiStatus {
  const config = getAiConfig();
  // Never spread the config here: the object is passed to server components and
  // must not carry the API key, even on the server.
  const status = { provider: config.provider, model: config.model };
  if (config.provider === "none") {
    return {
      ...status,
      configured: false,
      reason:
        "AI_PROVIDER is set to \"none\". NoteWise will use local, rule-based analysis.",
    };
  }
  if (!config.apiKey) {
    return {
      ...status,
      configured: false,
      reason:
        "No API key found. Add AI_API_KEY or GEMINI_API_KEY to .env.local and restart the server.",
    };
  }
  return { ...status, configured: true };
}

function extractJson<T>(raw: string): T {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    text = text.slice(start, end + 1);
  }
  return JSON.parse(text) as T;
}

interface ChatOptions {
  system: string;
  user: string;
  temperature?: number;
  json?: boolean;
  maxTokens?: number;
}

async function callOpenAi(config: AiConfig, options: ChatOptions) {
  const body: Record<string, unknown> = {
    model: config.model,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 6000,
    messages: [
      { role: "system", content: options.system },
      { role: "user", content: options.user },
    ],
  };
  if (options.json) body.response_format = { type: "json_object" };

  const send = async (payload: Record<string, unknown>) => {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(120_000),
    });
    return response;
  };

  let response = await send(body);
  if (!response.ok && options.json) {
    // Some OpenAI-compatible providers reject response_format — retry without it.
    const { response_format: _ignored, ...fallback } = body;
    response = await send(fallback);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `AI provider returned ${response.status}. ${detail.slice(0, 400)}`,
    );
  }
  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content.trim()) throw new Error("AI provider returned an empty response.");
  return content;
}

async function callGemini(config: AiConfig, options: ChatOptions) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.model,
  )}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: options.system }] },
      contents: [{ role: "user", parts: [{ text: options.user }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxTokens ?? 6000,
        ...(options.json ? { responseMimeType: "application/json" } : {}),
      },
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Gemini returned ${response.status}. ${detail.slice(0, 400)}`,
    );
  }
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const content =
    data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ??
    "";
  if (!content.trim()) throw new Error("Gemini returned an empty response.");
  return content;
}

export async function aiText(options: ChatOptions): Promise<string> {
  const config = getAiConfig();
  if (!config.apiKey || config.provider === "none") {
    throw new Error("AI is not configured.");
  }
  return config.provider === "gemini"
    ? callGemini(config, options)
    : callOpenAi(config, options);
}

export async function aiJson<T>(options: ChatOptions): Promise<T> {
  const raw = await aiText({ ...options, json: true });
  try {
    return extractJson<T>(raw);
  } catch {
    throw new Error("The AI response was not valid JSON. Try again.");
  }
}

export function aiModelLabel() {
  const config = getAiConfig();
  if (!config.apiKey) return "local";
  return `${config.provider}:${config.model}`;
}
