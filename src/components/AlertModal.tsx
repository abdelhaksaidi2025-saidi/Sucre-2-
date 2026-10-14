import React, { useState } from 'react';
import { SugarContract, ContractId, PriceAlert } from '../types/market';
import { X, Bell, Volume2, ArrowUp, ArrowDown } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  contracts: Record<ContractId, SugarContract>;
  defaultContractId?: ContractId;
  defaultPrice?: number;
  onAddAlert: (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  contracts,
  defaultContractId = 'ice-white-no5',
  defaultPrice,
  onAddAlert,
}) => {
  const [contractId, setContractId] = useState<ContractId>(defaultContractId);
  const currentContractPrice = contracts[contractId]?.pricePerTonUSD || 550;
  const [targetPrice, setTargetPrice] = useState<number>(
    defaultPrice ? Number((defaultPrice + 2).toFixed(2)) : Number((currentContractPrice + 2).toFixed(2))
  );
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [label, setLabel] = useState<string>('Surveillance seuil');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || targetPrice <= 0) return;

    onAddAlert({
      contractId,
      targetPriceUSD: Number(targetPrice.toFixed(2)),
      condition,
      label: label.trim() || `Alerte ${condition === 'ABOVE' ? 'Hausse' : 'Baisse'} $${targetPrice}/t`,
      isActive: true,
      soundEnabled,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Créer une Alerte de Cours ($/tonne)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Contrat */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contrat
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setContractId('ice-white-no5');
                  setTargetPrice(Number((contracts['ice-white-no5'].pricePerTonUSD + 2).toFixed(2)));
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  contractId === 'ice-white-no5'
                    ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <div>Londres N°5 (Blanc)</div>
                <div className="text-amber-400 font-mono text-[11px]">
                  ${contracts['ice-white-no5'].pricePerTonUSD.toFixed(2)}/t
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setContractId('ice-raw-no11');
                  setTargetPrice(Number((contracts['ice-raw-no11'].pricePerTonUSD + 2).toFixed(2)));
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                  contractId === 'ice-raw-no11'
                    ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <div>New York N°11 (Brut)</div>
                <div className="text-amber-400 font-mono text-[11px]">
                  ${contracts['ice-raw-no11'].pricePerTonUSD.toFixed(2)}/t
                </div>
              </button>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('ABOVE')}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  condition === 'ABOVE'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Supérieur ou Égal (≥)</span>
              </button>
              <button
                type="button"
                onClick={() => setCondition('BELOW')}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  condition === 'BELOW'
                    ? 'border-rose-500 bg-rose-500/15 text-rose-400 font-bold'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Inférieur ou Égal (≤)</span>
              </button>
            </div>
          </div>

          {/* Prix cible */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seuil en Dollars par Tonne ($/t)
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Label */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Libellé de l'Alerte
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              placeholder="Ex : Objectif de couverture"
            />
          </div>

          {/* Sound checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="modalSoundCheckbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400"
            />
            <label htmlFor="modalSoundCheckbox" className="text-xs text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Alerte sonore immédiate</span>
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 text-xs font-bold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm"
            >
              Activer l'Alerte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
