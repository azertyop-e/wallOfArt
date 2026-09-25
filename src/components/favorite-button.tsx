"use client";

import Link from "next/link";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import { setFavorite } from "@/lib/favorite-actions";
import type { FavoriteState } from "@/lib/favorites";

const labelClass =
  "inline-flex items-center gap-2 text-[10px] leading-3 font-medium uppercase transition-colors duration-300";

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2Z" />
    </svg>
  );
}

type FavoriteButtonProps = {
  slug: string;
};

export function FavoriteButton({ slug }: FavoriteButtonProps) {
  const [state, setState] = useState<FavoriteState | null>(null);
  const [favorited, setOptimisticFavorited] = useOptimistic(
    state?.favorited ?? false,
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/favorites/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: FavoriteState | null) => {
        if (data) setState(data);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [slug]);

  if (!state) {
    return (
      <span aria-hidden className={`${labelClass} invisible`}>
        <Heart filled={false} />
        Add to favorites
      </span>
    );
  }

  if (!state.signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/paintings/${slug}`)}`}
        className={`${labelClass} text-muted hover:text-foreground`}
      >
        <Heart filled={false} />
        Log in to add to favorites
      </Link>
    );
  }

  const toggle = () => {
    const next = !favorited;

    startTransition(async () => {
      setOptimisticFavorited(next);
      try {
        const saved = await setFavorite(slug, next);
        startTransition(() => setState({ signedIn: true, favorited: saved }));
      } catch {}
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={favorited}
      disabled={pending}
      className={`${labelClass} cursor-pointer ${
        favorited ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      <Heart filled={favorited} />
      {favorited ? "In your favorites" : "Add to favorites"}
    </button>
  );
}
