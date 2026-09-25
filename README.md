# Wall of Art

Site de musée consacré à la peinture, construit avec Next.js (App Router). Il donne envie de découvrir des œuvres : on les explore sur un mur infini, on les filtre, on lit leur histoire, on garde ses favorites et on prépare sa visite.

Les données viennent d'une API publique d'œuvres d'art : [`api-museum.vercel.app`](https://api-museum.vercel.app).

## Stack

- **Next.js 16** (App Router, Turbopack, React Compiler) et **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configuration dans le CSS, sans `tailwind.config.js`)
- **GSAP** + `@gsap/react` pour les animations, **Lenis** pour le smooth scroll
- **Zustand** pour l'état global (préloader, verrouillage du scroll, panier de billets)
- **Better Auth** pour les comptes (email + mot de passe)
- **Drizzle ORM** + **Neon** (Postgres serverless) pour les utilisateurs et les favoris
- **Biome** pour le lint et le formatage
- Déploiement sur **Vercel**

## Fonctionnalités

| Route | Contenu | Rendu |
| --- | --- | --- |
| `/` | Hero animé avec une sélection d'œuvres | ISR (revalidation toutes les heures) |
| `/paintings` | Mur infini déplaçable, filtres (mouvement, type, artiste…) et recherche ; les filtres vivent dans les `searchParams` | Rendu dynamique (SSR) |
| `/paintings/[slug]` | Fiche complète d'une œuvre, description HTML, bouton favori, œuvres similaires, œuvre suivante | SSG via `generateStaticParams` + ISR |
| `/tickets` | Billetterie : tarifs, options et total mis à jour en direct | Statique (`force-static`), état côté client avec Zustand |
| `/about` | Présentation du musée, horaires, chiffres calculés à partir de la collection | ISR |
| `/login`, `/signup` | Connexion et inscription | Server Actions |
| `/account` | Profil et liste des favoris, protégés par `proxy.ts` | Dynamique |
| `/api/search` | Recherche plein texte utilisée par la barre de recherche en temps réel | Route Handler |

Autres éléments :

- **Préloader** affiché uniquement au premier chargement grâce au flag `isFirstRender` du store.
- **Transition de page** entre les routes (`src/components/providers/page-transition.tsx`).
- **Wrappers d'animation réutilisables** : `Reveal` (apparition au scroll) et `Parallax`.
- **SEO** : `metadata` et `generateMetadata` par page, Open Graph, image OG générée, `sitemap.ts` et `robots.ts`.
- **Images** via `next/image`, avec des miniatures Wikimedia pré-dimensionnées pour éviter de retélécharger les originaux.

## Structure

```
src/
├── app/          # Routes (App Router), metadata, sitemap, robots, route handlers
├── components/   # Composants UI : Server Components par défaut, "use client" pour tout ce qui anime
├── db/           # Client Drizzle et schéma (auth + favoris)
├── lib/          # Accès à l'API, filtres, recherche, auth, billets, config GSAP
├── stores/       # Stores Zustand (app, commande)
└── proxy.ts      # Redirige vers /login si /account est demandé sans session
drizzle/          # Migrations SQL
```

Les pages restent des Server Components qui récupèrent les données. Les parties interactives ou animées (GSAP, Lenis, stores) sont isolées dans de petits Client Components qui enveloppent le contenu rendu côté serveur.

## Lancer le projet

Prérequis : Node.js 20+ et une base Postgres (Neon par exemple).

```bash
npm install
```

Créer un fichier `.env.local` :

```bash
DATABASE_URL=postgres://...            # connexion poolée (runtime)
DATABASE_URL_UNPOOLED=postgres://...   # connexion directe (migrations), optionnelle
BETTER_AUTH_SECRET=...                 # chaîne aléatoire, ex. `openssl rand -base64 32`
```

Appliquer les migrations puis démarrer :

```bash
npm run db:migrate
npm run dev        # http://localhost:3000
```

### Scripts

```bash
npm run dev          # serveur de développement
npm run build        # build de production
npm run start        # sert le build de production
npm run lint         # biome check (lint + format + imports)
npm run format       # biome format --write
npm run db:generate  # génère une migration à partir du schéma
npm run db:migrate   # applique les migrations
npm run db:studio    # ouvre Drizzle Studio
```

## Mon avis sur Next.js

### Ce que j'ai aimé

- **Les conventions de nommage.** Il suffit de bien nommer un fichier ou un dossier pour qu'il soit tout de suite intégré : `page.tsx` crée une route, `[slug]` la rend dynamique, `not-found.tsx`, `sitemap.ts`, `robots.ts` ou `opengraph-image.tsx` sont pris en compte sans configuration. On passe moins de temps à câbler et plus de temps à construire.
- **L'écosystème.** Tout s'intègre bien autour de Next : `next/image`, `next/font`, les metadata pour le SEO, et des librairies comme Better Auth, Drizzle, GSAP ou Lenis qui fonctionnent sans friction. La documentation est fournie et la communauté est grande, donc on trouve facilement de l'aide.
- **Le déploiement rapide avec Vercel.** On connecte le dépôt et chaque push est déployé, avec une URL de preview par branche. Les stratégies de cache (SSG, ISR) sont gérées automatiquement en production.

### Ce qui m'a posé plus de difficultés

- **Le manque de typage en JavaScript.** En JS pur, j'ai plus de mal à savoir ce que contiennent les `params`, les réponses d'API ou les props. Je préfère utiliser Next avec TypeScript, ce que j'ai fait ici : les helpers `PageProps<"/route">` et `LayoutProps` générés par Next, ainsi que le type `Artwork` de l'API, rendent le code beaucoup plus sûr.
- **La rigueur qu'il faut s'imposer.** Next laisse beaucoup de liberté : Server ou Client Component, où récupérer les données, quelle stratégie de rendu choisir, où ranger les fichiers. Sans méthodologie claire, la codebase devient vite désordonnée. Il faut se contraindre à une organisation cohérente (dossiers `lib`, `components`, `stores`, Client Components aussi petits que possible, conventions de nommage) pour garder un projet propre et lisible.
