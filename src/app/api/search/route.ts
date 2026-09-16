import type { SearchResponse } from "@/lib/search";
import { searchArtworks } from "@/lib/search";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchArtworks(query);

  return Response.json({ query, results } satisfies SearchResponse);
}
