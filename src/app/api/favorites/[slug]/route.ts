import { type FavoriteState, isFavorite } from "@/lib/favorites";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/favorites/[slug]">,
) {
  const { slug } = await params;
  const session = await getSession();

  const state: FavoriteState = session
    ? { signedIn: true, favorited: await isFavorite(session.user.id, slug) }
    : { signedIn: false, favorited: false };

  return Response.json(state, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
