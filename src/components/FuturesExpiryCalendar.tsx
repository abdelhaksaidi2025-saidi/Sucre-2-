import React, { useState, useMemo } from 'react';
import { ContractId, FuturesExpiry, SugarContract } from '../types/market';
import { FUTURES_EXPIRIES } from '../utils/marketData';
import { HelpTooltip } from './HelpTooltip';
import {
  Calendar,
  TrendingDown,
  TrendingUp,
  Clock,
  Ship,
  Info,
  Bell,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface FuturesExpiryCalendarProps {
  contracts: Record<ContractId, SugarContract>;
  onOpenAlertForPrice: (contractId: ContractId, targetPrice: number, label: string) => void;
}

export const FuturesExpiryCalendar: React.FC<FuturesExpiryCalendarProps> = ({
  contracts,
  onOpenAlertForPrice,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<ContractId>('ice-white-no5');
  const [hoveredExpiryId, setHoveredExpiryId] = useState<string | null>(null);

  const expiries = useMemo(() => {
    return FUTURES_EXPIRIES.filter((e) => e.contractId === selectedContractId);
  }, [selectedContractId]);

  // Determine market structure (Contango vs Backwardation)
  const marketStructure = useMemo(() => {
    if (expiries.length < 2) {
      return {
        type: 'NEUTRAL',
        label: 'Neutre',
        color: 'text-slate-400',
        bg: 'bg-slate-800 border-slate-700',
        diff: 0,
        desc: 'Données insuffisantes pour établir une structure à terme.',
      };
    }
    const promptPrice = expiries[0].priceUSDPerTon;

    const distantPrice = expiries[expiries.length - 1].priceUSDPerTon;
    const diff = distantPrice - promptPrice;

    if (diff < -5) {
      return {
        type: 'BACKWARDATION',
        label: 'Marché en Déport (Backwardation)',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        diff,
        desc: 'Les prix des échéances proches sont plus élevés que les échéances lointaines. Ce phénomène signale une forte demande immédiate ou une rareté physique à court terme sur les ports d’embarquement.',
      };
    } else if (diff > 5) {
      return {
        type: 'CONTANGO',
        label: 'Marché en Report (Contango)',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/30',
        diff,
        desc: 'Les prix futurs sont plus élevés que les prix au comptant, ce qui rémunère le stockage, le financement et l’assurance du sucre entre deux récoltes.',
      };
    } else {
      return {
        type: 'FLAT',
        label: 'Structure Neutre / Plate',
        color: 'text-slate-300',
        bg: 'bg-slate-800/80 border-slate-700',
        diff,
        desc: 'Écart faible entre les échéances successives.',
      };
    }
  }, [expiries]);

  // Forward Curve SVG dimensions
  const svgWidth = 840;
  const svgHeight = 240;
  const paddingX = 70;
  const paddingY = 40;

  const minPrice = useMemo(() => {
    const min = Math.min(...expiries.map((e) => e.priceUSDPerTon));
    return Math.floor(min - 5);
  }, [expiries]);

  const maxPrice = useMemo(() => {
    const max = Math.max(...expiries.map((e) => e.priceUSDPerTon));
    return Math.ceil(max + 5);
  }, [expiries]);

  const getX = (index: number) => {
    if (expiries.length <= 1) return svgWidth / 2;
    return paddingX + (index / (expiries.length - 1)) * (svgWidth - paddingX * 2);
  };

  const getY = (price: number) => {
    const range = maxPrice - minPrice || 1;
    return svgHeight - paddingY - ((price - minPrice) / range) * (svgHeight - paddingY * 2);
  };

  // Build SVG path for forward curve
  const curvePath = useMemo(() => {
    if (!expiries.length) return '';
    return expiries
      .map((e, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(e.priceUSDPerTon)}`)
      .join(' ');
  }, [expiries, minPrice, maxPrice]);

  const areaPath = useMemo(() => {
    if (!expiries.length) return '';
    const firstX = getX(0);
    const lastX = getX(expiries.length - 1);
    const bottomY = svgHeight - paddingY + 10;
    return `${curvePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [curvePath, expiries.length]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Calendrier des Échéances Futures & Courbe à Terme
            </h2>
            <HelpTooltip
              title="Qu'est-ce qu'une Échéance Future ?"
              content="En bourse, on n'achète pas le sucre pour aujourd'hui, mais pour un mois de livraison précis dans le futur. Chaque ligne représente un contrat avec une date limite de livraison physique au port."
              example="LSUZ26 = Sucre blanc livré en Décembre 2026. LSUM27 = Livré en Mars 2027."
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualisez la structure des cours à terme (Forward Curve) en $/tonne métrique et les dates limites de négociation et de livraison physique.
          </p>
        </div>

        {/* Contract Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setSelectedContractId('ice-white-no5')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              selectedContractId === 'ice-white-no5'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Londres N°5 (Blanc)
          </button>
          <button
            onClick={() => setSelectedContractId('ice-raw-no11')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              selectedContractId === 'ice-raw-no11'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New York N°11 (Brut)
          </button>
        </div>
      </div>

      {/* 1. Market Structure Indicator & Forward Curve Graphic */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              Courbe des Prix à Terme (Forward Curve)
            </span>
            <span className="text-xs font-mono text-slate-400">
              · Unité : $/Tonne Métrique
            </span>
            <HelpTooltip
              title="Comprendre la Forward Curve"
              content="Cette courbe relie les prix des différentes échéances dans le temps. Si elle descend (Backwardation), le marché est pressé d'avoir du sucre tout de suite. Si elle monte (Contango), le marché est calme et paye le stockage."
            />
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-semibold ${marketStructure.bg} ${marketStructure.color}`}
          >
            {marketStructure.type === 'BACKWARDATION' ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
            <span>{marketStructure.label}</span>
            <span className="font-mono text-[11px] opacity-90">
              ({marketStructure.diff > 0 ? '+' : ''}{marketStructure.diff.toFixed(2)} $/t)
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
          <strong className="text-amber-400 font-semibold font-sans">Diagnostic du Marché : </strong>
          {marketStructure.desc}
        </p>

        {/* SVG Forward Curve Canvas */}
        <div className="relative w-full h-[220px] sm:h-[260px] bg-slate-950/40 rounded-lg p-2 border border-slate-800/60 overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full select-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="forwardCurveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[minPrice, (minPrice + maxPrice) / 2, maxPrice].map((p, i) => {
              const y = getY(p);
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#1E293B"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    fill="#64748B"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    textAnchor="end"
                  >
                    ${p.toFixed(0)}/t
                  </text>
                </g>
              );
            })}

            {/* Area under curve */}
            <path d={areaPath} fill="url(#forwardCurveGradient)" />

            {/* Forward curve line */}
            <path
              d={curvePath}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {expiries.map((exp, i) => {
              const x = getX(i);
              const y = getY(exp.priceUSDPerTon);
              const isHovered = hoveredExpiryId === exp.id;

              return (
                <g
                  key={exp.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredExpiryId(exp.id)}
                  onMouseLeave={() => setHoveredExpiryId(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 7 : 5}
                    fill="#F59E0B"
                    stroke="#0B0F17"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                  {/* Price label above dot */}
                  <text
                    x={x}
                    y={y - 12}
                    fill={isHovered ? '#FFFFFF' : '#FBBF24'}
                    fontSize={isHovered ? '12' : '11'}
                    fontWeight="bold"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    ${exp.priceUSDPerTon.toFixed(2)}
                  </text>
                  {/* Month label below */}
                  <text
                    x={x}
                    y={svgHeight - 12}
                    fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                    fontSize="11"
                    fontFamily="Plus Jakarta Sans"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {exp.deliveryMonthName.split(' ')[0]} {exp.deliveryMonthName.split(' ')[1]?.slice(2)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. Detailed Expiries Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Calendrier Officiel des Échéances de Négociation & Livraison
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {expiries.length} échéances cotées
          </span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Code Contrat</th>
                <th className="py-2.5 px-3 font-sans">Mois d'Échéance</th>
                <th className="py-2.5 px-3 text-right">Cours ($/t)</th>
                <th className="py-2.5 px-3 text-right">Cotation Native</th>
                <th className="py-2.5 px-3 text-right">Spread vs Spot</th>
                <th className="py-2.5 px-3">Dernier Jour Cotation</th>
                <th className="py-2.5 px-3 font-sans">Fenêtre Livraison Port</th>
                <th className="py-2.5 px-3 text-right">Intérêt Ouvert</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expiries.map((exp) => {
                const isPrompt = exp.spreadFromPromptUSD === 0;
                return (
                  <tr
                    key={exp.id}
                    className={`hover:bg-slate-900/80 transition-colors ${
                      hoveredExpiryId === exp.id ? 'bg-amber-400/5' : ''
                    }`}
                    onMouseEnter={() => setHoveredExpiryId(exp.id)}
                    onMouseLeave={() => setHoveredExpiryId(null)}
                  >
                    {/* Code */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                        {exp.symbolCode}
                      </span>
                    </td>

                    {/* Month */}
                    <td className="py-3 px-3 font-sans font-medium text-white">
                      {exp.deliveryMonthName}
                      {isPrompt && (
                        <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          Échéance Active
                        </span>
                      )}
                    </td>

                    {/* Price USD/t */}
                    <td className="py-3 px-3 text-right font-bold text-white text-sm tabular-nums">
                      ${exp.priceUSDPerTon.toFixed(2)}
                      <span className="text-[10px] text-slate-500 font-normal ml-1">/t</span>
                    </td>

                    {/* Native Price */}
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      {exp.contractId === 'ice-white-no5'
                        ? `$${exp.nativePrice.toFixed(2)} / t`
                        : `${exp.nativePrice.toFixed(2)} ¢/lb`}
                    </td>

                    {/* Spread from prompt */}
                    <td
                      className={`py-3 px-3 text-right font-semibold tabular-nums ${
                        exp.spreadFromPromptUSD > 0
                          ? 'text-emerald-400'
                          : exp.spreadFromPromptUSD < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {exp.spreadFromPromptUSD === 0
                        ? 'Base'
                        : `${exp.spreadFromPromptUSD > 0 ? '+' : ''}${exp.spreadFromPromptUSD.toFixed(2)} $/t`}
                    </td>

                    {/* Last Trading Day */}
                    <td className="py-3 px-3 text-slate-300">
                      {exp.lastTradingDay}
                    </td>

                    {/* Physical Delivery Window */}
                    <td className="py-3 px-3 font-sans text-slate-400 flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{exp.deliveryWindow}</span>
                    </td>

                    {/* Open Interest */}
                    <td className="py-3 px-3 text-right text-slate-400 tabular-nums">
                      {exp.openInterest.toLocaleString('fr-FR')} lots
                    </td>

                    {/* Action: Alert button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() =>
                          onOpenAlertForPrice(
                            exp.contractId,
                            exp.priceUSDPerTon,
                            `Alerte ${exp.symbolCode} (${exp.deliveryMonthName})`
                          )
                        }
                        title={`Créer une alerte sur l'échéance ${exp.symbolCode}`}
                        className="p-1.5 rounded bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Novice Guide Callout Card on Expiries */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Fiche Pratique Débutant : Décoder les Mois des Contrats Futures</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Sur les marchés boursiers mondiaux, chaque mois de l'année est représenté par une lettre de code internationale :
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs font-mono">
          <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="font-bold text-amber-400 block text-sm">H</span>
            <span className="text-slate-400 text-[11px]">Mars</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="font-bold text-amber-400 block text-sm">K</span>
            <span className="text-slate-400 text-[11px]">Mai</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="font-bold text-amber-400 block text-sm">N</span>
            <span className="text-slate-400 text-[11px]">Juillet</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="font-bold text-amber-400 block text-sm">Q</span>
            <span className="text-slate-400 text-[11px]">Août</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="font-bold text-amber-400 block text-sm">V</span>
            <span className="text-slate-400 text-[11px]">Octobre</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 text-center">
            <span className="font-bold text-amber-400 block text-sm">Z</span>
            <span className="text-slate-400 text-[11px]">Décembre</span>
          </div>
        </div>
      </div>
    </div>
  );
};
