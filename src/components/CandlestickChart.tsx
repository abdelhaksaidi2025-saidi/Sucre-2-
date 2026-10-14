import React, { useState, useMemo, useRef } from 'react';
import { CandlestickBar, Timeframe, SugarContract } from '../types/market';
import { BarChart2, TrendingUp, Eye, EyeOff, Calendar, Layers } from 'lucide-react';

interface CandlestickChartProps {
  contract: SugarContract;
  data: CandlestickBar[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  contract,
  data,
  timeframe,
  onTimeframeChange,
}) => {
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showSMA20, setShowSMA20] = useState<boolean>(true);
  const [showSMA50, setShowSMA50] = useState<boolean>(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate price boundaries (min and max across all visible bars)
  const { minPrice, maxPrice, maxVolume, sma20Points, sma50Points } = useMemo(() => {
    if (!data.length) {
      return { minPrice: 500, maxPrice: 600, maxVolume: 1000, sma20Points: [], sma50Points: [] };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    data.forEach((bar) => {
      if (bar.low < min) min = bar.low;
      if (bar.high > max) max = bar.high;
      if (bar.volume > maxVol) maxVol = bar.volume;
    });

    // Add 3% buffer on top and bottom for visual breathing room
    const padding = (max - min) * 0.05 || 2;
    min = Math.floor(min - padding);
    max = Math.ceil(max + padding);

    // Compute SMA 20
    const sma20: (number | null)[] = data.map((_, idx, arr) => {
      if (idx < 19) return null;
      const slice = arr.slice(idx - 19, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / 20;
    });

    // Compute SMA 50
    const sma50: (number | null)[] = data.map((_, idx, arr) => {
      if (idx < 49) return null;
      const slice = arr.slice(idx - 49, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / 50;
    });

    return {
      minPrice: min,
      maxPrice: max,
      maxVolume: maxVol,
      sma20Points: sma20,
      sma50Points: sma50,
    };
  }, [data]);

  // Chart dimensions in SVG viewBox coordinate space
  const chartWidth = 900;
  const chartHeight = 420;
  const volumeHeight = 70;
  const mainChartHeight = chartHeight - volumeHeight - 30; // 320px for price

  // Horizontal step per bar
  const stepX = data.length > 1 ? (chartWidth - 80) / (data.length - 1) : 40;
  const startX = 20;

  // Coordinate mapping functions
  const getY = (price: number) => {
    const range = maxPrice - minPrice;
    if (range <= 0) return mainChartHeight / 2;
    return mainChartHeight - ((price - minPrice) / range) * mainChartHeight + 15;
  };

  const getVolY = (vol: number) => {
    if (maxVolume <= 0) return chartHeight - 20;
    const h = (vol / maxVolume) * volumeHeight;
    return chartHeight - 20 - h;
  };

  // Grid price ticks (5 price lines)
  const priceTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    const step = (maxPrice - minPrice) / (count - 1);
    for (let i = 0; i < count; i++) {
      const p = Number((minPrice + i * step).toFixed(2));
      ticks.push(p);
    }
    return ticks;
  }, [minPrice, maxPrice]);

  // Build SVG path for line chart
  const linePath = useMemo(() => {
    if (!data.length) return '';
    return data
      .map((bar, i) => {
        const x = startX + i * stepX;
        const y = getY(bar.close);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, stepX, maxPrice, minPrice]);

  // Area under line path
  const areaPath = useMemo(() => {
    if (!data.length) return '';
    const firstX = startX;
    const lastX = startX + (data.length - 1) * stepX;
    const bottomY = mainChartHeight + 15;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, data.length, stepX, mainChartHeight]);

  // Build SMA path
  const getSmaPath = (points: (number | null)[]) => {
    let path = '';
    let hasStarted = false;
    points.forEach((val, i) => {
      if (val === null) return;
      const x = startX + i * stepX;
      const y = getY(val);
      if (!hasStarted) {
        path += `M ${x} ${y}`;
        hasStarted = true;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  };

  const sma20Path = useMemo(() => getSmaPath(sma20Points), [sma20Points, stepX, maxPrice, minPrice]);
  const sma50Path = useMemo(() => getSmaPath(sma50Points), [sma50Points, stepX, maxPrice, minPrice]);

  const activeBar = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : data[data.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || !data.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xCoord = e.clientX - rect.left;
    const relativeX = (xCoord / rect.width) * chartWidth;
    
    // Find closest index
    const index = Math.round((relativeX - startX) / stepX);
    if (index >= 0 && index < data.length) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      {/* Chart Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Graphique Financier</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-mono font-semibold">
              {contract.name} (${contract.pricePerTonUSD.toFixed(2)}/t)
            </span>
          </div>

          {/* Chart type toggle */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setChartType('candles')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartType === 'candles'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chandeliers
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded transition-colors ${
                chartType === 'line'
                  ? 'bg-amber-400 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Courbe
            </button>
          </div>

          {/* SMA Overlays */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-0.5 rounded font-mono border transition-colors ${
                showSMA20
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              SMA 20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-0.5 rounded font-mono border transition-colors ${
                showSMA50
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              SMA 50
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          {(['1J', '1S', '1M', '3M', '1A', '5A'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all ${
                timeframe === tf
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Floating / Active Bar Inspection Banner */}
      {activeBar && (
        <div className="py-2.5 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs font-mono border-b border-slate-800/60 text-slate-400">
          <span className="text-slate-300 font-sans font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            {activeBar.time}
          </span>
          <span>
            O : <strong className="text-white">${activeBar.open.toFixed(2)}</strong>
          </span>
          <span>
            H : <strong className="text-emerald-400">${activeBar.high.toFixed(2)}</strong>
          </span>
          <span>
            B : <strong className="text-rose-400">${activeBar.low.toFixed(2)}</strong>
          </span>
          <span>
            C :{' '}
            <strong className={activeBar.close >= activeBar.open ? 'text-emerald-400' : 'text-rose-400'}>
              ${activeBar.close.toFixed(2)}
            </strong>
          </span>
          <span>
            Var :{' '}
            <strong className={activeBar.close >= activeBar.open ? 'text-emerald-400' : 'text-rose-400'}>
              {activeBar.close >= activeBar.open ? '+' : ''}
              {(activeBar.close - activeBar.open).toFixed(2)} $/t (
              {activeBar.open > 0 ? (((activeBar.close - activeBar.open) / activeBar.open) * 100).toFixed(2) : 0}%)
            </strong>
          </span>
          <span className="text-slate-500">
            Vol : <strong className="text-slate-300">{activeBar.volume.toLocaleString('fr-FR')} lots</strong>
          </span>
        </div>
      )}

      {/* Main SVG Chart Canvas */}
      <div ref={containerRef} className="relative w-full mt-2 h-[340px] sm:h-[400px]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full cursor-crosshair select-none"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Area gradient for line chart */}
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines and Price Axis labels */}
          {priceTicks.map((price) => {
            const y = getY(price);
            return (
              <g key={price}>
                <line
                  x1={startX}
                  y1={y}
                  x2={chartWidth - 60}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={chartWidth - 52}
                  y={y + 4}
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  ${price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume separator line */}
          <line
            x1={startX}
            y1={chartHeight - volumeHeight - 20}
            x2={chartWidth - 60}
            y2={chartHeight - volumeHeight - 20}
            stroke="#1E293B"
            strokeWidth="1"
          />
          <text
            x={startX + 4}
            y={chartHeight - volumeHeight - 8}
            fill="#475569"
            fontSize="9"
            fontFamily="JetBrains Mono"
          >
            Volume (lots)
          </text>

          {/* Volume bars */}
          {data.map((bar, i) => {
            const x = startX + i * stepX;
            const y = getVolY(bar.volume);
            const height = chartHeight - 20 - y;
            const isBullish = bar.close >= bar.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x - 2.5}
                y={y}
                width={5}
                height={Math.max(2, height)}
                fill={isBullish ? '#10B981' : '#EF4444'}
                opacity={0.35}
              />
            );
          })}

          {/* Line Chart Render */}
          {chartType === 'line' && (
            <>
              <path d={areaPath} fill="url(#chartAreaGradient)" />
              <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinejoin="round" />
            </>
          )}

          {/* Candlestick Render */}
          {chartType === 'candles' &&
            data.map((bar, i) => {
              const x = startX + i * stepX;
              const isBullish = bar.close >= bar.open;
              const openY = getY(bar.open);
              const closeY = getY(bar.close);
              const highY = getY(bar.high);
              const lowY = getY(bar.low);

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));
              const color = isBullish ? '#10B981' : '#EF4444';

              return (
                <g key={`candle-${i}`}>
                  {/* Candle Wick (High to Low) */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - 4}
                    y={bodyTop}
                    width={8}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* Moving Averages */}
          {showSMA20 && sma20Path && (
            <path
              d={sma20Path}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1.5"
              strokeDasharray="none"
            />
          )}
          {showSMA50 && sma50Path && (
            <path
              d={sma50Path}
              fill="none"
              stroke="#A855F7"
              strokeWidth="1.5"
              strokeDasharray="none"
            />
          )}

          {/* Crosshair Cursor on Mouse Hover */}
          {hoverIndex !== null && data[hoverIndex] && (
            <>
              {/* Vertical line */}
              <line
                x1={startX + hoverIndex * stepX}
                y1={15}
                x2={startX + hoverIndex * stepX}
                y2={chartHeight - 20}
                stroke="#F59E0B"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity={0.8}
              />
              {/* Horizontal line at close price */}
              <line
                x1={startX}
                y1={getY(data[hoverIndex].close)}
                x2={chartWidth - 60}
                y2={getY(data[hoverIndex].close)}
                stroke="#F59E0B"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity={0.8}
              />
              {/* Cursor indicator dot */}
              <circle
                cx={startX + hoverIndex * stepX}
                cy={getY(data[hoverIndex].close)}
                r="4"
                fill="#F59E0B"
                stroke="#0B0F17"
                strokeWidth="2"
              />
            </>
          )}

          {/* Time axis labels */}
          {data
            .filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0)
            .map((bar, i, filtered) => {
              const origIndex = data.indexOf(bar);
              const x = startX + origIndex * stepX;
              return (
                <text
                  key={`time-${origIndex}`}
                  x={x}
                  y={chartHeight - 4}
                  fill="#64748B"
                  fontSize="9.5"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  {bar.time}
                </text>
              );
            })}
        </svg>
      </div>

      {/* Bottom Chart Footer Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-800/80 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
            Bougie Haussière (Hausse)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
            Bougie Baissière (Baisse)
          </span>
          {showSMA20 && (
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-3 h-0.5 bg-blue-400 inline-block"></span>
              SMA 20
            </span>
          )}
          {showSMA50 && (
            <span className="flex items-center gap-1 text-purple-400">
              <span className="w-3 h-0.5 bg-purple-400 inline-block"></span>
              SMA 50
            </span>
          )}
        </div>
        <div className="text-slate-400">
          Source : Données Boursières Normalisées ICE Futures ($/MT)
        </div>
      </div>
    </div>
  );
};
