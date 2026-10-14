import React from 'react';
import { MarketFundamentalReport } from '../types/market';
import { MARKET_FUNDAMENTALS } from '../utils/marketData';
import { FileText, ExternalLink, ShieldCheck, TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';

export const MarketFundamentals: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Données Fondamentales & Rapports Officiels Vérifiés
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Statistiques officielles certifiées par les organismes de référence de la filière sucrière mondiale (ISO, UNICA, ISMA).
            </p>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MARKET_FUNDAMENTALS.map((report) => {
          let impactBadge = {
            label: 'Impact Neutre',
            icon: Minus,
            classes: 'text-slate-300 bg-slate-800 border-slate-700',
          };
          if (report.impact === 'HAUSSIER') {
            impactBadge = {
              label: 'Impact Haussier',
              icon: TrendingUp,
              classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
            };
          } else if (report.impact === 'BAISSIER') {
            impactBadge = {
              label: 'Impact Baissier',
              icon: TrendingDown,
              classes: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
            };
          }

          const IconComponent = impactBadge.icon;

          return (
            <div
              key={report.id}
              className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-amber-400/90 font-medium">
                    {report.source}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono border ${impactBadge.classes}`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{impactBadge.label}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug mb-2">
                  {report.title}
                </h4>

                <p className="text-xs font-medium text-slate-300 mb-3 bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  {report.summary}
                </p>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {report.details}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Date de publication : {report.date}</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Donnée Vérifiée</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Macro Drivers explainer */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>Indicateurs Macroéconomiques & Corrélations Clés du Sucre</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="font-semibold text-white mb-1">Parité Éthanol / Sucre (Brésil)</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Le Brésil étant le 1er exportateur mondial, les usines arbitrent quotidiennement entre produire du sucre ou de l'éthanol hydraté selon le cours du pétrole brut Brent et le prix du sucre No. 11.
            </p>
          </div>

          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="font-semibold text-white mb-1">Taux de Change USD / Real (BRL)</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Une dépréciation du Real brésilien face au dollar américain incite les producteurs locaux à vendre agressivement à l'exportation pour capter des recettes libellées en USD.
            </p>
          </div>

          <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="font-semibold text-white mb-1">Fret Maritime Vraquier (BDI)</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Le coût du transport maritime au départ de Santos ou Paranaguá vers le Moyen-Orient et l'Asie influence directement le différentiel de prix FOB / CIF du sucre blanc raffiné.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
