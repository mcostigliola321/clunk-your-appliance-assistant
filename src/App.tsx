export function App() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="max-w-2xl text-center" aria-labelledby="clunk-title">
        <p className="mx-auto mb-5 w-fit rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
          Fictional appliance demo
        </p>
        <h1 id="clunk-title" className="text-5xl font-semibold tracking-tight sm:text-6xl">
          Clunk
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Tell it what&apos;s broken. It shows you what to check and finds the exact part.
        </p>
      </section>
    </main>
  );
}
