import { AlertTriangle, CheckCircle2, Database, KeyRound, ShieldCheck, XCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AiTestButton } from "@/components/settings/ai-test-button";
import { aiStatus, getAiConfig } from "@/lib/ai";
import { listDocuments } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

const ENV_SAMPLE = `# .env.local — never commit this file
AI_PROVIDER=openai          # openai | gemini | none
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini

# or, for Google Gemini
# AI_PROVIDER=gemini
# GEMINI_API_KEY=...
# GEMINI_MODEL=gemini-2.0-flash`;

export default async function SettingsPage() {
  const status = aiStatus();
  const config = getAiConfig();
  const documents = await listDocuments();
  const ready = documents.filter((doc) => doc.study).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="NoteWise reads its AI configuration from environment variables on the server. Keys are never sent to the browser and never appear in generated files."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-base-soft text-accent-2">
                  <KeyRound className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-[15px] font-semibold text-ink">
                    AI provider
                  </h2>
                  <p className="text-[11px] text-faint">
                    Used for notes, explanations and slide rewriting
                  </p>
                </div>
              </div>
              <Badge tone={status.configured ? "success" : "warn"}>
                {status.configured ? "connected" : "not configured"}
              </Badge>
            </div>

            <dl className="mt-5 space-y-2 text-[12px]">
              {[
                ["Provider", config.provider],
                ["Model", config.model],
                ["Endpoint", config.provider === "gemini" ? "generativelanguage.googleapis.com" : config.baseUrl],
                ["API key", config.apiKey ? `set (${config.apiKey.slice(0, 4)}…${config.apiKey.slice(-4)})` : "missing"],
                ["Max input characters", String(config.maxInputChars)],
                ["Document chat", config.chatEnabled ? "enabled" : "disabled"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft pb-2 last:border-0"
                >
                  <dt className="text-faint">{label}</dt>
                  <dd className="font-mono text-[11px] text-ink">{value}</dd>
                </div>
              ))}
            </dl>

            {status.configured ? (
              <div className="mt-4">
                <AiTestButton />
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-warn/25 bg-warn/[0.06] p-3">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" />
                <p className="text-[11.5px] leading-relaxed text-warn">
                  {status.reason} Until then, NoteWise uses local extraction: real
                  definitions and formulas from your file, but no rewritten
                  explanations.
                </p>
              </div>
            )}

            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Configure with .env.local
              </p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-line/60 bg-base-soft/70 p-3 font-mono text-[10.5px] leading-relaxed text-muted">
                {ENV_SAMPLE}
              </pre>
              <p className="mt-2 text-[11px] leading-relaxed text-faint">
                Restart the dev server after editing the file. Any OpenAI-compatible
                endpoint works — Groq, OpenRouter, Together, Azure OpenAI or a local
                Ollama server. Set <span className="font-mono">AI_PROVIDER=none</span> to
                force local mode.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-accent-2" />
                <h2 className="font-display text-[14px] font-semibold text-ink">
                  Storage
                </h2>
              </div>
              <dl className="mt-3 space-y-2 text-[11.5px]">
                <div className="flex justify-between">
                  <dt className="text-faint">Documents</dt>
                  <dd className="font-mono text-ink">{documents.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-faint">Processed</dt>
                  <dd className="font-mono text-ink">{ready}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-faint">Decks built</dt>
                  <dd className="font-mono text-ink">
                    {documents.filter((doc) => doc.presentation).length}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 rounded-lg border border-line/60 bg-base-soft/50 p-2.5 font-mono text-[10px] leading-relaxed text-faint">
                storage/uploads · storage/exports · storage/db.json
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-muted">
                A single-user local store. Deleting a document removes its upload and
                its exported deck immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <h2 className="font-display text-[14px] font-semibold text-ink">
                  What leaves this machine
                </h2>
              </div>
              <ul className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-muted">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                  Only extracted text is sent to your AI provider.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                  Uploaded files are never executed.
                </li>
                <li className="flex gap-2">
                  <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-danger" />
                  Nothing is sent to NoteWise — there is no NoteWise server.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-4">
        <CardContent className="p-5 sm:p-6">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            Honest limits of this build
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              [
                "Scanned PDFs need OCR",
                "If a PDF has no text layer, NoteWise reports it instead of inventing content. Run OCR first and upload the text version.",
              ],
              [
                "25 MB per file",
                "Large books should be split into units. The pipeline is designed for lecture notes and units, not entire libraries.",
              ],
              [
                "Diagrams are conceptual",
                "Diagrams are generated as labelled flow, block, mind-map and comparison charts. They are not photorealistic engineering drawings.",
              ],
              [
                "Local mode is extractive",
                "Without a model, notes quote and condense your document. No analogies, no rewritten explanations — and the UI says so everywhere.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="rounded-xl border border-line/60 bg-white/[0.02] p-3">
                <p className="text-[12px] font-medium text-ink">{title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
