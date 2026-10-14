import React from 'react';
import { Bell, Volume2, VolumeX, Activity, Pause, BookOpen, Calendar } from 'lucide-react';

export type TabType = 'terminal' | 'live-curve' | 'chart' | 'expiries' | 'premium' | 'calculator' | 'alerts' | 'news' | 'guide';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewAlertModal: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAlertModal,
  isStreaming,
  onToggleStreaming,
  soundEnabled,
  onToggleSound,
  activeAlertsCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0B0F17]/95 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display font) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#terminal"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('terminal');
            }}
            className="text-lg font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            SugarDesk <span className="text-amber-400 font-semibold">Global</span>
          </a>
          <span className="text-xs text-slate-500 hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Bourse Mondiale du Sucre ($/tonne)
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line prose links with active state) */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeTab === 'terminal'
                ? 'text-white border-amber-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => setActiveTab('live-curve')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'live-curve'
                ? 'text-emerald-400 border-emerald-400 font-semibold'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Courbe Direct</span>
          </button>
          <button
            onClick={() => setActiveTab('expiries')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'expiries'
                ? 'text-white border-amber-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Échéances Futures</span>
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeTab === 'chart'
                ? 'text-white border-amber-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Graphiques OHLC
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeTab === 'premium'
                ? 'text-white border-amber-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Spread White
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeTab === 'calculator'
                ? 'text-white border-amber-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Calculateur
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 relative ${
              activeTab === 'alerts'
                ? 'text-white border-amber-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Alertes
            {activeAlertsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono bg-amber-500/20 text-amber-300 rounded">
                {activeAlertsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 ${
              activeTab === 'news'
                ? 'text-white border-amber-400'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            Fondamentaux ISO
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'border-transparent text-amber-300/80 hover:text-amber-300'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide Débutant</span>
          </button>
        </nav>

        {/* Zone 3: Market controls & Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Stream pause/play toggle */}
          <button
            onClick={onToggleStreaming}
            title={isStreaming ? 'Mettre en pause le flux' : 'Reprendre le flux en direct'}
            className={`p-2 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
              isStreaming
                ? 'border-emerald-800/60 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40'
                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isStreaming ? (
              <>
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden xl:inline">En Direct</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xl:inline">En Pause</span>
              </>
            )}
          </button>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Désactiver les alertes sonores' : 'Activer les alertes sonores'}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'border-amber-800/60 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40'
                : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewAlertModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 transition-all rounded-lg whitespace-nowrap shadow-sm shadow-amber-500/10"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Nouvelle Alerte</span>
          </button>
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-850 gap-4 text-xs font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`whitespace-nowrap ${activeTab === 'terminal' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Terminal
        </button>
        <button
          onClick={() => setActiveTab('live-curve')}
          className={`whitespace-nowrap ${activeTab === 'live-curve' ? 'text-emerald-400 font-bold' : 'text-emerald-400/80'}`}
        >
          Courbe Direct
        </button>
        <button
          onClick={() => setActiveTab('expiries')}
          className={`whitespace-nowrap ${activeTab === 'expiries' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Échéances Futures
        </button>

        <button
          onClick={() => setActiveTab('chart')}
          className={`whitespace-nowrap ${activeTab === 'chart' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Graphique
        </button>
        <button
          onClick={() => setActiveTab('premium')}
          className={`whitespace-nowrap ${activeTab === 'premium' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Spread White
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`whitespace-nowrap ${activeTab === 'calculator' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Calculateur
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`whitespace-nowrap ${activeTab === 'alerts' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Alertes ({activeAlertsCount})
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`whitespace-nowrap ${activeTab === 'news' ? 'text-amber-400 font-semibold' : ''}`}
        >
          Fondamentaux
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`whitespace-nowrap ${activeTab === 'guide' ? 'text-amber-400 font-bold' : 'text-amber-300/80'}`}
        >
          Guide Débutant
        </button>
      </div>
    </header>
  );
};
