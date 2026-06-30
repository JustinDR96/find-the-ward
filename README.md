# Find the Ward 🎯

Une roue de la fortune pour explorer Tokyo. Tourne la roue, tombe sur une gare,
va découvrir le quartier. Pensé pour visiter la ville quartier par quartier —
y compris ceux qu'on ne connaîtrait jamais autrement.

> _Find the **ward**_ : trouve l'arrondissement.

## ✨ Fonctionnalités

- **Roue de la fortune** — une roue circulaire (un segment par gare, coloré selon
  la couleur officielle de sa ligne) avec animation de décélération réaliste.
  - **Bruit de roue** synthétisé (Web Audio API, aucun fichier audio) : les clics
    ralentissent avec la roue, comme une vraie roue à picots. Bouton muet.
  - **Languette** qui réagit au passage de chaque segment (petit coup + rebond),
    synchronisée avec le son.
  - Centre orné du **Sharingan** (`public/sharingan.jpeg`), qui tourne avec la roue.
- **3 modes de tirage** :
  - 🧭 **Découverte** — gares jamais visitées.
  - 🟡 **Cachets ratés** — gares déjà visitées dont le cachet reste à récupérer.
  - 🗺️ **Voyage** — tire une gare de départ, puis construit un **trajet optimisé**
    avec les gares proches à faire (découverte + cachets ratés), ordonné au plus
    court (3 à 5 gares).
- **Suivi des cachets** (_eki stamps_ 駅スタンプ) — chaque gare visitée a un statut :
  ⚪ pas de cachet / 🟡 à récupérer / 🟢 récupéré.
  - **Faux cachet généré** unique par gare (look tampon encreur, nom JP + romaji,
    motif, encre colorée) avec **animation de tamponnage** quand on le récupère.
- **Suivi des visites** — liste des gares visitées, pré-remplissage rapide,
  réinitialisation, compteur de cachets à reprendre.
- **Persistance locale** — tout est sauvegardé dans le navigateur (`localStorage`),
  sans compte ni serveur.

## 🚀 Démarrer

```bash
npm install
npm run dev
```

Puis ouvre [http://localhost:3000](http://localhost:3000).

> Le **son** ne s'entend que dans un vrai navigateur (il s'active au premier clic
> sur « Tourner la roue », contrainte des navigateurs sur l'autoplay audio).

### Scripts

| Script          | Rôle                                 |
| --------------- | ------------------------------------ |
| `npm run dev`   | Serveur de développement (Turbopack) |
| `npm run build` | Build de production                  |
| `npm run start` | Sert le build de production          |
| `npm run lint`  | ESLint                               |

## 🧱 Stack

- [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (style _radix-nova_) + [Radix UI](https://www.radix-ui.com)
- [Lucide](https://lucide.dev) (icônes)

L'appli est entièrement **côté client** (un seul écran) et se prérend en statique.

## 📁 Structure

```
app/
  layout.tsx        Layout racine (mode sombre forcé, métadonnées)
  page.tsx          Monte <FtwApp />
  globals.css       Thème + keyframes (animation de tamponnage)
components/
  ftw-app.tsx       Écran principal : modes, résultat, trajet, suivi
  wheel.tsx         La roue (SVG), son, languette, Sharingan central
  fake-stamp.tsx    Générateur de faux cachet (SVG, déterministe par gare)
  stamp-control.tsx Contrôle tri-état du cachet (+ mode compact)
  ui/               Composants shadcn (button, card, badge)
lib/
  stations.ts       Données : 49 gares curées, lignes + couleurs, coordonnées
  trip.ts           Distance (haversine) + construction de trajet optimisé
  use-visited.ts    Hook localStorage (visites + statut des cachets)
  utils.ts          cn()
public/
  sharingan.jpeg    Image du centre de la roue
```

## 🗾 Données

Les gares sont curées à la main dans [`lib/stations.ts`](lib/stations.ts) :
~49 gares « qui valent le détour » sur l'ensemble du rail de Tokyo (JR, métro Tokyo
Metro/Toei, lignes privées), avec nom JP + romaji, arrondissement, lignes (et leur
couleur officielle) et coordonnées GPS approximatives (pour l'optimisation de trajet).

**Volontairement, aucun « spot à voir » n'est suggéré** : le principe est de
découvrir chaque quartier soi-même sur place.

### Trajets

L'optimisation de trajet ([`lib/trip.ts`](lib/trip.ts)) est volontairement simple :
distance **à vol d'oiseau** (haversine), choix des gares les plus proches du départ,
puis ordre optimal exact par permutations (borné à 6 gares). Elle ne tient pas compte
du temps de transport réel ni des correspondances de lignes.

### Cachets (eki stamps)

Il n'existe pas d'API publique des cachets de gare. Le suivi est donc **manuel**
(tu indiques le statut), et le cachet affiché est un **faux** généré localement
(les designs réels appartiennent aux compagnies ferroviaires).

## 💾 Stockage

Aucune base de données : visites et statuts de cachets sont dans `localStorage`
(clé `ftw:visited`), local à l'appareil. Une synchro multi-appareils / un compte
sont envisageables mais non implémentés pour l'instant.

## 📝 Licence

Projet personnel.
