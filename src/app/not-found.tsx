import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted">That project does not exist, or has been renamed.</p>
      <Link
        href="/"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
      >
        Back to all projects
      </Link>
    </main>
  );
}
