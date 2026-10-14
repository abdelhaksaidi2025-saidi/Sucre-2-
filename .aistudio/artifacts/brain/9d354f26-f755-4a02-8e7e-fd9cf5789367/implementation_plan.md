# Courbe de Suivi des Prix en Temps Réel Multi-Horizons (Live Curve Streamer)

Module de suivi en continu ultra-fluide des cours mondiaux du sucre en dollars par tonne métrique ($/t) sur une courbe dynamique en temps réel, avec point lumineux pulsant en direct, défilement continu et sélecteur de fenêtres temporelles ajustables (de 1 minute à 1 jour).

***

### Décisions Validées & Paramètres Métier

> [!IMPORTANT]
> Les choix suivants ont été confirmés suite à votre retour :
> - **Échelles de temps supportées** : Palette complète allant de l'ultra-court terme au journalier : **1 minute (1m)**, **5 minutes (5m)**, **15 minutes (15m)**, **1 heure (1h)**, **4 heures (4h)** et **1 jour (1j)**.
> - **Style d'affichage de la courbe** : Courbe continue haute fidélité avec halo lumineux (*area gradient*), point de cotation en direct pulsant (*live beacon*), auto-ajustement des axes de prix ($/t) et réticule interactif d'inspection au survol.

***

### 1. Vue d'Ensemble & Concept Clé

- **Objectif** : Offrir aux opérateurs de marché et aux acheteurs un monitoring visuel direct et sans latence des micro-fluctuations du sucre (ICE Londres n°5 et ICE New York n°11), avec la liberté de changer instantanément la granularité temporelle.
- **Fonctionnement du Changement de Valeur Temps** :
  - **1m & 5m (Scalping & Micro-Ticks)** : Fenêtre glissante haute résolution affichant les mouvements tick par tick à la seconde près.
  - **15m & 1h (Intraday)** : Vue de la séance courante pour repérer les points d'inflexion et les accélérations de tendance.
  - **4h & 1j (Macro-séance)** : Vue d'ensemble de la journée avec fourchette haut/bas et cours de clôture de référence.
- **Normalisation Rigoureuse** : Les prix sur la courbe sont systématiquement tracés et mesurés en **USD par tonne métrique ($/t)** pour les deux contrats, avec conversion instantanée certifiée pour New York.

***

### 2. Expérience Utilisateur & Design Visuel

- **Composant `LivePriceCurve.tsx`** :
  - **Barre d'Outils Temporelle** : Boutons de sélection d'échelle (`1m`, `5m`, `15m`, `1h`, `4h`, `1j`) avec état actif ambre lumineux.
  - **Sélecteur de Contrat** : Bascule immédiate entre Londres N°5 (Blanc) et New York N°11 (Brut converti).
  - **Bandeau de Métriques de la Fenêtre Active** :
    - Prix actuel en direct (avec badge lumineux vert ou rouge)
    - Variation sur la période sélectionnée (ex : *+$1.20 / t sur les 5 dernières minutes*)
    - Plus Haut (High) et Plus Bas (Low) de la fenêtre
    - Volatilité locale en $/t
  - **Tracé de la Courbe SVG Haute Précision** :
    - Ligne continue lissée (`smooth bezier/monotone curve`) avec dégradé ambre/émeraude.
    - Point lumineux d'extrémité (*Live Pulse Marker*) : point clignotant en temps réel indiquant la dernière transaction.
    - Ligne de repère horizontale du cours actuel se projetant sur l'axe des prix à droite.
    - Réticule interactif avec infobulle affichant l'horodatage exact (HH:MM:SS) et le cours à chaque point.
  - **Contrôle de Vitesse du Flux** : Sélecteur de cadence de simulation (1s rapide, 2.5s normal, 5s lent, Pause).

***

### 3. Architecture Technique & Flux de Données

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Live Market Tick Engine                         │
│   - Flux tick-par-tick (Londres LSU $/t & New York SB $/t)             │
│   - Stockage en mémoire d'une série chronologique horodatée            │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Time-Window Aggregator / Filter                    │
│   - Découpage dynamique selon la fenêtre choisie :                     │
│     • 1m (60s glissantes)        • 1h (60 min glissantes)              │
│     • 5m (5 min glissantes)      • 4h (4 heures)                       │
│     • 15m (15 min glissantes)    • 1j (24 heures)                      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        LivePriceCurve Component                        │
│   - Rendu SVG responsive 60fps avec auto-scale des bornes min/max $/t │
│   - Point pulsant en direct (Live Ping Beacon)                         │
│   - Crosshair réticule d'inspection temporelle                         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Modèle de Données des Ticks de Courbe

```typescript
export type LiveTimeWindow = '1m' | '5m' | '15m' | '1h' | '4h' | '1j';

export interface LivePricePoint {
  timestamp: number;
  timeLabel: string;
  priceUSDPerTon: number;
  changeFromWindowOpen: number;
}
```

***

### 4. Plan de Réalisation par Étapes

1. **Génération & Buffer de Données Temporelles Multi-Échelles** :
   - Mise en place du générateur de points haute fréquence pour les fenêtres courtes (1m, 5m, 15m) et intra-journalières (1h, 4h, 1j).
2. **Développement du Composant `LivePriceCurve.tsx`** :
   - Tracé SVG haute fluidité, gradient d'aire, balise lumineuse pulsante en direct à l'extrémité droite, axes automatiques $/t.
3. **Barre de Contrôle Temporelle & Sélecteur de Contrat** :
   - Boutons de bascule rapide de la valeur temps (`1m`, `5m`, `15m`, `1h`, `4h`, `1j`), statistiques de la fenêtre active, et réglage de la vitesse du flux.
4. **Intégration dans le Tableau de Bord & Onglet Dédié** :
   - Intégration dans la vue principale du terminal et nouvel onglet d'accès direct « Courbe Direct ».
5. **Vérification & Validation** :
   - Vérification de la compilation et du linter (`compile_applet`, `lint_applet`).
