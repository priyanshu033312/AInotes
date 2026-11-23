import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  Layers,
  ListChecks,
  MonitorPlay,
  Network,
  Presentation,
  Sparkles,
  UploadCloud,
  Wand2,
  Zap,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { HeroVisual } from "@/components/hero-visual";
import { Reveal } from "@/components/reveal";
import { Diagram } from "@/components/diagram";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { buildSampleDocument } from "@/lib/sample";

const features = [
  {
    icon: Wand2,
    title: "Notes that explain, not shorten",
    body: "Every section is rewritten the way a good teacher would: simpler language, the same technical accuracy, nothing invented.",
    tone: "from-accent/20",
  },
  {
    icon: Network,
    title: "Diagrams with real labels",
    body: "Flow charts, block diagrams, mind maps and comparison charts generated from the concept itself — not decorative stock images.",
    tone: "from-cyan/20",
  },
  {
    icon: BookOpenCheck,
    title: "Difficult concepts, step by step",
    body: "The topics students get stuck on are detected and rebuilt with numbered steps, a worked example and an analogy.",
    tone: "from-accent-2/20",
  },
  {
    icon: ListChecks,
    title: "Exam-ready revision",
    body: "Definitions, formulas, differences between similar concepts and likely exam questions, all in one revision sheet.",
    tone: "from-success/20",
  },
  {
    icon: Presentation,
    title: "A real .pptx download",
    body: "A designed presentation with your chapters, diagrams and formulas — generated with python-grade layout, editable in PowerPoint.",
    tone: "from-warn/20",
  },
  {
    icon: UploadCloud,
    title: "PDF and PowerPoint input",
    body: "Text, headings, tables and slide notes are extracted locally. Scanned PDFs are detected and reported honestly.",
    tone: "from-cyan/20",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload the source",
    body: "Drop a PDF or PPTX up to 25 MB. NoteWise extracts the text, headings and slide notes on your machine.",
  },
  {
    number: "02",
    title: "NoteWise reads the structure",
    body: "Chapters, definitions, formulas and the concepts that need extra explanation are identified before anything is written.",
  },
  {
    number: "03",
    title: "It teaches the material",
    body: "Each section becomes simple notes with steps, analogies and a labelled diagram. Technical facts stay untouched.",
  },
  {
    number: "04",
    title: "Study, revise, present",
    body: "Read in the workspace, ask questions about the document, export a PDF revision sheet and download the deck.",
  },
];

const outputs = [
  { label: "Short notes", detail: "Chapter-wise, sourced" },
  { label: "Simple explanations", detail: "Steps + analogies" },
  { label: "Visual learning", detail: "4 diagram types" },
  { label: "AI presentation", detail: "Editable .pptx" },
  { label: "Important questions", detail: "With answers" },
  { label: "Quick revision", detail: "Formulas + definitions" },
];

export default function LandingPage() {
  const sample = buildSampleDocument();
  const study = sample.study!;
  const exampleChapter = study.chapters[1];
  const exampleDiagram = study.diagrams[0];
  const concept = study.difficultConcepts[0];

  return (
    <div className="relative">
      <SiteNav />

      {/* ---------------- hero ---------------- */}
      <section className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:pb-28 lg:pt-20">
        <div>
          <Reveal>
            <Badge tone="accent" className="gap-2 px-3 py-1.5 text-[11.5px]">
              <Sparkles className="h-3 w-3" />
              AI study workspace for heavy documents
            </Badge>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 font-display text-[42px] font-semibold leading-[1.04] tracking-[-0.03em] text-ink sm:text-6xl lg:text-[64px]">
              Turn complex notes
              <br />
              into <span className="text-gradient">simple learning.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-muted sm:text-base">
              Upload a dense PDF or a 60-slide PowerPoint. NoteWise AI returns
              short notes that actually explain, labelled diagrams, a revision
              sheet and a presentation you can download and edit — built from{" "}
              <span className="text-ink">your</span> syllabus, not a generic template.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/upload" className={buttonClass("primary", "lg")}>
                <UploadCloud className="h-4 w-4" />
                Upload a document
              </Link>
              <Link href="/dashboard" className={buttonClass("outline", "lg")}>
                Open the dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-faint">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> PDF &amp; PPTX
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Works with OpenAI, Gemini or local rules
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Files stay on this machine
              </span>
            </div>
          </Reveal>
        </div>

        <HeroVisual />
      </section>

      {/* ---------------- metrics ---------------- */}
      <section id="outputs" className="border-y border-line/60 bg-base-soft/40">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px px-5 py-8 sm:px-8 lg:grid-cols-6">
          {outputs.map((output) => (
            <div key={output.label} className="px-2 py-3 text-center">
              <p className="font-display text-[13px] font-semibold text-ink">
                {output.label}
              </p>
              <p className="mt-1 text-[11.5px] text-faint">{output.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section id="features" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-2">
              What you get
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-[40px]">
              Six study outputs from one upload
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Not a summary tool. A study workspace that reads the document,
              understands the structure and teaches it back to you.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 0.05}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-line/70 bg-panel/50 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-panel/80">
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${feature.tone} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-base-soft text-accent-2">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <h3 className="relative mt-5 font-display text-[15.5px] font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="relative mt-2 text-[13.5px] leading-relaxed text-muted">
                    {feature.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- how it works ---------------- */}
      <section id="how-it-works" className="relative border-y border-line/60 bg-base-soft/30 py-24">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Reveal>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan">
                  How it works
                </span>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-[40px]">
                  From 24 pages to a study session
                </h2>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <p className="max-w-sm text-[13.5px] leading-relaxed text-muted">
                Every stage is reported live in the upload screen — extraction,
                topic detection, simplification, diagram generation and export.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.06}>
                <div className="relative h-full rounded-2xl border border-line/70 bg-panel/40 p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-accent-2">
                      {step.number}
                    </span>
                    {index < steps.length - 1 ? (
                      <ArrowRight className="hidden h-4 w-4 text-line lg:block" />
                    ) : (
                      <CheckCircle2 className="hidden h-4 w-4 text-success lg:block" />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-[14.5px] font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- live example ---------------- */}
      <section id="example" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Reveal>
              <Badge tone="cyan" className="gap-2">
                <Layers className="h-3 w-3" />
                Live example · bundled sample
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-[38px]">
                The output, not a mockup
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
                This is real generated material from a Thermal Engineering unit in
                the workspace. Open it, ask it questions, export the notes.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/workspace/sample-heat-exchangers"
                  className={buttonClass("primary", "md")}
                >
                  Open this document
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/presentations/sample-heat-exchangers"
                  className={buttonClass("outline", "md")}
                >
                  <MonitorPlay className="h-4 w-4" />
                  View the deck
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-9 rounded-2xl border border-line/70 bg-panel/40 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
                  Difficult concept · {concept.title}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                  {concept.simpleExplanation}
                </p>
                <p className="mt-3 text-[12.5px] italic text-faint">
                  “{concept.analogy}”
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="glass overflow-hidden rounded-3xl p-5 shadow-panel sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-accent-2">
                    Chapter {study.chapters.indexOf(exampleChapter) + 1} of{" "}
                    {study.chapters.length}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-semibold text-ink">
                    {exampleChapter.title}
                  </h3>
                </div>
                <Badge tone="success">{study.generatedBy === "ai" ? "AI" : "Local"}</Badge>
              </div>

              <p className="mt-4 text-[13.5px] leading-relaxed text-muted">
                {exampleChapter.summary}
              </p>

              <ul className="mt-4 space-y-2.5">
                {exampleChapter.keyPoints.slice(0, 4).map((point) => (
                  <li key={point} className="flex gap-2.5 text-[13px] leading-relaxed text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-xl border border-line/60 bg-base-soft/60 p-3">
                <Diagram spec={exampleDiagram} />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {exampleChapter.formulas.slice(0, 2).map((formula) => (
                  <div
                    key={formula.expression}
                    className="rounded-lg border border-line/60 bg-white/[0.02] p-3"
                  >
                    <p className="font-mono text-[11.5px] text-ink">
                      {formula.expression}
                    </p>
                    <p className="mt-1 text-[10.5px] leading-relaxed text-faint">
                      {formula.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal>
          <div className="panel-gradient relative overflow-hidden rounded-3xl border border-accent/25 px-6 py-14 text-center shadow-panel sm:px-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/25 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-cyan/20 blur-[120px]" />
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-2">
              Learn less complicated
            </p>
            <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-[42px]">
              Understand more.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted">
              Start with the bundled Thermal Engineering sample, or upload the
              document you have been avoiding all semester.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/upload" className={buttonClass("primary", "lg")}>
                <UploadCloud className="h-4 w-4" />
                Upload a document
              </Link>
              <Link href="/workspace/sample-heat-exchangers" className={buttonClass("secondary", "lg")}>
                Try the sample
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer className="border-t border-line/60 bg-base-soft/40">
        <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-sm">
              <Logo />
              <p className="mt-4 text-[13px] leading-relaxed text-muted">
                An AI study workspace that turns heavy academic documents into
                notes you can actually understand.
              </p>
              <p className="mt-4 font-display text-[12.5px] font-medium text-accent-2">
                Learn Less Complicated. Understand More.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-[13px] sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                  Workspace
                </p>
                <ul className="mt-3 space-y-2 text-muted">
                  <li><Link href="/dashboard" className="hover:text-ink">Dashboard</Link></li>
                  <li><Link href="/documents" className="hover:text-ink">My documents</Link></li>
                  <li><Link href="/notes" className="hover:text-ink">My notes</Link></li>
                  <li><Link href="/presentations" className="hover:text-ink">Presentations</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                  Study
                </p>
                <ul className="mt-3 space-y-2 text-muted">
                  <li><Link href="/revision" className="hover:text-ink">Revision sheets</Link></li>
                  <li><Link href="/upload" className="hover:text-ink">Upload</Link></li>
                  <li><Link href="/settings" className="hover:text-ink">AI settings</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                  Privacy
                </p>
                <p className="mt-3 leading-relaxed text-muted">
                  Files are stored in <span className="font-mono text-[11.5px]">storage/</span> on
                  this machine and never sent anywhere except your configured AI provider.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-line/60 pt-6 text-[11.5px] text-faint sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} NoteWise AI</p>
            <p>NoteWise AI · Learn Less Complicated. Understand More.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
