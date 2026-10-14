import React from 'react';
import { SugarContract, ContractId } from '../types/market';
import { TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface TickerBarProps {
  contracts: Record<ContractId, SugarContract>;
  selectedContractId: ContractId;
  onSelectContract: (id: ContractId) => void;
  flashContractId: ContractId | null;
  flashDirection: 'up' | 'down' | null;
}

export const TickerBar: React.FC<TickerBarProps> = ({
  contracts,
  selectedContractId,
  onSelectContract,
  flashContractId,
  flashDirection,
}) => {
  const whiteNo5 = contracts['ice-white-no5'];
  const rawNo11 = contracts['ice-raw-no11'];
  const whitePremium = Number((whiteNo5.pricePerTonUSD - rawNo11.pricePerTonUSD).toFixed(2));
  const whitePremiumChange = Number((whiteNo5.changeUSD - rawNo11.changeUSD).toFixed(2));

  return (
    <div className="bg-[#0D1420] border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto text-xs font-mono">
        {/* Ticker items */}
        <div className="flex items-center gap-6 divide-x divide-slate-800/60">
          {/* Item 1: White Sugar No. 5 */}
          <button
            onClick={() => onSelectContract('ice-white-no5')}
            className={`text-left pr-4 rounded transition-all flex items-center gap-3 ${
              selectedContractId === 'ice-white-no5' ? 'opacity-100' : 'opacity-85 hover:opacity-100'
            } ${
              flashContractId === 'ice-white-no5'
                ? flashDirection === 'up'
                  ? 'flash-up'
                  : 'flash-down'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 font-sans font-medium text-[11px]">
                <span className={selectedContractId === 'ice-white-no5' ? 'text-amber-400 font-bold' : ''}>
                  ICE Londres N°5 (Blanc)
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-slate-500">LSU</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold text-white tabular-nums tracking-tight">
                  ${whiteNo5.pricePerTonUSD.toFixed(2)}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">/tonne</span>
                </span>
                <span
                  className={`text-xs font-semibold tabular-nums flex items-center gap-0.5 ${
                    whiteNo5.changeUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {whiteNo5.changeUSD >= 0 ? '+' : ''}${whiteNo5.changeUSD.toFixed(2)} (
                  {whiteNo5.changePercent >= 0 ? '+' : ''}
                  {whiteNo5.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </button>

          {/* Item 2: Raw Sugar No. 11 */}
          <button
            onClick={() => onSelectContract('ice-raw-no11')}
            className={`text-left pl-6 pr-4 rounded transition-all flex items-center gap-3 ${
              selectedContractId === 'ice-raw-no11' ? 'opacity-100' : 'opacity-85 hover:opacity-100'
            } ${
              flashContractId === 'ice-raw-no11'
                ? flashDirection === 'up'
                  ? 'flash-up'
                  : 'flash-down'
                : ''
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 font-sans font-medium text-[11px]">
                <span className={selectedContractId === 'ice-raw-no11' ? 'text-amber-400 font-bold' : ''}>
                  ICE New York N°11 (Brut)
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] text-slate-500">SB · {rawNo11.nativePrice.toFixed(2)} ¢/lb</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold text-white tabular-nums tracking-tight">
                  ${rawNo11.pricePerTonUSD.toFixed(2)}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">/tonne</span>
                </span>
                <span
                  className={`text-xs font-semibold tabular-nums flex items-center gap-0.5 ${
                    rawNo11.changeUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {rawNo11.changeUSD >= 0 ? '+' : ''}${rawNo11.changeUSD.toFixed(2)} (
                  {rawNo11.changePercent >= 0 ? '+' : ''}
                  {rawNo11.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </button>

          {/* Item 3: White Sugar Premium Spread */}
          <div className="pl-6 hidden sm:block">
            <div className="flex items-center gap-1.5 text-slate-400 font-sans font-medium text-[11px]">
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Spread White Premium (Affinage)</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-amber-300 tabular-nums tracking-tight">
                ${whitePremium.toFixed(2)}
                <span className="text-[11px] font-normal text-slate-400 ml-1">/tonne</span>
              </span>
              <span
                className={`text-xs font-medium tabular-nums ${
                  whitePremiumChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {whitePremiumChange >= 0 ? '+' : ''}${whitePremiumChange.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-sans">
                (Marge raffineurs {whitePremium > 100 ? 'favorable' : 'modérée'})
              </span>
            </div>
          </div>
        </div>

        {/* Global session note */}
        <div className="hidden lg:flex items-center gap-3 text-slate-400 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-sans text-[11px]">Sessions Ouvertes : Londres & New York</span>
          </div>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400">Devise : USD ($)</span>
        </div>
      </div>
    </div>
  );
};
