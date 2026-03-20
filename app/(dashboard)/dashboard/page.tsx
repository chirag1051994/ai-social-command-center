export default function DashboardPlaceholderPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-[#13131f]/90 p-10 text-center shadow-[0_30px_80px_rgba(10,10,15,0.55)]">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary/70">
          PhootSuite
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Session ready.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Authentication is wired and `/dashboard` is now a valid post-login destination. The
          full command-center shell lands in the next phase.
        </p>
      </div>
    </main>
  );
}
