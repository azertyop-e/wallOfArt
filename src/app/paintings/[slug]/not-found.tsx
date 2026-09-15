import Link from "next/link";

export default function PaintingNotFound() {
  return (
    <main className="flex min-h-svh flex-col justify-end gap-4 p-gutter text-xs leading-3 font-medium uppercase">
      <h1>Painting not found</h1>
      <Link
        href="/paintings"
        className="text-muted transition-colors duration-300 hover:text-foreground"
      >
        ← All paintings
      </Link>
    </main>
  );
}
