import React from 'react';
import { SugarContract, ContractId } from '../types/market';
import { TrendingUp, TrendingDown, Bell, Info, ArrowUpRight, ArrowDownRight, Scale, ShieldCheck } from 'lucide-react';
import { HelpTooltip } from './HelpTooltip';


interface ContractOverviewCardProps {
  contract: SugarContract;
  onOpenAlertForContract: (contractId: ContractId, currentPrice: number) => void;
  onSelectContract: (id: ContractId) => void;
}

export const ContractOverviewCard: React.FC<ContractOverviewCardProps> = ({
  contract,
  onOpenAlertForContract,
  onSelectContract,
}) => {
  const isPositive = contract.changeUSD >= 0;
  const dayRangeSpread = contract.dayHighUSD - contract.dayLowUSD;
  const currentRangePosition = dayRangeSpread > 0
    ? Math.max(0, Math.min(100, ((contract.pricePerTonUSD - contract.dayLowUSD) / dayRangeSpread) * 100))
    : 50;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
      {/* Top contract switcher & header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
              {contract.symbol}
            </span>
            <span className="text-xs text-slate-400">{contract.exchange}</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-300 font-mono">Échéance {contract.deliveryMonth}</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">
            {contract.name}
          </h2>
        </div>

        {/* Quick contract selection tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => onSelectContract('ice-white-no5')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              contract.id === 'ice-white-no5'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Londres N°5 (Blanc)
          </button>
          <button
            onClick={() => onSelectContract('ice-raw-no11')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              contract.id === 'ice-raw-no11'
                ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New York N°11 (Brut)
          </button>
        </div>
      </div>

      {/* Main pricing & conversion banner */}
      <div className="py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Big price display in USD / Tonne */}
        <div className="lg:col-span-5">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>Cours de Référence Officiel</span>
            <span className="text-emerald-400 text-[11px] font-mono">(Normalisé $/Tonne Métrique)</span>
            <HelpTooltip
              title="Prix en Dollars par Tonne Métrique"
              content="Toutes les cotations sont converties et unifiées en $/tonne (1 tonne = 1 000 kg). C'est l'unité internationale utilisée pour signer des contrats de cargaison maritime de sucre."
              example="554,80 $/t = 0,5548 $ par kilo FOB au port de chargement."
            />
          </div>


          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono tabular-nums">
              ${contract.pricePerTonUSD.toFixed(2)}
            </span>
            <span className="text-lg font-medium text-slate-400">/ tonne</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-sm font-semibold font-mono tabular-nums ${
                isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>
                {isPositive ? '+' : ''}${contract.changeUSD.toFixed(2)} / t
              </span>
              <span>({isPositive ? '+' : ''}{contract.changePercent.toFixed(2)}%)</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Clôture précéd. : ${contract.previousCloseUSD.toFixed(2)}
            </span>
          </div>

          {/* Formula disclosure for ICE No. 11 */}
          {contract.id === 'ice-raw-no11' && (
            <div className="mt-3 p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5 text-amber-400/90 font-sans font-medium text-[11px] mb-1">
                <Scale className="w-3.5 h-3.5" />
                <span>Conversion Bourse NY certifiée :</span>
              </div>
              <div className="text-slate-300">
                Cotation NY : <strong className="text-white">{contract.nativePrice.toFixed(2)} ¢/lb</strong>
                <span className="text-slate-500 mx-1.5">×</span>
                22.04622 = <strong className="text-amber-300">${contract.pricePerTonUSD.toFixed(2)} / MT</strong>
              </div>
            </div>
          )}

          {contract.id === 'ice-white-no5' && (
            <div className="mt-3 p-2.5 rounded bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400/90 font-sans font-medium text-[11px] mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Standard physique ICE Europe :</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Cotation native directe en USD par tonne métrique (1 lot = 50 MT de sucre blanc 45 ICUMSA).
              </div>
            </div>
          )}
        </div>

        {/* 24h High/Low bar & Trading stats */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
              <span>Plus Bas : ${contract.dayLowUSD.toFixed(2)}</span>
              <span className="text-slate-200 font-sans font-medium">Fourchette 24h</span>
              <span>Plus Haut : ${contract.dayHighUSD.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${currentRangePosition}%` }}
              />
            </div>
            <div className="flex justify-end text-[10px] text-slate-500 font-mono mt-1">
              Position actuelle : {currentRangePosition.toFixed(0)}% du range
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Offre (Bid)</div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">
                ${contract.bidPriceUSD.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{contract.bidSizeLots} lots</div>
            </div>
            <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/80">
              <div className="text-[11px] text-slate-400">Demande (Ask)</div>
              <div className="text-sm font-bold text-white font-mono tabular-nums">
                ${contract.askPriceUSD.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{contract.askSizeLots} lots</div>
            </div>
          </div>
        </div>

        {/* Volume & Quick Actions */}
        <div className="lg:col-span-3 space-y-3 bg-slate-900/40 p-3.5 rounded-lg border border-slate-800">
          <div>
            <div className="text-[11px] text-slate-400">Volume Total Échangé</div>
            <div className="text-base font-bold text-white font-mono tabular-nums">
              {contract.volumeLots.toLocaleString('fr-FR')} lots
            </div>
            <div className="text-xs text-amber-400/90 font-mono tabular-nums">
              ≈ {contract.volumeTonnes.toLocaleString('fr-FR')} tonnes métriques
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <div className="text-[11px] text-slate-400">Intérêt Ouvert (Open Interest)</div>
            <div className="text-sm font-semibold text-slate-200 font-mono tabular-nums">
              {contract.openInterest.toLocaleString('fr-FR')} contrats
            </div>
          </div>

          <button
            onClick={() => onOpenAlertForContract(contract.id, contract.pricePerTonUSD)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Créer une alerte de seuil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
