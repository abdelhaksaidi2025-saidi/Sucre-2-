import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  TrendingUp,
  Layers,
  Scale,
  DollarSign,
  Search,
  CheckCircle2,
  Ship,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GlossaryTerm {
  term: string;
  category: 'CONTRATS' | 'UNITES' | 'TRADING' | 'LOGISTIQUE';
  definition: string;
  example?: string;
}

const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Tonne Métrique (MT)',
    category: 'UNITES',
    definition: 'L’unité standard internationale de référence dans le négoce physique du sucre. 1 tonne métrique équivaut exactement à 1 000 kilogrammes ou 2 204,62 livres (lbs).',
    example: 'Une cargaison standard de navire Supramax transporte environ 25 000 à 30 000 tonnes métriques.',
  },
  {
    term: 'Cents par Livre (USc/lb)',
    category: 'UNITES',
    definition: 'L’unité traditionnelle américaine utilisée à la bourse de New York pour le sucre brut n°11. Pour convertir des cents/livre en dollars/tonne, on multiplie par 22,04622.',
    example: '20,00 ¢/lb = (20 / 100) × 2 204,62 = 440,92 $/tonne.',
  },
  {
    term: 'Sucre Blanc N°5 (LSU)',
    category: 'CONTRATS',
    definition: 'Contrat à terme côté sur ICE Futures Europe à Londres. Il représente du sucre cristallisé blanc raffiné de haute pureté (max 45 ICUMSA), prêt à la consommation directe.',
    example: 'Négocié par lots de 50 tonnes métriques, coté nativement en dollars américains par tonne ($/t).',
  },
  {
    term: 'Sucre Brut N°11 (SB)',
    category: 'CONTRATS',
    definition: 'Le contrat de référence mondial côté sur ICE Futures US à New York pour le sucre roux brut centrifuge (base 96° de polarisation). Il doit être raffiné en usine avant d’être consommé.',
    example: 'Négocié en cents/lb, coté et converti dans SugarDesk en $/tonne.',
  },
  {
    term: 'White Sugar Premium (Marge de Raffinage)',
    category: 'TRADING',
    definition: 'Différence de prix entre 1 tonne de sucre blanc n°5 et 1 tonne de sucre brut n°11. Il rémunère le travail industriel des raffineries (énergie, chaux, sacs, main d’œuvre).',
    example: 'Si le blanc est à 550 $/t et le brut à 450 $/t, le spread est de 100 $/t (marge très rentable).',
  },
  {
    term: 'ICUMSA',
    category: 'CONTRATS',
    definition: 'Échelle internationale mesurant la couleur et la pureté du sucre. Plus le score est bas, plus le sucre est blanc et raffiné.',
    example: 'Sucre blanc standard n°5 : max 45 ICUMSA. Sucre brut n°11 : 600 à 1 200 ICUMSA.',
  },
  {
    term: 'FOB (Free on Board)',
    category: 'LOGISTIQUE',
    definition: 'Incoterm maritime : le vendeur livre la marchandise à bord du navire au port de départ. L’acheteur paye ensuite le transport maritime et l’assurance.',
    example: 'Un contrat "FOB Santos" signifie que le sucre est chargé au port brésilien de Santos.',
  },
  {
    term: 'CIF (Cost, Insurance and Freight)',
    category: 'LOGISTIQUE',
    definition: 'Incoterm maritime : le prix comprend la marchandise, le fret maritime et l’assurance jusqu’au port de destination de l’acheteur.',
    example: 'CIF Marseille ou CIF Alger = prix total rendu au port d’arrivée.',
  },
  {
    term: 'Bougie Japonaise (Candlestick / OHLC)',
    category: 'TRADING',
    definition: 'Représentation graphique montrant l’évolution d’un prix sur une période : cours d’ouverture (Open), plus haut (High), plus bas (Low) et cours de clôture (Close).',
    example: 'Une bougie verte indique que le prix a augmenté entre le début et la fin de la séance.',
  },
  {
    term: 'Carnet d’Ordres (Depth of Market)',
    category: 'TRADING',
    definition: 'Tableau en temps réel montrant toutes les intentions d’achat (Bid) et de vente (Ask) en attente sur la bourse.',
    example: 'Permet de voir s’il y a de gros acheteurs ou de gros vendeurs à un prix précis.',
  },
  {
    term: 'Contango (Report)',
    category: 'TRADING',
    definition: 'Situation de marché où les prix des échéances futures lointaines sont plus chers que les échéances immédiates. C’est la situation normale qui reflète le coût de stockage.',
  },
  {
    term: 'Backwardation (Déport)',
    category: 'TRADING',
    definition: 'Situation où le prix immédiat est plus cher que le prix futur. Cela indique une pénurie urgente de sucre physique disponible sur le marché.',
  },
];

export const BeginnerGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'bases' | 'premium' | 'chart' | 'orderbook' | 'glossary'>('bases');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');

  const filteredGlossary = GLOSSARY.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'TOUS' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Guide Pédagogique du Marché Boursier du Sucre
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprenez facilement chaque chiffre, indicateur et mécanisme boursier de l'application sans aucun jargon complexe.
          </p>
        </div>

        {/* Quick section links */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveSection('bases')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSection === 'bases'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Les Fondamentaux
          </button>
          <button
            onClick={() => setActiveSection('premium')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSection === 'premium'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Le White Premium
          </button>
          <button
            onClick={() => setActiveSection('chart')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSection === 'chart'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Lire un Graphique
          </button>
          <button
            onClick={() => setActiveSection('orderbook')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSection === 'orderbook'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            4. Le Carnet d'Ordres
          </button>
          <button
            onClick={() => setActiveSection('glossary')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSection === 'glossary'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5. Glossaire & Lexique
          </button>
        </div>
      </div>

      {/* SECTION 1: LES FONDAMENTAUX EN 3 MINUTES */}
      {activeSection === 'bases' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
              Chapitre 1
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Les Deux Rois du Marché Mondial : Sucre Blanc vs Sucre Brut
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pourquoi la bourse mondiale suit-elle deux contrats différents et comment lire les prix ?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* White sugar card */}
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">Sucre Blanc Raffiné N°5</span>
                <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  ICE Londres (LSU)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                C'est le sucre fini de table, blanc et cristallisé. Il est directement consommable par les ménages et les industriels (boissons, confiseries, biscuiteries).
              </p>
              <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                <div>• Cotation native : <strong className="text-white">USD par Tonne ($/t)</strong></div>
                <div>• Pureté : <strong className="text-emerald-400">45 ICUMSA (Ultra-pur)</strong></div>
                <div>• Lot standard de bourse : <strong>50 tonnes métriques</strong></div>
              </div>
            </div>

            {/* Raw sugar card */}
            <div className="bg-slate-900/70 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">Sucre Brut de Canne N°11</span>
                <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                  ICE New York (SB)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                C'est la matière première brute issue des champs de canne (Brésil, Inde, Thaïlande). Brunâtre et humide, il <strong>doit obligatoirement être raffiné</strong> en usine.
              </p>
              <div className="space-y-1.5 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                <div>• Cotation native : <strong className="text-white">Cents par livre (¢/lb)</strong></div>
                <div>• Polarisation : <strong className="text-amber-400">96° de saccharose</strong></div>
                <div>• Lot standard de bourse : <strong>50 long tons (≈ 50,8 t)</strong></div>
              </div>
            </div>
          </div>

          {/* Unit Conversion Explainer */}
          <div className="p-4 bg-amber-950/20 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>La Formule Magique de Conversion : Pourquoi 22,0462 ?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              À New York, les cours sont exprimés en <em>cents américains par livre (pound)</em>. Or, le reste du monde achète en <strong>tonnes métriques</strong>.
              Comme 1 tonne métrique contient exactement <strong>2 204,62 livres</strong>, la formule mathématique certifiée est :
            </p>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-center text-amber-300 font-bold">
              Prix en $/Tonne = Prix en ¢/lb × 22,04622
            </div>
            <div className="text-[11px] text-slate-400 font-mono text-center">
              Exemple : Si New York affiche 20,45 ¢/lb &rarr; 20,45 × 22,04622 = <strong className="text-white">450,85 $/tonne</strong>.
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LE WHITE PREMIUM EXPLIQUÉ */}
      {activeSection === 'premium' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
              Chapitre 2
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Le « White Sugar Premium » : La Marge Secrète des Raffineries
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Comprendre l'indicateur le plus surveillé au monde par les négociants et industriels.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>La Métaphore du Boulanger</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Imaginez un boulanger qui achète de la farine pour fabriquer du pain. S'il achète sa farine 1 € et vend son pain 1,20 €, il ne gagne que 0,20 € : ce n'est pas suffisant pour payer son four et son électricité. Mais s'il vend son pain 1,80 €, sa marge devient confortable.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              C'est exactement le rôle du <strong>White Sugar Premium</strong> : c'est la différence entre le prix du sucre raffiné blanc (le pain) et le sucre brut (la farine) :
            </p>
            <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center font-mono text-xs text-amber-400 font-bold">
              White Premium ($/t) = Sucre Blanc N°5 ($/t) - Sucre Brut N°11 ($/t)
            </div>
          </div>

          {/* Three zones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
              <span className="font-bold text-rose-400 block text-sm">&lt; 85 $/tonne</span>
              <span className="font-semibold text-white block">Marge Compressée / Danger</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Le coût industriel pour raffiner 1 tonne de sucre (énergie, eau, emballages, pertes de mélasse) est d'environ 85 à 95 $/t. Si le spread passe sous ce seuil, les usines perdent de l'argent et ferment leurs lignes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <span className="font-bold text-emerald-400 block text-sm">90 à 120 $/tonne</span>
              <span className="font-semibold text-white block">Marge Normale & Saine</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Le raffinage est rentable. Les grandes raffineries de réexportation côtières (Dubaï, Algérie, Égypte) tournent à plein régime pour alimenter le Moyen-Orient et l'Afrique.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <span className="font-bold text-amber-400 block text-sm">&gt; 125 $/tonne</span>
              <span className="font-semibold text-white block">Très Rémunérateur / Pénurie</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Signal d'une rareté immédiate de sucre blanc raffiné disponible. Les usines réalisent des bénéfices records et les acheteurs paient une forte surprime pour être livrés rapidement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: LIRE UN GRAPHIQUE EN CHANDELIERS */}
      {activeSection === 'chart' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
              Chapitre 3
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Comment Décoder un Graphique Financier en Chandeliers Japonais (OHLC)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chaque rectangle coloré résume la bataille entre acheteurs et vendeurs pendant une durée donnée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Candle Diagram */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex justify-center items-center gap-12">
              {/* Bullish Candle */}
              <div className="text-center font-mono">
                <div className="text-[10px] text-emerald-400 mb-1">Plus Haut (High)</div>
                <div className="w-0.5 h-6 bg-emerald-400 mx-auto"></div>
                <div className="w-12 h-20 bg-emerald-500/30 border-2 border-emerald-400 rounded-sm mx-auto flex flex-col justify-between p-1">
                  <span className="text-[9px] text-emerald-300 text-left">Clôture</span>
                  <span className="text-[9px] text-emerald-300 text-left">Ouverture</span>
                </div>
                <div className="w-0.5 h-6 bg-emerald-400 mx-auto"></div>
                <div className="text-[10px] text-emerald-400 mt-1">Plus Bas (Low)</div>
                <div className="text-xs font-sans font-bold text-emerald-400 mt-3">Bougie Verte (Hausse)</div>
              </div>

              {/* Bearish Candle */}
              <div className="text-center font-mono">
                <div className="text-[10px] text-rose-400 mb-1">Plus Haut (High)</div>
                <div className="w-0.5 h-6 bg-rose-400 mx-auto"></div>
                <div className="w-12 h-20 bg-rose-500/30 border-2 border-rose-400 rounded-sm mx-auto flex flex-col justify-between p-1">
                  <span className="text-[9px] text-rose-300 text-left">Ouverture</span>
                  <span className="text-[9px] text-rose-300 text-left">Clôture</span>
                </div>
                <div className="w-0.5 h-6 bg-rose-400 mx-auto"></div>
                <div className="text-[10px] text-rose-400 mt-1">Plus Bas (Low)</div>
                <div className="text-xs font-sans font-bold text-rose-400 mt-3">Bougie Rouge (Baisse)</div>
              </div>
            </div>

            {/* Explanation items */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <strong className="text-white block font-sans mb-0.5">Le Corps de la Bougie :</strong>
                <p className="text-slate-400 leading-relaxed">
                  Représente la différence entre le premier prix négocié (Ouverture) et le dernier prix (Clôture). Vert = le prix est monté, Rouge = le prix a baissé.
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <strong className="text-white block font-sans mb-0.5">Les Mèches (Wicks / Ombres) :</strong>
                <p className="text-slate-400 leading-relaxed">
                  Les traits fins au-dessus et en-dessous indiquent les extrêmes touchés pendant la période (le point culminant et le creux de la vague).
                </p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                <strong className="text-white block font-sans mb-0.5">Les Moyennes Mobiles (SMA 20 & SMA 50) :</strong>
                <p className="text-slate-400 leading-relaxed">
                  Les lignes bleues et violettes lissent les fluctuations journalières pour montrer la vraie direction de fond (tendance de fond haussière ou baissière).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: LE CARNET D'ORDRES & TRADING */}
      {activeSection === 'orderbook' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
              Chapitre 4
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Le Carnet d'Ordres & Les Transactions : Dans les Coulisses de la Bourse
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Comprendre comment se forment les prix en temps réel tick par tick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">Le Carnet d'Ordres (Depth of Market)</h4>
              <p className="text-slate-300 leading-relaxed">
                C'est la file d'attente visible de la bourse :
              </p>
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-300 font-mono">
                • <strong>Offre (Bid) en vert :</strong> Le prix maximum que les acheteurs sont prêts à payer en ce moment.
              </div>
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-300 font-mono">
                • <strong>Demande (Ask) en rouge :</strong> Le prix minimum auquel les vendeurs acceptent de céder leur sucre.
              </div>
              <p className="text-slate-400 leading-relaxed">
                Dès qu'un acheteur accepte le prix d'un vendeur, une transaction a lieu : c'est le <em>« Dernier Cours Traité »</em>.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">Qu'est-ce qu'un "Lot" de Sucre ?</h4>
              <p className="text-slate-300 leading-relaxed">
                En bourse, on ne commande pas des paquets de 1 kg. L'unité minimale de transaction est un <strong>contrat standardisé (Lot)</strong> :
              </p>
              <div className="space-y-2 font-mono bg-slate-950 p-3 rounded border border-slate-800 text-slate-300">
                <div>• 1 Lot de Sucre Blanc (Londres) = <strong className="text-amber-400">50 Tonnes Métriques</strong></div>
                <div>• 1 Lot de Sucre Brut (New York) = <strong className="text-amber-400">50 Long Tons (≈ 50,8 MT)</strong></div>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Si vous négociez 10 lots de sucre blanc, vous achetez l'équivalent de 500 tonnes de sucre cristallisé.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: GLOSSAIRE & RECHERCHE INTERACTIVE */}
      {activeSection === 'glossary' && (
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-lg space-y-5">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-amber-400 font-semibold uppercase tracking-wider">
                Chapitre 5
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Glossaire & Dictionnaire Pratique du Sucre
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Recherchez instantanément la définition de n'importe quel terme technique.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un terme (ex: FOB, ICUMSA)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['TOUS', 'CONTRATS', 'UNITES', 'TRADING', 'LOGISTIQUE'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'TOUS' ? 'Tous les Termes' : cat}
              </button>
            ))}
          </div>

          {/* Glossary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-white text-sm">{item.term}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {item.definition}
                  </p>
                </div>

                {item.example && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
                    <span className="text-amber-400 font-sans font-semibold">Exemple : </span>
                    {item.example}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredGlossary.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Aucun terme ne correspond à votre recherche « {searchTerm} ».
            </div>
          )}
        </div>
      )}
    </div>
  );
};
