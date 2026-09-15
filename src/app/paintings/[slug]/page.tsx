// Page de détail d'une œuvre : /paintings/[slug]
// Le dossier `[slug]` crée une route dynamique : `slug` est la partie variable
// de l'URL (ex. /paintings/la-nuit-etoilee → slug = "la-nuit-etoilee").
//
// Pas de "use client" en haut du fichier : c'est un Server Component.
// Tout le code ci-dessous s'exécute sur le serveur (ou au build) et le
// navigateur ne reçoit que le HTML généré, sans JavaScript pour cette page.

import type { Metadata } from "next";
// `Link` : navigation interne sans rechargement complet de la page.
import Link from "next/link";
// `notFound()` : interrompt le rendu et affiche la page 404 de Next.
import { notFound } from "next/navigation";
import { ArtworkCard } from "@/components/artwork-card";
// Wrapper autour de `next/image` (optimisation et redimensionnement des images).
import { ArtworkImage } from "@/components/artwork-image";
// Fonctions d'accès à l'API regroupées dans un seul module (src/lib/api.ts).
import {
  getArtwork,
  getArtworks,
  getRelatedArtworks,
  getTypeLabel,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Stratégie de rendu : SSG + ISR
// ---------------------------------------------------------------------------

// Prerender every known artwork at build time (SSG), then refresh hourly (ISR).
// Slugs added to the API later are rendered on demand.
//
// `revalidate = 3600` : la page générée reste en cache 3600 s (1 heure).
// Après ce délai, la visite suivante reçoit encore l'ancienne version, et Next
// régénère la page en arrière-plan pour les visiteurs d'après (ISR).
export const revalidate = 3600;

// Appelée au moment du `npm run build`. Elle renvoie la liste des valeurs de
// `slug` à pré-générer : Next crée une page HTML statique pour chaque œuvre
// (SSG). Format attendu : un tableau d'objets `{ slug: "..." }`.
export async function generateStaticParams() {
  const artworks = await getArtworks();
  return artworks.map((artwork) => ({ slug: artwork.slug }));
}

// La description de l'API est une chaîne HTML ("<p>Texte <em>...</em></p>").
// Les balises meta ne peuvent contenir que du texte brut, donc on remplace
// chaque balise par un espace, puis on fusionne les espaces multiples.
function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ") // supprime toutes les balises <...>
    .replace(/\s+/g, " ") // plusieurs espaces/retours à la ligne → un seul espace
    .trim(); // retire les espaces au début et à la fin
}

// ---------------------------------------------------------------------------
// SEO : métadonnées dynamiques (<title>, <meta description>, OpenGraph)
// ---------------------------------------------------------------------------

// Next appelle cette fonction avant le rendu pour remplir le <head> de la page.
// `PageProps<"/paintings/[slug]">` est un type généré automatiquement par Next :
// il sait que `params` contient un `slug` de type string.
export async function generateMetadata({
  params,
}: PageProps<"/paintings/[slug]">): Promise<Metadata> {
  // Depuis Next 15, `params` est une Promise : il faut l'`await`.
  const { slug } = await params;
  // Pas de double requête : `getArtworks` est mis en cache (voir src/lib/api.ts),
  // donc la page elle-même réutilisera ce résultat.
  const artwork = await getArtwork(slug);

  // Slug inconnu : on renvoie juste un titre. La page appellera `notFound()`.
  if (!artwork) return { title: "Painting not found — Museum" };

  // Ex. "La Nuit étoilée, Vincent van Gogh — Museum".
  // L'artiste n'est ajouté que s'il existe (champ optionnel dans l'API).
  const title = `${artwork.title}${artwork.artist ? `, ${artwork.artist}` : ""} — Museum`;
  // 155 caractères : longueur habituelle d'une meta description sur Google.
  const description = artwork.description
    ? `${stripHtml(artwork.description).slice(0, 155)}…`
    : undefined;

  return {
    title,
    description,
    // OpenGraph : titre, texte et image de l'aperçu quand on partage le lien
    // (réseaux sociaux, messageries…).
    openGraph: {
      title,
      description,
      images: artwork.image ? [{ url: artwork.image }] : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Composant de la page
// ---------------------------------------------------------------------------

// Un Server Component peut être `async` : on peut `await` les données directement
// dans le composant, sans `useEffect` ni état de chargement.
export default async function PaintingPage({
  params,
}: PageProps<"/paintings/[slug]">) {
  const { slug } = await params;
  const artwork = await getArtwork(slug);

  // Si aucune œuvre ne correspond au slug → page 404.
  // `notFound()` interrompt le rendu : TypeScript sait donc qu'après cette ligne
  // `artwork` n'est plus `undefined`.
  if (!artwork) notFound();

  // Liste des caractéristiques affichées dans le tableau de détails.
  // L'API peut omettre certains champs : le `.filter` retire les lignes vides
  // pour ne pas afficher « Year : » sans valeur.
  const details = [
    { label: "Artist", value: artwork.artist },
    { label: "Year", value: artwork.year },
    // `getTypeLabel` transforme la valeur brute de l'API ("woodblock print")
    // en libellé lisible ("Woodblock print").
    { label: "Type", value: getTypeLabel(artwork.type) },
    { label: "Movement", value: artwork.movement },
    { label: "Dominant color", value: artwork.color },
  ].filter((detail) => detail.value !== undefined && detail.value !== "");

  // The main image is often repeated as the first gallery item.
  // `?? []` : si `gallery` est absent, on utilise un tableau vide.
  const gallery = (artwork.gallery ?? []).filter(
    (src) => src !== artwork.image,
  );
  // Œuvres similaires calculées côté serveur (même mouvement, artiste, type…).
  const related = await getRelatedArtworks(artwork);

  return (
    // `p-gutter` : marge fluide de la grille (définie dans globals.css).
    // `pt-page-top` : espace en haut pour ne pas passer sous le header fixe.
    <main className="min-h-svh p-gutter pt-page-top">
      {/* Lien retour vers la liste des tableaux */}
      <Link
        href="/paintings"
        className="text-[10px] leading-3 font-medium text-muted uppercase transition-colors duration-300 hover:text-foreground"
      >
        ← All paintings
      </Link>

      {/* Bloc principal : image à gauche, infos à droite.
          Sur mobile les deux blocs sont empilés (flex-col), à partir de
          l'écran `lg` ils sont côte à côte (lg:flex-row). */}
      <article className="mt-10 flex flex-col gap-gutter lg:flex-row">
        {/* `condition && (<jsx>)` : n'affiche l'image que si elle existe. */}
        {artwork.image && (
          // Sticky wrapper + relative box: `fill` images need a relative parent.
          // On ultra-wide screens the height limits the image, so it needs fewer
          // columns (3 on 21:9, 2 on 32:9) to avoid a gap before the text.
          //
          // `lg:sticky` : sur desktop l'image reste visible pendant qu'on fait
          // défiler le texte à côté.
          // `span-w-4` : largeur de 4 colonnes de la grille (globals.css).
          <div className="w-full lg:sticky lg:top-page-top lg:self-start lg:span-w-4 wide:span-w-3 ultrawide:span-w-2">
            <div className="relative h-[60svh] lg:h-[calc(100svh-var(--spacing-page-top)-var(--spacing-gutter))]">
              <ArtworkImage
                src={artwork.image}
                alt={artwork.title}
                // `fill` : l'image remplit son parent (qui doit être `relative`)
                // au lieu d'avoir une largeur/hauteur fixes.
                fill
                // `preload` : image la plus importante de la page (LCP), le
                // navigateur la télécharge en priorité.
                preload
                // `sizes` indique la largeur affichée selon l'écran, pour que
                // Next envoie une image de taille adaptée (pas trop lourde).
                sizes="(min-width: 100rem) and (min-aspect-ratio: 32/9) 33vw, (min-width: 100rem) and (min-aspect-ratio: 21/9) 50vw, (min-width: 1024px) 66vw, 100vw"
                // `object-contain` : l'œuvre est affichée entière, sans recadrage.
                className="object-contain object-top-left"
              />
            </div>
          </div>
        )}

        {/* Colonne texte (2 colonnes de large sur desktop) */}
        <div className="flex flex-col gap-10 lg:span-w-2">
          <header>
            {/* Un seul <h1> par page : important pour le SEO */}
            <h1 className="text-4xl leading-none font-medium tracking-tight uppercase">
              {artwork.title}
            </h1>
            {artwork.artist && (
              <p className="mt-2 text-xs leading-3 font-medium text-muted uppercase">
                {artwork.artist}
                {/* L'année n'est ajoutée que si elle existe */}
                {artwork.year && `, ${artwork.year}`}
              </p>
            )}
          </header>

          {/* <dl> (liste de définitions) : balise sémantique adaptée aux
              paires « libellé / valeur ». <dt> = libellé, <dd> = valeur. */}
          <dl className="text-[10px] leading-3 font-medium uppercase">
            {/* `.map` crée une ligne par détail. `key` est obligatoire dans une
                liste pour que React identifie chaque élément. */}
            {details.map((detail) => (
              <div
                key={detail.label}
                className="flex justify-between gap-4 border-t border-foreground/10 py-2"
              >
                <dt className="text-muted">{detail.label}</dt>
                <dd className="text-right">{detail.value}</dd>
              </div>
            ))}
            {/* Le lieu est traité à part car il peut être un lien */}
            {artwork.location && (
              <div className="flex justify-between gap-4 border-y border-foreground/10 py-2">
                <dt className="text-muted">Location</dt>
                <dd className="text-right">
                  {/* Ternaire : un lien s'il y a une URL, sinon du texte simple */}
                  {artwork.locationLink ? (
                    // Lien externe : on utilise <a> et non <Link>, qui sert à
                    // la navigation interne. `target="_blank"` ouvre un nouvel
                    // onglet, `rel="noopener noreferrer"` empêche ce nouvel
                    // onglet d'accéder à notre page (sécurité).
                    <a
                      href={artwork.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-muted"
                    >
                      {artwork.location}
                    </a>
                  ) : (
                    artwork.location
                  )}
                </dd>
              </div>
            )}
          </dl>

          {/* Description de l'œuvre.
              L'API renvoie du HTML : afficher `{artwork.description}` montrerait
              les balises en texte. `dangerouslySetInnerHTML` injecte le HTML tel
              quel (à réserver aux sources de confiance, sinon risque de faille XSS).
              `[&_em]:italic` : sélecteur Tailwind qui cible les <em> à l'intérieur
              de cette div, car on ne peut pas mettre de classes dans le HTML reçu. */}
          {artwork.description && (
            <div
              className="max-w-[70ch] space-y-4 text-sm leading-relaxed [&_em]:italic [&_i]:italic [&_strong]:font-medium"
              dangerouslySetInnerHTML={{ __html: artwork.description }}
            />
          )}
        </div>
      </article>

      {/* Galerie : affichée seulement s'il reste des images secondaires */}
      {gallery.length > 0 && (
        <section className="mt-24">
          <h2 className="text-xs leading-3 font-medium uppercase">Gallery</h2>
          <ul className="mt-6 grid grid-cols-1 gap-gutter md:grid-cols-2 wide:grid-cols-3">
            {gallery.map((src, index) => (
              <li key={src} className="relative aspect-4/3 bg-neutral-100">
                <ArtworkImage
                  src={src}
                  alt={`${artwork.title} — view ${index + 2}`}
                  fill
                  sizes="(min-width: 100rem) and (min-aspect-ratio: 21/9) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-contain"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-xs leading-3 font-medium uppercase">
            Similar paintings
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-gutter gap-y-12 md:grid-cols-3 lg:grid-cols-6">
            {related.map((item) => (
              <li key={item.id}>
                <ArtworkCard
                  artwork={item}
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
