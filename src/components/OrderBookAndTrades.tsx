import React from 'react';
import { SugarContract, OrderBookLevel, TradeTick } from '../types/market';
import { Layers, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface OrderBookAndTradesProps {
  contract: SugarContract;
  orderBook: { bids: OrderBookLevel[]; asks: OrderBookLevel[] };
  trades: TradeTick[];
}

export const OrderBookAndTrades: React.FC<OrderBookAndTradesProps> = ({
  contract,
  orderBook,
  trades,
}) => {
  const maxBidTotal = orderBook.bids.length ? orderBook.bids[orderBook.bids.length - 1].totalLots : 100;
  const maxAskTotal = orderBook.asks.length ? orderBook.asks[orderBook.asks.length - 1].totalLots : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* 1. Carnet d'ordres (Depth of Market) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white tracking-tight">
              Carnet d'Ordres (Depth of Market)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Unité : $/tonne ({contract.symbol})
          </span>
        </div>

        <div className="mt-3">
          {/* Table headers */}
          <div className="grid grid-cols-3 text-[10px] font-mono text-slate-500 uppercase pb-1.5 border-b border-slate-800/80">
            <span>Prix ($/t)</span>
            <span className="text-center">Lots (50t)</span>
            <span className="text-right">Cumul</span>
          </div>

          {/* Asks (Sell orders - red) in reverse order */}
          <div className="space-y-1 my-1.5">
            {[...orderBook.asks].reverse().map((ask, i) => {
              const depthPercent = Math.min(100, (ask.totalLots / maxAskTotal) * 100);
              return (
                <div
                  key={`ask-${i}`}
                  className="grid grid-cols-3 text-xs font-mono py-0.5 relative items-center"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none rounded-sm"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <span className="text-rose-400 font-semibold z-10 tabular-nums">
                    ${ask.priceUSD.toFixed(2)}
                  </span>
                  <span className="text-center text-slate-300 z-10 tabular-nums">
                    {ask.volumeLots}
                  </span>
                  <span className="text-right text-slate-500 z-10 tabular-nums">
                    {ask.totalLots}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mid price divider */}
          <div className="py-2 my-1 px-3 bg-slate-900/90 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Dernier Cours Traité :</span>
            <span className="text-amber-400 font-bold tabular-nums">
              ${contract.pricePerTonUSD.toFixed(2)} / t
            </span>
            <span className="text-[10px] text-slate-500">
              Spread : ${(orderBook.asks[0]?.priceUSD - orderBook.bids[0]?.priceUSD || 0.40).toFixed(2)}
            </span>
          </div>

          {/* Bids (Buy orders - green) */}
          <div className="space-y-1 my-1.5">
            {orderBook.bids.map((bid, i) => {
              const depthPercent = Math.min(100, (bid.totalLots / maxBidTotal) * 100);
              return (
                <div
                  key={`bid-${i}`}
                  className="grid grid-cols-3 text-xs font-mono py-0.5 relative items-center"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none rounded-sm"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <span className="text-emerald-400 font-semibold z-10 tabular-nums">
                    ${bid.priceUSD.toFixed(2)}
                  </span>
                  <span className="text-center text-slate-300 z-10 tabular-nums">
                    {bid.volumeLots}
                  </span>
                  <span className="text-right text-slate-500 z-10 tabular-nums">
                    {bid.totalLots}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Dernières transactions en direct (Time & Sales) */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white tracking-tight">
              Flux des Transactions (Time & Sales)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Temps Réel · Tick par Tick
          </span>
        </div>

        <div className="mt-3">
          {/* Header */}
          <div className="grid grid-cols-4 text-[10px] font-mono text-slate-500 uppercase pb-1.5 border-b border-slate-800/80">
            <span>Heure</span>
            <span className="text-right">Prix ($/t)</span>
            <span className="text-right">Volume</span>
            <span className="text-right">Équiv. (t)</span>
          </div>

          {/* Trades stream */}
          <div className="space-y-1.5 my-2 max-h-[240px] overflow-y-auto pr-1">
            {trades.map((trade) => {
              const isBuy = trade.side === 'buy';
              const timeStr = new Date(trade.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              return (
                <div
                  key={trade.id}
                  className="grid grid-cols-4 text-xs font-mono py-1 border-b border-slate-800/40 items-center hover:bg-slate-900/60 px-1 rounded transition-colors"
                >
                  <span className="text-slate-400 text-[11px]">{timeStr}</span>
                  <span
                    className={`text-right font-bold tabular-nums flex items-center justify-end gap-0.5 ${
                      isBuy ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isBuy ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                    ${trade.priceUSD.toFixed(2)}
                  </span>
                  <span className="text-right text-slate-300 tabular-nums">
                    {trade.lots} lots
                  </span>
                  <span className="text-right text-slate-400 text-[11px] tabular-nums">
                    {trade.tonnes.toLocaleString('fr-FR')} t
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
