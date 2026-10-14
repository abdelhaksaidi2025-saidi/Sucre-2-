import React, { useState } from 'react';
import { SugarContract } from '../types/market';
import { Calculator, Ship, DollarSign, Package, Check, Copy } from 'lucide-react';

interface CargoCalculatorProps {
  whiteContract: SugarContract;
  rawContract: SugarContract;
}

export const CargoCalculator: React.FC<CargoCalculatorProps> = ({
  whiteContract,
  rawContract,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<'ice-white-no5' | 'ice-raw-no11'>('ice-white-no5');
  const [tonnageInput, setTonnageInput] = useState<number>(25000);
  const [freightPerTonUSD, setFreightPerTonUSD] = useState<number>(36);
  const [insuranceRatePercent, setInsuranceRatePercent] = useState<number>(0.35);
  const [copied, setCopied] = useState<boolean>(false);

  const activeContract = selectedContractId === 'ice-white-no5' ? whiteContract : rawContract;
  const pricePerTonUSD = activeContract.pricePerTonUSD;

  const validTonnage = Math.max(1, tonnageInput || 0);

  // Financial calculations
  const totalFobUSD = validTonnage * pricePerTonUSD;
  const totalFreightUSD = validTonnage * (freightPerTonUSD || 0);
  const totalInsuranceUSD = (totalFobUSD * (insuranceRatePercent || 0)) / 100;
  const totalCifUSD = totalFobUSD + totalFreightUSD + totalInsuranceUSD;

  const landedCostPerTonUSD = totalCifUSD / validTonnage;
  const landedCostPerKgUSD = landedCostPerTonUSD / 1000;

  // Hedging futures lots equivalent
  const lotSize = activeContract.contractLotSizeTonnes;
  const equivalentLots = Math.round(validTonnage / lotSize);

  const handleCopySummary = () => {
    const text = `--- SugarDesk Global : Simulation Cargaison ---
Contrat : ${activeContract.name} (${activeContract.symbol})
Volume : ${validTonnage.toLocaleString('fr-FR')} Tonnes Métriques (MT)
Cours de base : $${pricePerTonUSD.toFixed(2)} / tonne
Valeur FOB totale : $${Math.round(totalFobUSD).toLocaleString('fr-FR')} USD
Fret maritime estimé : $${Math.round(totalFreightUSD).toLocaleString('fr-FR')} USD ($${freightPerTonUSD}/t)
Assurance (${insuranceRatePercent}%) : $${Math.round(totalInsuranceUSD).toLocaleString('fr-FR')} USD
Coût Total CIF estimé : $${Math.round(totalCifUSD).toLocaleString('fr-FR')} USD
Prix de revient CIF : $${landedCostPerTonUSD.toFixed(2)} / tonne ($${landedCostPerKgUSD.toFixed(4)} / kg)
Couverture futures requise : ${equivalentLots} contrats (${lotSize}t/lot)
---------------------------------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Calculateur de Cargaison & Valeur Physique en Tonnes
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Évaluez la valeur totale d'un navire ou lot physique en dollars ($) et le coût de revient par tonne métrique
            </p>
          </div>
        </div>

        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copié dans le presse-papier' : 'Copier la Fiche de Calcul'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-5">
        {/* Input Parameters */}
        <div className="lg:col-span-5 space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              1. Sélection du Contrat de Sucre
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedContractId('ice-white-no5')}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-colors ${
                  selectedContractId === 'ice-white-no5'
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Blanc N°5 (Londres)</div>
                <div className="font-mono text-amber-400 mt-1">${whiteContract.pricePerTonUSD.toFixed(2)} / t</div>
              </button>
              <button
                onClick={() => setSelectedContractId('ice-raw-no11')}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-colors ${
                  selectedContractId === 'ice-raw-no11'
                    ? 'border-amber-400 bg-amber-400/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Brut N°11 (New York)</div>
                <div className="font-mono text-amber-400 mt-1">${rawContract.pricePerTonUSD.toFixed(2)} / t</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              2. Volume de la Cargaison (Tonnes Métriques)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="100"
                value={tonnageInput || ''}
                onChange={(e) => setTonnageInput(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-400"
                placeholder="25000"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                Tonnes (MT)
              </span>
            </div>

            {/* Quick volume presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 self-center mr-1">Gabarits :</span>
              {[
                { label: '500 t (Conteneurs)', val: 500 },
                { label: '5 000 t (Côtier)', val: 5000 },
                { label: '14 000 t (Handy)', val: 14000 },
                { label: '25 000 t (Supramax)', val: 25000 },
                { label: '50 000 t (Panamax)', val: 50000 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setTonnageInput(p.val)}
                  className={`px-2 py-1 text-[11px] rounded border font-mono transition-colors ${
                    tonnageInput === p.val
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Fret Maritime ($/tonne)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={freightPerTonUSD}
                onChange={(e) => setFreightPerTonUSD(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Assurance Maritime (%)
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={insuranceRatePercent}
                onChange={(e) => setInsuranceRatePercent(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Calculated Results Ledger */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Total FOB value */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span>Valeur Marchande FOB (Base Bourse)</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums mt-1.5">
                ${Math.round(totalFobUSD).toLocaleString('fr-FR')}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1">
                ${pricePerTonUSD.toFixed(2)} × {validTonnage.toLocaleString('fr-FR')} t
              </div>
            </div>

            {/* Total CIF landed */}
            <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-500/30">
              <div className="text-xs text-amber-300 flex items-center gap-1 font-medium">
                <Ship className="w-3.5 h-3.5 text-amber-400" />
                <span>Coût Total Débarqué CIF</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums mt-1.5">
                ${Math.round(totalCifUSD).toLocaleString('fr-FR')}
              </div>
              <div className="text-xs text-amber-300/80 font-mono mt-1">
                Inclus ${Math.round(totalFreightUSD).toLocaleString('fr-FR')} fret + assurance
              </div>
            </div>
          </div>

          {/* Unit Cost Breakdown Table */}
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Décomposition du Coût Unitaire par Tonne Métrique
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Prix FOB Bourse par Tonne :</span>
                <span className="text-white font-semibold">${pricePerTonUSD.toFixed(2)} / t</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">+ Fret Maritime par Tonne :</span>
                <span className="text-white font-semibold">${freightPerTonUSD.toFixed(2)} / t</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">+ Assurance Maritime par Tonne :</span>
                <span className="text-white font-semibold">
                  ${(totalInsuranceUSD / validTonnage).toFixed(2)} / t
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 text-amber-300 font-bold border-b border-slate-800">
                <span>= Coût de Revient Final par Tonne (CIF) :</span>
                <span className="text-sm">${landedCostPerTonUSD.toFixed(2)} / MT</span>
              </div>
              <div className="flex items-center justify-between py-1 text-emerald-400 font-semibold">
                <span>Équivalent au Kilogramme :</span>
                <span>${landedCostPerKgUSD.toFixed(4)} / kg</span>
              </div>
            </div>

            {/* Hedging recommendation */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Package className="w-3.5 h-3.5 text-slate-500" />
                <span>Couverture financière futures recommandée :</span>
              </div>
              <span className="font-mono font-bold text-amber-400">
                {equivalentLots} contrats {activeContract.symbol} ({lotSize}t/lot)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
