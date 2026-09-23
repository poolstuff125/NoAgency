export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <h1 className="text-4xl font-semibold tracking-tight">NoAgency</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Base full-stack lista: Next.js, TypeScript, Tailwind, Drizzle y tests.
      </p>
      <a
        href="/api/health"
        className="w-fit rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Ver estado del sistema
      </a>
    </main>
  );
}
