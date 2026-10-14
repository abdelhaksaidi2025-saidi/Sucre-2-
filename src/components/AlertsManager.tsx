import React, { useState } from 'react';
import { PriceAlert, SugarContract, ContractId } from '../types/market';
import { playAlertSound } from '../utils/audioAlert';
import {
  Bell,
  Volume2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Clock,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';

interface AlertsManagerProps {
  alerts: PriceAlert[];
  contracts: Record<ContractId, SugarContract>;
  onAddAlert: (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => void;
  onToggleAlert: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onResetTriggeredAlert: (id: string) => void;
  onClearTriggeredHistory: () => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  contracts,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
  onResetTriggeredAlert,
  onClearTriggeredHistory,
}) => {
  const [selectedContractId, setSelectedContractId] = useState<ContractId>('ice-white-no5');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(560);
  const [label, setLabel] = useState<string>('Seuil de vente');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [audioTesting, setAudioTesting] = useState<boolean>(false);

  const activeContract = contracts[selectedContractId];

  const handleTestSound = () => {
    setAudioTesting(true);
    playAlertSound('test');
    setTimeout(() => setAudioTesting(false), 800);
  };

  const handleApplyPreset = (delta: number) => {
    const current = activeContract.pricePerTonUSD;
    const computed = Number((current + delta).toFixed(2));
    setTargetPrice(computed);
    if (delta > 0) {
      setCondition('ABOVE');
      setLabel(`Objectif Hausse +$${delta}/t`);
    } else {
      setCondition('BELOW');
      setLabel(`Support Baisse -$${Math.abs(delta)}/t`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice || targetPrice <= 0) return;

    onAddAlert({
      contractId: selectedContractId,
      targetPriceUSD: Number(targetPrice.toFixed(2)),
      condition,
      label: label.trim() || `Alerte ${condition === 'ABOVE' ? 'Hausse' : 'Baisse'} $${targetPrice}/t`,
      isActive: true,
      soundEnabled,
    });

    // Reset default suggestion
    setLabel('Nouvelle alerte');
  };

  const activeAlerts = alerts.filter((a) => !a.isTriggered);
  const triggeredAlerts = alerts.filter((a) => a.isTriggered);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Audio Tester */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Centre de Surveillance & Alertes de Prix ($/tonne)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Surveillez le marché mondial en continu : notifications visuelles immédiates et carillon audio en cas de franchissement de seuil.
          </p>
        </div>

        <button
          onClick={handleTestSound}
          disabled={audioTesting}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors shrink-0"
        >
          <Volume2 className={`w-4 h-4 ${audioTesting ? 'animate-bounce' : ''}`} />
          <span>{audioTesting ? 'Émission du carillon...' : 'Tester le Carillon Sonore'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Formulaire de Création d'Alerte */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white mb-3 pb-2 border-b border-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Créer une Nouvelle Règle d'Alerte</span>
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contrat */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contrat à Surveiller
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedContractId('ice-white-no5');
                    setTargetPrice(Number((contracts['ice-white-no5'].pricePerTonUSD + 5).toFixed(2)));
                  }}
                  className={`p-2 rounded-lg border text-left text-xs font-medium transition-colors ${
                    selectedContractId === 'ice-white-no5'
                      ? 'border-amber-400 bg-amber-400/10 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">Londres N°5 (Blanc)</div>
                  <div className="font-mono text-amber-400 text-[11px] mt-0.5">
                    Actuel : ${contracts['ice-white-no5'].pricePerTonUSD.toFixed(2)}/t
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedContractId('ice-raw-no11');
                    setTargetPrice(Number((contracts['ice-raw-no11'].pricePerTonUSD + 5).toFixed(2)));
                  }}
                  className={`p-2 rounded-lg border text-left text-xs font-medium transition-colors ${
                    selectedContractId === 'ice-raw-no11'
                      ? 'border-amber-400 bg-amber-400/10 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">New York N°11 (Brut)</div>
                  <div className="font-mono text-amber-400 text-[11px] mt-0.5">
                    Actuel : ${contracts['ice-raw-no11'].pricePerTonUSD.toFixed(2)}/t
                  </div>
                </button>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Condition de Déclenchement
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    condition === 'ABOVE'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Prix Supérieur ou Égal (≥)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    condition === 'BELOW'
                      ? 'border-rose-500 bg-rose-500/15 text-rose-400 font-bold'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Prix Inférieur ou Égal (≤)</span>
                </button>
              </div>
            </div>

            {/* Target Price in $/t */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Seuil Cible en Dollars par Tonne Métrique ($/t)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={targetPrice || ''}
                  onChange={(e) => setTargetPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-400"
                  placeholder="560.00"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                  USD / Tonne
                </span>
              </div>

              {/* Quick Presets based on current price */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500 self-center mr-1">Raccourcis :</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(-5)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                >
                  -$5/t
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(-2)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                >
                  -$2/t
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(2)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  +$2/t
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(5)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  +$5/t
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(10)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                >
                  +$10/t
                </button>
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Libellé / Note de l'Alerte
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="Ex : Seuil d'achat importateur, Clôture contrat"
              />
            </div>

            {/* Sound toggle checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="soundToggleAlert"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-400 focus:ring-amber-400"
              />
              <label htmlFor="soundToggleAlert" className="text-xs text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Émettre un signal sonore lors du déclenchement</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm"
            >
              Enregistrer l'Alerte de Prix
            </button>
          </form>
        </div>

        {/* 3. Liste des Alertes Actives & Historique Déclenché */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Alerts List */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Règles en Surveillance Active ({activeAlerts.length})
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Évaluation temps réel à chaque tick
              </span>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Aucune alerte active configurée. Utilisez le formulaire pour définir un seuil en $/t.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 mt-2">
                {activeAlerts.map((alert) => {
                  const contract = contracts[alert.contractId];
                  const diff = alert.targetPriceUSD - contract.pricePerTonUSD;
                  const isAbove = alert.condition === 'ABOVE';

                  return (
                    <div key={alert.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 font-medium text-white">
                          <span className="text-amber-400 font-mono font-bold text-[11px]">
                            {contract.symbol}
                          </span>
                          <span>{alert.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                              isAbove ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {isAbove ? '≥' : '≤'} ${alert.targetPriceUSD.toFixed(2)} / t
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Cours actuel : ${contract.pricePerTonUSD.toFixed(2)}/t · Écart :{' '}
                          <span className={diff > 0 ? 'text-amber-300' : 'text-slate-300'}>
                            {diff > 0 ? `+${diff.toFixed(2)} $/t restant` : `${diff.toFixed(2)} $/t`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onToggleAlert(alert.id)}
                          title={alert.isActive ? 'Désactiver temporairement' : 'Activer'}
                          className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                            alert.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          {alert.isActive ? 'Active' : 'En veille'}
                        </button>
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Supprimer cette règle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Triggered Alerts History */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  Historique des Seuils Franchis ({triggeredAlerts.length})
                </h4>
              </div>

              {triggeredAlerts.length > 0 && (
                <button
                  onClick={onClearTriggeredHistory}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Effacer l'historique
                </button>
              )}
            </div>

            {triggeredAlerts.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                Aucun seuil franchi pour l'instant dans cette session.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 mt-2">
                {triggeredAlerts.map((alert) => {
                  const contract = contracts[alert.contractId];
                  const triggerTime = alert.triggeredAt
                    ? new Date(alert.triggeredAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : '--:--';

                  return (
                    <div key={alert.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="font-medium text-white">{alert.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{triggerTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 ml-6">
                          Déclenché à <strong className="text-amber-300">${alert.triggeredPrice?.toFixed(2) || alert.targetPriceUSD.toFixed(2)} / t</strong>{' '}
                          (Seuil : ${alert.targetPriceUSD.toFixed(2)}/t sur {contract.name})
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => onResetTriggeredAlert(alert.id)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          title="Réarmer cette alerte"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Réarmer</span>
                        </button>
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
