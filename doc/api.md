## Introduction

Cette API fournit des informations sur les recettes de l'univers Gastronogeek. Elle permet d'accéder à une liste complète des recettes ainsi qu'à des détails spécifiques pour chaque recette.

## Base URL

```
https://api-museum.vercel.app/
```

## Endpoints

### 1. Obtenir tous les tableaux

**GET** `/objects`

Retourne une liste de touts les tableaux disponibles.

### Réponse

La réponse est un tableau d'objets JSON, chaque objet représentant un tableau avec les propriétés suivantes :

- `id` (number) : L’ID du tableau
- `title` (string) : Le titre du tableau
- `year` (number) : Année de création
- `type` (string) : Le type d’œuvre (quasiment que des tableaux)
- `description` (string) : La description du tableau
- `image` (string) : Lien vers l’image principale
- `gallery` (string array) : Liens des images additionnelles
- `artist` (string) : L’artiste à l’origine du tableau
- `location` (string) : Localisation du tableau
- `locationLink` (string) : Lien vers le musée où se trouve l’œuvre
- `movement` (string) : Mouvement artistique
- `color` (string) : Couleur principale

### Exemple de réponse

```json
[
  {
    "id": 1,
    "title": "Starry Night",
    "year": 1889,
    "type": "painting",
    "description": "<p><strong>The Starry Night</strong>, painted in June 1889, represents one of <i>Vincent van Gogh's</i> most iconic masterpieces and a pinnacle of Post-Impressionist achievement. Created during his stay at the <em>Saint-Paul-de-Mausole asylum</em> in Saint-Rémy-de-Provence, this extraordinary work depicts the view from his east-facing window, enhanced by his vivid imagination.</p><p>The painting showcases van Gogh's revolutionary <strong>impasto technique</strong>, where paint was applied directly from the tube onto canvas, creating rich, textured surfaces that seem to pulse with energy. The swirling, turbulent sky dominates the composition, with <i>eleven swirling vortices</i> - a pattern that some scholars link to contemporary astronomical observations of nebulae.</p><p>The <strong>cypress tree</strong> in the foreground towers like a dark flame, connecting earth to the cosmic dance above. Van Gogh associated cypresses with death and eternal life, writing to his brother Theo that they were <i>'beautiful as an Egyptian obelisk'</i>. The small village below, with its church spire pointing heavenward, may combine memories of various locations including his native Netherlands.</p><p>Historically, this work was painted during a period of intense productivity despite van Gogh's mental struggles. In the year at Saint-Rémy, he produced <strong>nearly 150 paintings</strong>. The painting's symbolic significance extends beyond its visual impact - the swirling patterns may reflect contemporary astronomical discoveries or represent the artist's inner turmoil.</p><p>Remarkably, van Gogh himself criticized the work, calling it a <i>'failure'</i> in letters to his brother Theo, yet it has become a <strong>'touchstone of modern art'</strong> and one of the most recognizable paintings in Western civilization. The painting remained unsold during van Gogh's lifetime and is now valued as one of the most precious artworks in existence.</p>",
    "image": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/2560px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    "gallery": [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/2560px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
      "https://www.moma.org/media/W1siZiIsIjQ2NzUxNyJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=33c150bba5162a8e"
    ],
    "artist": "Vincent van Gogh",
    "location": "Museum of Modern Art, New York",
    "locationLink": "https://www.moma.org",
    "movement": "Post-impressionnisme",
    "color": "Bleu cobalt profond"
  },
  {
    "id": 2,
    "title": "Girl with a Pearl Earring",
    "year": 1665,
    "type": "painting",
    "description": "<p><strong>Girl with a Pearl Earring</strong>, often referred to as the <i>'Mona Lisa of the North'</i>, is Johannes Vermeer's most celebrated work and one of the most beloved paintings in art history. This <em>tronie</em> - a Dutch term for a character study that focuses on capturing mood and expression rather than depicting a specific person - demonstrates Vermeer's extraordinary mastery of light and color.</p><p>The painting's <strong>technical brilliance</strong> lies in Vermeer's use of <i>ultramarine pigment</i> for the turban, made from crushed lapis lazuli - more valuable than gold at the time. The luminous pearl, possibly not a real pearl but a polished piece of silver or tin, is rendered with just <strong>two brushstrokes</strong> of white paint with a touch of yellow, yet appears to glow with inner light.</p><p>The girl's <i>direct gaze</i> creates an intimate connection with viewers, enhanced by the <strong>dark background</strong> that makes her seem to emerge from shadow into light. Vermeer's signature technique of <em>'pointillés'</em> - small dots of light-colored paint - creates the illusion of light reflecting off surfaces, visible in the moisture on her lips and the highlights in her eyes.</p><p>Recent technical analysis has revealed <strong>fascinating details</strong>: the background was originally a deep green that has darkened over time, and the painting contains no preparatory drawing - Vermeer painted directly onto the canvas. The work's <i>mysterious quality</i> is enhanced by the unknown identity of the model and the painting's undocumented history before it resurfaced in 1881.</p><p>The painting has inspired numerous works of fiction, most famously Tracy Chevalier's 1999 novel and the subsequent film adaptation. Its <strong>cultural impact</strong> extends far beyond the art world, making it one of the most reproduced and recognized images in global popular culture.</p>",
    "image": "https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg",
    "gallery": [
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/d/d7/Meisje_met_de_parel.jpg"
    ],
    "artist": "Johannes Vermeer",
    "location": "Mauritshuis, The Hague",
    "locationLink": "https://www.mauritshuis.nl",
    "movement": "Âge d'or néerlandais",
    "color": "Bleu outremer et jaune doré"
  },
  // d'autres tableaux
]

```

### 2. Obtenir un tableau spécifique

**GET** `/objects/{slug}`

Retourne les détails d'un tableau spécifique basé sur son slug.

### Paramètres

- `slug` (string) : L'identifiant unique du tableau

### Réponse

La réponse est un objet JSON représentant le tableau, avec la même structure que dans la liste complète des tableaux.

## Gestion des erreurs

En cas d'erreur, l'API retournera un objet JSON avec une propriété `error` décrivant l'erreur.

### Exemples d'erreurs

- Tableau non trouvé (404) :
    
    ```json
    {
      "error": "Object not found"
    }
    
    ```
    
- Erreur serveur (500) :
    
    ```json
    {
      "error": "Failed to fetch objects"
    }
    
    ```
    

## Notes

- Toutes les URLs d'images sont des URLs complètes, incluant le protocole et le nom de domaine.
- Le champ `slug` peut être utilisé pour construire des URLs conviviales pour chaque tableau.
- Certains champs peuvent parfois manquer sur certains tableaux.