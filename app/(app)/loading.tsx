/**
 * Shown instantly while the next page's server render is in flight. Without
 * this, clicking a link leaves the old page frozen until the whole render
 * finishes, which made every navigation feel slow.
 */
export default function WorkspaceLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="animate-pulse">
        <div className="h-3 w-24 rounded bg-white/[0.06]" />
        <div className="mt-3 h-7 w-64 max-w-full rounded bg-white/[0.08]" />
        <div className="mt-3 h-3.5 w-full max-w-xl rounded bg-white/[0.05]" />

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[104px] rounded-2xl border border-line/60 bg-panel/30"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[76px] rounded-2xl border border-line/60 bg-panel/30"
              />
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-[150px] rounded-2xl border border-line/60 bg-panel/30" />
            <div className="h-[170px] rounded-2xl border border-line/60 bg-panel/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
