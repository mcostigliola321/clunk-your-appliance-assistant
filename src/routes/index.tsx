import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Clunk" },
      {
        name: "description",
        content:
          "Tell it what's broken. It shows you what to check and finds the exact part.",
      },
      { property: "og:title", content: "Clunk" },
      {
        property: "og:description",
        content:
          "Tell it what's broken. It shows you what to check and finds the exact part.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <p
          aria-label="Fictional appliance demo"
          className="mb-4 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          Fictional appliance demo
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Clunk
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell it what's broken. It shows you what to check and finds the exact
          part.
        </p>
      </div>
    </main>
  );
}
