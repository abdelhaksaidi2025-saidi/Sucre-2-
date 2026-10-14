import React, { useState, useMemo, useRef } from 'react';
import { ContractId, LiveTimeWindow, LivePricePoint, SugarContract } from '../types/market';
import { HelpTooltip } from './HelpTooltip';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Gauge,
  Sliders,
  Play,
  Pause,
  Zap,
} from 'lucide-react';

interface LivePriceCurveProps {
  contract: SugarContract;
  points: LivePricePoint[];
  selectedWindow: LiveTimeWindow;
  onSelectWindow: (w: LiveTimeWindow) => void;
  onSelectContract: (id: ContractId) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  streamSpeedMs: number;
  onSelectSpeedMs: (speed: number) => void;
}

export const LivePriceCurve: React.FC<LivePriceCurveProps> = ({
  contract,
  points,
  selectedWindow,
  onSelectWindow,
  onSelectContract,
  isStreaming,
  onToggleStreaming,
  streamSpeedMs,
  onSelectSpeedMs,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Statistics for the selected time window
  const stats = useMemo(() => {
    if (!points.length) {
      return {
        open: contract.pricePerTonUSD,
        high: contract.pricePerTonUSD,
        low: contract.pricePerTonUSD,
        change: 0,
        changePercent: 0,
        volatility: 0,
      };
    }

    const open = points[0].priceUSDPerTon;
    const current = points[points.length - 1].priceUSDPerTon;
    let high = -Infinity;
    let low = Infinity;

    points.forEach((p) => {
      if (p.priceUSDPerTon > high) high = p.priceUSDPerTon;
      if (p.priceUSDPerTon < low) low = p.priceUSDPerTon;
    });

    const change = Number((current - open).toFixed(2));
    const changePercent = open > 0 ? Number(((change / open) * 100).toFixed(2)) : 0;
    const volatility = Number((high - low).toFixed(2));

    return { open, high, low, change, changePercent, volatility };
  }, [points, contract.pricePerTonUSD]);

  // SVG coordinate dimensions
  const chartWidth = 920;
  const chartHeight = 320;
  const paddingX = 20;
  const paddingRight = 65; // margin for right price axis labels
  const paddingTop = 25;
  const paddingBottom = 35;

  const { minPrice, maxPrice } = useMemo(() => {
    if (!points.length) return { minPrice: 500, maxPrice: 600 };
    let min = Infinity;
    let max = -Infinity;
    points.forEach((p) => {
      if (p.priceUSDPerTon < min) min = p.priceUSDPerTon;
      if (p.priceUSDPerTon > max) max = p.priceUSDPerTon;
    });

    // Add breathing room
    const spread = max - min;
    const pad = Math.max(0.40, spread * 0.12);
    return {
      minPrice: Number((min - pad).toFixed(2)),
      maxPrice: Number((max + pad).toFixed(2)),
    };
  }, [points]);

  const stepX = points.length > 1 ? (chartWidth - paddingX - paddingRight) / (points.length - 1) : 40;

  const getY = (price: number) => {
    const range = maxPrice - minPrice || 1;
    const usableH = chartHeight - paddingTop - paddingBottom;
    return chartHeight - paddingBottom - ((price - minPrice) / range) * usableH;
  };

  // Build smoothed or clean line path
  const linePath = useMemo(() => {
    if (!points.length) return '';
    return points
      .map((p, i) => {
        const x = paddingX + i * stepX;
        const y = getY(p.priceUSDPerTon);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [points, stepX, minPrice, maxPrice]);

  // Area under curve
  const areaPath = useMemo(() => {
    if (!points.length) return '';
    const firstX = paddingX;
    const lastX = paddingX + (points.length - 1) * stepX;
    const bottomY = chartHeight - paddingBottom;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, points.length, stepX]);

  // Price grid lines (4 horizontal benchmark levels)
  const priceGridLevels = useMemo(() => {
    const count = 4;
    const levels = [];
    const step = (maxPrice - minPrice) / (count - 1);
    for (let i = 0; i < count; i++) {
      levels.push(Number((minPrice + i * step).toFixed(2)));
    }
    return levels;
  }, [minPrice, maxPrice]);

  // Last live point position
  const lastPoint = points.length ? points[points.length - 1] : null;
  const lastX = lastPoint ? paddingX + (points.length - 1) * stepX : 0;
  const lastY = lastPoint ? getY(lastPoint.priceUSDPerTon) : 0;

  // Active hover point
  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : lastPoint;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xClient = e.clientX - rect.left;
    const relativeX = (xClient / rect.width) * chartWidth;
    const index = Math.round((relativeX - paddingX) / stepX);
    if (index >= 0 && index < points.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const isWindowPositive = stats.change >= 0;

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isStreaming ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Courbe de Suivi en Temps Réel Ultra-Fluide</span>
              <span className="text-xs font-mono text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-400/10">
                ${contract.pricePerTonUSD.toFixed(2)}/t
              </span>
            </h3>
            <HelpTooltip
              title="Courbe en Temps Réel & Valeur Temps"
              content="Cette courbe se met à jour automatiquement tick par tick à chaque transaction boursière. Utilisez les boutons de valeur temps (1m, 5m, 15m, 1h, 4h, 1j) pour zoomer sur les dernières secondes ou observer la tendance sur la journée entière."
              example="1m = 60 secondes de micro-mouvements. 1j = vue panoramique 24h."
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mise à jour tick-par-tick instantanée · {contract.name} ({contract.exchange})
          </p>
        </div>

        {/* Dual Contract Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => onSelectContract('ice-white-no5')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              contract.id === 'ice-white-no5'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Londres N°5 (Blanc)
          </button>
          <button
            onClick={() => onSelectContract('ice-raw-no11')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              contract.id === 'ice-raw-no11'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New York N°11 (Brut)
          </button>
        </div>
      </div>

      {/* Time Window Switcher & Speed Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
        {/* Time Value Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Valeur Temps :</span>
          </span>

          {(
            [
              { key: '1m', label: '1 min (Scalp)' },
              { key: '5m', label: '5 min' },
              { key: '15m', label: '15 min' },
              { key: '1h', label: '1 heure' },
              { key: '4h', label: '4 heures' },
              { key: '1j', label: '1 jour (24h)' },
            ] as { key: LiveTimeWindow; label: string }[]
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => onSelectWindow(item.key)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-lg transition-all ${
                selectedWindow === item.key
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Live streaming controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 hidden sm:inline">Cadence :</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onSelectSpeedMs(1000)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                streamSpeedMs === 1000 ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Flux rapide (1s)"
            >
              1s
            </button>
            <button
              onClick={() => onSelectSpeedMs(2500)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                streamSpeedMs === 2500 ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Flux standard (2.5s)"
            >
              2.5s
            </button>
            <button
              onClick={() => onSelectSpeedMs(5000)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                streamSpeedMs === 5000 ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Flux lent (5s)"
            >
              5s
            </button>
          </div>

          <button
            onClick={onToggleStreaming}
            className={`px-2.5 py-1 rounded-lg flex items-center gap-1 border transition-colors ${
              isStreaming
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isStreaming ? 'Pause' : 'Reprendre'}</span>
          </button>
        </div>
      </div>

      {/* Time Window KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 font-sans">Cours en Direct ($/t)</div>
          <div className="text-xl font-extrabold text-white mt-0.5 tabular-nums">
            ${contract.pricePerTonUSD.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Flux actif</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 font-sans">Variation ({selectedWindow})</div>
          <div
            className={`text-xl font-extrabold mt-0.5 tabular-nums flex items-center gap-1 ${
              isWindowPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isWindowPositive ? '+' : ''}${stats.change.toFixed(2)} / t
          </div>
          <div className="text-[10px] text-slate-400">
            {isWindowPositive ? '+' : ''}{stats.changePercent.toFixed(2)}% sur la fenêtre
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 font-sans">Extrêmes Fenêtre</div>
          <div className="text-sm font-bold text-white mt-1 tabular-nums">
            H : <span className="text-emerald-400">${stats.high.toFixed(2)}</span>
          </div>
          <div className="text-sm font-bold text-white tabular-nums">
            B : <span className="text-rose-400">${stats.low.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] text-slate-400 font-sans">Volatilité / Écart</div>
          <div className="text-xl font-extrabold text-amber-300 mt-0.5 tabular-nums">
            ${stats.volatility.toFixed(2)} / t
          </div>
          <div className="text-[10px] text-slate-400">
            {points.length} cotations horodatées
          </div>
        </div>
      </div>

      {/* Floating Cursor Inspection Bar */}
      {activePoint && (
        <div className="py-2 px-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Horodatage : <strong className="text-white">{activePoint.timeLabel}</strong></span>
            </span>
            <span>
              Cours : <strong className="text-amber-400 text-sm">${activePoint.priceUSDPerTon.toFixed(2)} / t</strong>
            </span>
            <span className="text-slate-400">
              Écart ouverture :{' '}
              <strong
                className={
                  activePoint.priceUSDPerTon >= stats.open ? 'text-emerald-400' : 'text-rose-400'
                }
              >
                {activePoint.priceUSDPerTon >= stats.open ? '+' : ''}
                {(activePoint.priceUSDPerTon - stats.open).toFixed(2)} $/t
              </strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 hidden sm:block">
            Glissez la souris sur la courbe pour inspecter chaque seconde
          </div>
        </div>
      )}

      {/* Main SVG Curve Canvas */}
      <div ref={containerRef} className="relative w-full h-[280px] sm:h-[340px] bg-slate-950/50 rounded-xl p-2 border border-slate-800/70 overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full cursor-crosshair select-none"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="liveCurveAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="liveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Grid lines & Right Price Axis */}
          {priceGridLevels.map((p, i) => {
            const y = getY(p);
            return (
              <g key={`grid-line-${i}`}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={chartWidth - paddingRight + 8}
                  y={y + 3.5}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  ${p.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Area fill under curve */}
          <path d={areaPath} fill="url(#liveCurveAreaGradient)" />

          {/* Continuous smoothed line */}
          <path
            d={linePath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Horizontal tracking guide line to the right axis for current price */}
          {lastPoint && (
            <line
              x1={paddingX}
              y1={lastY}
              x2={chartWidth - paddingRight}
              y2={lastY}
              stroke="#10B981"
              strokeDasharray="2 2"
              strokeWidth="1"
              opacity={0.6}
            />
          )}

          {/* Crosshair cursor when hovered */}
          {hoverIndex !== null && points[hoverIndex] && (
            <>
              {/* Vertical line */}
              <line
                x1={paddingX + hoverIndex * stepX}
                y1={paddingTop}
                x2={paddingX + hoverIndex * stepX}
                y2={chartHeight - paddingBottom}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Horizontal line */}
              <line
                x1={paddingX}
                y1={getY(points[hoverIndex].priceUSDPerTon)}
                x2={chartWidth - paddingRight}
                y2={getY(points[hoverIndex].priceUSDPerTon)}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Hover dot */}
              <circle
                cx={paddingX + hoverIndex * stepX}
                cy={getY(points[hoverIndex].priceUSDPerTon)}
                r="5"
                fill="#F59E0B"
                stroke="#0B0F17"
                strokeWidth="2"
              />
            </>
          )}

          {/* Live Pulsing Beacon at the rightmost newest tick */}
          {lastPoint && (
            <g transform={`translate(${lastX}, ${lastY})`}>
              {/* Pulse rings */}
              <circle r="10" fill="#10B981" opacity="0.25">
                <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Core solid dot */}
              <circle r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" filter="url(#liveGlow)" />
            </g>
          )}

          {/* Time axis labels */}
          {points
            .filter((_, i) => i % Math.max(1, Math.floor(points.length / 5)) === 0)
            .map((p, i, arr) => {
              const origIdx = points.indexOf(p);
              const x = paddingX + origIdx * stepX;
              return (
                <text
                  key={`time-label-${origIdx}`}
                  x={x}
                  y={chartHeight - 8}
                  fill="#64748B"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {p.timeLabel}
                </text>
              );
            })}
        </svg>
      </div>

      {/* Bottom informational legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            Courbe de Cotation Continue ($/tonne)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full border border-emerald-400 bg-white"></span>
            Point de Transaction en Direct
          </span>
        </div>
        <div className="text-slate-400">
          Fenêtre active : <strong>{selectedWindow}</strong> · Échantillonnage dynamique
        </div>
      </div>
    </div>
  );
};
