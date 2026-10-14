import React from 'react';
import { SugarContract } from '../types/market';
import { Layers, TrendingUp, Info, HelpCircle, ArrowRight, Gauge, AlertCircle } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';

interface WhitePremiumSpreadProps {
  whiteContract: SugarContract;
  rawContract: SugarContract;
  onOpenSpreadAlert: (spreadValue: number) => void;
}

export const WhitePremiumSpread: React.FC<WhitePremiumSpreadProps> = ({
  whiteContract,
  rawContract,
  onOpenSpreadAlert,
}) => {
  const whitePrice = whiteContract.pricePerTonUSD;
  const rawPrice = rawContract.pricePerTonUSD;
  const spread = Number((whitePrice - rawPrice).toFixed(2));
  const previousSpread = Number((whiteContract.previousCloseUSD - rawContract.previousCloseUSD).toFixed(2));
  const spreadChange = Number((spread - previousSpread).toFixed(2));
  const isPositive = spreadChange >= 0;

  // Margin status evaluation for sugar refiners
  let marginStatus = {
    label: 'Équilibrée / Rentable',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'La prime couvre les coûts de raffinage standard (énergie, sacs, transport) avec marge nette positive pour les raffineurs mondiaux.',
    percentageWidth: 65,
  };

  if (spread < 85) {
    marginStatus = {
      label: 'Compressée / Tendue',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      description: 'Marge faible. Les raffineries de réexport (Dubaï, Algérie, Égypte) tendent à réduire leur cadence de production.',
      percentageWidth: 35,
    };
  } else if (spread > 120) {
    marginStatus = {
      label: 'Très Rémunératrice',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      description: 'Marge excellente. Forte demande internationale pour le sucre blanc cristallisé 45 ICUMSA.',
      percentageWidth: 90,
    };
  }

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                White Sugar Premium (Spread d'Affinage)
              </h3>
              <HelpTooltip
                title="Le White Sugar Premium Expliqué"
                content="C'est la différence de prix entre le sucre blanc fini et le sucre brut de canne. Si ce chiffre est supérieur à 90 $/t, les raffineries gagnent bien leur vie. S'il tombe sous 85 $/t, le coût du raffinage n'est plus couvert."
                example="Spread = 554,80 $ (Blanc) - 450,85 $ (Brut) = 103,95 $/t."
              />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                W - SB ($/t)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">

              Différentiel de prix entre le Sucre Blanc n°5 (Londres) et le Sucre Brut n°11 (New York converti)
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenSpreadAlert(spread)}
          className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm"
        >
          Alerte sur le Spread
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-5 items-center">
        {/* Main Spread Value */}
        <div className="lg:col-span-5 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-1">
            Écart de Marché en Temps Réel
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-amber-300 font-mono tabular-nums tracking-tight">
              ${spread.toFixed(2)}
            </span>
            <span className="text-base font-medium text-slate-400">/ tonne</span>
          </div>

          <div className="flex items-center gap-2 mt-2 font-mono text-xs">
            <span
              className={`px-2 py-0.5 rounded font-semibold ${
                isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}${spreadChange.toFixed(2)} / t
            </span>
            <span className="text-slate-500">
              Précédent : ${previousSpread.toFixed(2)} / t
            </span>
          </div>

          {/* Breakdown equation */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ICE Londres N°5 (Blanc) :</span>
              <span className="font-semibold text-white">${whitePrice.toFixed(2)} / t</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">ICE New York N°11 (Brut) :</span>
              <span className="font-semibold text-white">-${rawPrice.toFixed(2)} / t</span>
            </div>
            <div className="flex items-center justify-between text-amber-400 pt-1 border-t border-slate-800/60 font-bold">
              <span>Prime nette de raffinage :</span>
              <span>=${spread.toFixed(2)} / tonne</span>
            </div>
          </div>
        </div>

        {/* Industrial Viability Gauge & Analysis */}
        <div className="lg:col-span-7 space-y-4">
          <div className={`p-4 rounded-xl border ${marginStatus.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Gauge className={`w-4 h-4 ${marginStatus.color}`} />
                <span className={marginStatus.color}>Santé Économique du Raffinage : {marginStatus.label}</span>
              </div>
              <span className="text-xs font-mono text-slate-400">Seuil de rentabilité ~85-95 $/t</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {marginStatus.description}
            </p>

            {/* Visual Gauge Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                <span>0 $/t (Déficit)</span>
                <span>85 $/t (Seuil Coûts)</span>
                <span>120 $/t (Marge Forte)</span>
                <span>160 $/t+</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full relative overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400"
                  style={{ width: `${Math.min(100, (spread / 160) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Practical Industry Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-slate-300">
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Pour les Négociants</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-normal">
                Un élargissement du spread incite à acheter du brut No. 11 et vendre du blanc No. 5 (arbitrage d’affinage tolleur).
              </p>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 text-slate-300">
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pour les Industriels</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-normal">
                Indique la pression de disponibilité immédiate sur les cargaisons de sucre blanc raffiné pour les importations alimentaires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
