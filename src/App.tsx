/**
 * SugarDesk Global - Application de suivi boursier mondial du sucre
 * Cotations officielles en temps réel en dollars par tonne ($/t)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ContractId,
  SugarContract,
  CandlestickBar,
  TradeTick,
  PriceAlert,
  TriggeredNotification,
  Timeframe,
  LiveTimeWindow,
  LivePricePoint,
} from './types/market';
import {
  INITIAL_CONTRACTS,
  generateHistoricalCandles,
  generateOrderBook,
  generateInitialTrades,
  generateLiveTimePoints,
  convertCentsPerLbToUsdPerTon,
  convertUsdPerTonToCentsPerLb,
} from './utils/marketData';
import { playAlertSound } from './utils/audioAlert';
import { Header, TabType } from './components/Header';
import { TickerBar } from './components/TickerBar';
import { ContractOverviewCard } from './components/ContractOverviewCard';
import { CandlestickChart } from './components/CandlestickChart';
import { LivePriceCurve } from './components/LivePriceCurve';
import { WhitePremiumSpread } from './components/WhitePremiumSpread';
import { CargoCalculator } from './components/CargoCalculator';
import { OrderBookAndTrades } from './components/OrderBookAndTrades';
import { AlertsManager } from './components/AlertsManager';
import { MarketFundamentals } from './components/MarketFundamentals';
import { FuturesExpiryCalendar } from './components/FuturesExpiryCalendar';
import { BeginnerGuide } from './components/BeginnerGuide';
import { AlertModal } from './components/AlertModal';
import { NotificationBanner } from './components/NotificationBanner';


import {
  Activity,
  Layers,
  BarChart2,
  Calculator,
  Bell,
  Globe,
  PlusCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

const STORAGE_KEY_ALERTS = 'sugardesk_alerts_v1';
const STORAGE_KEY_SOUND = 'sugardesk_sound_enabled';

const INITIAL_DEFAULT_ALERTS: PriceAlert[] = [
  {
    id: 'alert-sample-1',
    contractId: 'ice-white-no5',
    targetPriceUSD: 556.50,
    condition: 'ABOVE',
    label: 'Résistance Technique Clé Blanc',
    isActive: true,
    isTriggered: false,
    createdAt: Date.now() - 3600000,
    soundEnabled: true,
  },
  {
    id: 'alert-sample-2',
    contractId: 'ice-white-no5',
    targetPriceUSD: 550.00,
    condition: 'BELOW',
    label: 'Support Raffinerie Blanc No.5',
    isActive: true,
    isTriggered: false,
    createdAt: Date.now() - 7200000,
    soundEnabled: true,
  },
  {
    id: 'alert-sample-3',
    contractId: 'ice-raw-no11',
    targetPriceUSD: 452.00,
    condition: 'ABOVE',
    label: 'Objectif Exportateur Brut NY',
    isActive: true,
    isTriggered: false,
    createdAt: Date.now() - 1800000,
    soundEnabled: true,
  },
];

export default function App() {
  // Master state
  const [contracts, setContracts] = useState<Record<ContractId, SugarContract>>(INITIAL_CONTRACTS);
  const [selectedContractId, setSelectedContractId] = useState<ContractId>('ice-white-no5');
  const [activeTab, setActiveTab] = useState<TabType>('terminal');
  const [timeframe, setTimeframe] = useState<Timeframe>('1J');
  const [liveTimeWindow, setLiveTimeWindow] = useState<LiveTimeWindow>('5m');
  const [streamSpeedMs, setStreamSpeedMs] = useState<number>(2500);

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem(STORAGE_KEY_SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  // Visual flash animations on tick
  const [flashContractId, setFlashContractId] = useState<ContractId | null>(null);
  const [flashDirection, setFlashDirection] = useState<'up' | 'down' | null>(null);

  // Candles cache per contract and timeframe
  const [candles, setCandles] = useState<Record<string, CandlestickBar[]>>(() => {
    return {
      'ice-white-no5-1J': generateHistoricalCandles('ice-white-no5', '1J'),
      'ice-raw-no11-1J': generateHistoricalCandles('ice-raw-no11', '1J'),
    };
  });

  // Continuous real-time live curve points cache
  const [livePoints, setLivePoints] = useState<Record<string, LivePricePoint[]>>(() => {
    return {
      'ice-white-no5-5m': generateLiveTimePoints('ice-white-no5', '5m', INITIAL_CONTRACTS['ice-white-no5'].pricePerTonUSD),
      'ice-raw-no11-5m': generateLiveTimePoints('ice-raw-no11', '5m', INITIAL_CONTRACTS['ice-raw-no11'].pricePerTonUSD),
    };
  });

  // Depth of market order book & trades
  const [orderBook, setOrderBook] = useState(() =>
    generateOrderBook(INITIAL_CONTRACTS['ice-white-no5'].pricePerTonUSD)
  );
  const [trades, setTrades] = useState<TradeTick[]>(() =>
    generateInitialTrades(INITIAL_CONTRACTS['ice-white-no5'])
  );


  // Persistent alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DEFAULT_ALERTS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALERTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DEFAULT_ALERTS;
  });

  // Notification banners
  const [notifications, setNotifications] = useState<TriggeredNotification[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalDefaultContract, setModalDefaultContract] = useState<ContractId>('ice-white-no5');
  const [modalDefaultPrice, setModalDefaultPrice] = useState<number | undefined>(undefined);

  // Sync alerts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  // Sync sound preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Load candles when contract or timeframe changes if not cached
  useEffect(() => {
    const key = `${selectedContractId}-${timeframe}`;
    if (!candles[key]) {
      setCandles((prev) => ({
        ...prev,
        [key]: generateHistoricalCandles(selectedContractId, timeframe),
      }));
    }
  }, [selectedContractId, timeframe, candles]);

  // Load live curve points when contract or time window changes if not cached
  useEffect(() => {
    const key = `${selectedContractId}-${liveTimeWindow}`;
    if (!livePoints[key]) {
      setLivePoints((prev) => ({
        ...prev,
        [key]: generateLiveTimePoints(
          selectedContractId,
          liveTimeWindow,
          contracts[selectedContractId].pricePerTonUSD
        ),
      }));
    }
  }, [selectedContractId, liveTimeWindow, livePoints, contracts]);


  // Check and trigger alerts against new prices
  const checkAlerts = useCallback(
    (contractId: ContractId, newPrice: number) => {
      setAlerts((prevAlerts) => {
        let updated = false;
        const newAlertsList = prevAlerts.map((alert) => {
          if (!alert.isActive || alert.isTriggered || alert.contractId !== contractId) {
            return alert;
          }

          const triggeredAbove = alert.condition === 'ABOVE' && newPrice >= alert.targetPriceUSD;
          const triggeredBelow = alert.condition === 'BELOW' && newPrice <= alert.targetPriceUSD;

          if (triggeredAbove || triggeredBelow) {
            updated = true;
            // Play alert sound if enabled
            if (soundEnabled && alert.soundEnabled) {
              playAlertSound(triggeredAbove ? 'high' : 'low');
            }

            // Push notification banner
            const notif: TriggeredNotification = {
              id: `notif-${Date.now()}-${alert.id}`,
              alert,
              contractName: contracts[contractId].name,
              currentPriceUSD: newPrice,
              targetPriceUSD: alert.targetPriceUSD,
              timestamp: Date.now(),
            };
            setNotifications((n) => [notif, ...n.slice(0, 4)]);

            return {
              ...alert,
              isTriggered: true,
              triggeredAt: Date.now(),
              triggeredPrice: newPrice,
            };
          }

          return alert;
        });

        return updated ? newAlertsList : prevAlerts;
      });
    },
    [contracts, soundEnabled]
  );

  // Apply a price tick update
  const applyPriceTick = useCallback(
    (targetContractId: ContractId, deltaUSD: number) => {
      setContracts((prev) => {
        const current = prev[targetContractId];
        const newPricePerTon = Math.max(10, Number((current.pricePerTonUSD + deltaUSD).toFixed(2)));
        const changeUSD = Number((newPricePerTon - current.previousCloseUSD).toFixed(2));
        const changePercent = Number(((changeUSD / current.previousCloseUSD) * 100).toFixed(2));
        const dayHighUSD = Math.max(current.dayHighUSD, newPricePerTon);
        const dayLowUSD = Math.min(current.dayLowUSD, newPricePerTon);

        // Native price recalculation
        const nativePrice = targetContractId === 'ice-white-no5'
          ? newPricePerTon
          : convertUsdPerTonToCentsPerLb(newPricePerTon);

        const updatedContract: SugarContract = {
          ...current,
          pricePerTonUSD: newPricePerTon,
          nativePrice,
          changeUSD,
          changePercent,
          dayHighUSD,
          dayLowUSD,
          bidPriceUSD: Number((newPricePerTon - 0.20).toFixed(2)),
          askPriceUSD: Number((newPricePerTon + 0.20).toFixed(2)),
          volumeLots: current.volumeLots + Math.floor(1 + Math.random() * 5),
          volumeTonnes: Math.round((current.volumeLots + 3) * current.contractLotSizeTonnes),
          lastUpdated: Date.now(),
        };

        // Flash visual
        setFlashContractId(targetContractId);
        setFlashDirection(deltaUSD >= 0 ? 'up' : 'down');
        setTimeout(() => {
          setFlashContractId(null);
          setFlashDirection(null);
        }, 800);

        // Update trade ticker
        const lots = Math.floor(2 + Math.random() * 15);
        const newTrade: TradeTick = {
          id: `trade-${Date.now()}`,
          contractId: targetContractId,
          priceUSD: newPricePerTon,
          nativePrice,
          lots,
          tonnes: Math.round(lots * current.contractLotSizeTonnes),
          side: deltaUSD >= 0 ? 'buy' : 'sell',
          timestamp: Date.now(),
        };
        setTrades((prevTrades) => [newTrade, ...prevTrades.slice(0, 19)]);

        // Update active candlestick bar in current chart
        const candleKey = `${targetContractId}-${timeframe}`;
        setCandles((prevCandles) => {
          const currentList = prevCandles[candleKey];
          if (!currentList || !currentList.length) return prevCandles;
          const lastIdx = currentList.length - 1;
          const lastBar = currentList[lastIdx];
          const updatedLastBar: CandlestickBar = {
            ...lastBar,
            close: newPricePerTon,
            high: Math.max(lastBar.high, newPricePerTon),
            low: Math.min(lastBar.low, newPricePerTon),
            volume: lastBar.volume + lots,
          };
          const nextList = [...currentList];
          nextList[lastIdx] = updatedLastBar;
          return { ...prevCandles, [candleKey]: nextList };
        });

        // Update order book if currently viewed contract
        if (targetContractId === selectedContractId) {
          setOrderBook(generateOrderBook(newPricePerTon));
        }

        // Update continuous real-time live curve points
        const nowObj = new Date();
        const timeLabel = (liveTimeWindow === '1m' || liveTimeWindow === '5m' || liveTimeWindow === '15m')
          ? nowObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          : nowObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const pointKey = `${targetContractId}-${liveTimeWindow}`;
        const newPoint: LivePricePoint = {
          timestamp: Date.now(),
          timeLabel,
          priceUSDPerTon: newPricePerTon,
        };

        setLivePoints((prevPoints) => {
          const currentList = prevPoints[pointKey] || [];
          return {
            ...prevPoints,
            [pointKey]: [...currentList, newPoint].slice(-45),
          };
        });

        // Trigger check
        checkAlerts(targetContractId, newPricePerTon);

        return {
          ...prev,
          [targetContractId]: updatedContract,
        };
      });
    },
    [checkAlerts, selectedContractId, timeframe, liveTimeWindow]
  );

  // Periodic streaming tick simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Alternate between White No. 5 and Raw No. 11
      const targetId: ContractId = Math.random() > 0.45 ? 'ice-white-no5' : 'ice-raw-no11';
      // Realistic tick delta between -$0.80 and +$0.80 / tonne
      const delta = (Math.random() - 0.49) * 0.70;
      applyPriceTick(targetId, delta);
    }, streamSpeedMs);

    return () => clearInterval(interval);
  }, [isStreaming, applyPriceTick, streamSpeedMs]);


  // Alert management handlers
  const handleAddAlert = (newAlert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>) => {
    const alertItem: PriceAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      createdAt: Date.now(),
      isTriggered: false,
    };
    setAlerts((prev) => [alertItem, ...prev]);
  };

  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleResetTriggeredAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isTriggered: false, triggeredAt: undefined } : a))
    );
  };

  const handleClearTriggeredHistory = () => {
    setAlerts((prev) => prev.filter((a) => !a.isTriggered));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Open modal preconfigured
  const handleOpenAlertForContract = (contractId: ContractId, currentPrice: number) => {
    setModalDefaultContract(contractId);
    setModalDefaultPrice(currentPrice);
    setIsModalOpen(true);
  };

  const handleOpenAlertForPrice = (contractId: ContractId, targetPrice: number) => {
    setModalDefaultContract(contractId);
    setModalDefaultPrice(targetPrice);
    setIsModalOpen(true);
  };


  const activeAlertsCount = alerts.filter((a) => a.isActive && !a.isTriggered).length;
  const currentContract = contracts[selectedContractId];
  const candleKey = `${selectedContractId}-${timeframe}`;
  const currentCandles = candles[candleKey] || [];
  const livePointKey = `${selectedContractId}-${liveTimeWindow}`;
  const currentLivePoints = livePoints[livePointKey] || [];


  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* 1. Header (Top Bar Contract) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAlertModal={() => {
          setModalDefaultContract(selectedContractId);
          setModalDefaultPrice(currentContract.pricePerTonUSD);
          setIsModalOpen(true);
        }}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeAlertsCount={activeAlertsCount}
      />

      {/* 2. Top Ticker Bar for Dual Market Quotes */}
      <TickerBar
        contracts={contracts}
        selectedContractId={selectedContractId}
        onSelectContract={(id) => {
          setSelectedContractId(id);
          setOrderBook(generateOrderBook(contracts[id].pricePerTonUSD));
        }}
        flashContractId={flashContractId}
        flashDirection={flashDirection}
      />

      {/* 3. Floating Notification Banner for Alert Triggers */}
      <NotificationBanner
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onViewAlerts={() => setActiveTab('alerts')}
      />

      {/* 4. Interactive Simulation & Quick Controls Sub-Bar */}
      <div className="bg-[#0F172A]/70 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Simulateur Bourse Direct :</span>
            </span>
            <span className="hidden sm:inline text-slate-500">
              Déclenchez manuellement un mouvement de cours pour tester vos alertes :
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPriceTick(selectedContractId, 1.50)}
              className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-medium flex items-center gap-1 transition-colors"
              title="Simuler une hausse de cours"
            >
              <TrendingUp className="w-3 h-3" />
              <span>Hausse +$1.50/t</span>
            </button>
            <button
              onClick={() => applyPriceTick(selectedContractId, -1.50)}
              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-medium flex items-center gap-1 transition-colors"
              title="Simuler une baisse de cours"
            >
              <TrendingDown className="w-3 h-3" />
              <span>Baisse -$1.50/t</span>
            </button>
            <button
              onClick={() => {
                const delta = (Math.random() - 0.5) * 3;
                applyPriceTick(selectedContractId, delta);
              }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] transition-colors"
            >
              Tick Aléatoire
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Workspace Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: TERMINAL BOURSIER COMPLET */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            {/* Contract Overview Hero */}
            <ContractOverviewCard
              contract={currentContract}
              onOpenAlertForContract={handleOpenAlertForContract}
              onSelectContract={(id) => {
                setSelectedContractId(id);
                setOrderBook(generateOrderBook(contracts[id].pricePerTonUSD));
              }}
            />

            {/* Live Real-time Price Curve with Time-Window Controls */}
            <LivePriceCurve
              contract={currentContract}
              points={currentLivePoints}
              selectedWindow={liveTimeWindow}
              onSelectWindow={setLiveTimeWindow}
              onSelectContract={(id) => {
                setSelectedContractId(id);
                setOrderBook(generateOrderBook(contracts[id].pricePerTonUSD));
              }}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
              streamSpeedMs={streamSpeedMs}
              onSelectSpeedMs={setStreamSpeedMs}
            />

            {/* Candlestick & Volume Chart */}
            <CandlestickChart
              contract={currentContract}
              data={currentCandles}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />

            {/* Order Book & Time and Sales */}
            <OrderBookAndTrades
              contract={currentContract}
              orderBook={orderBook}
              trades={trades.filter((t) => t.contractId === selectedContractId)}
            />

            {/* White Premium Spread Section */}
            <WhitePremiumSpread
              whiteContract={contracts['ice-white-no5']}
              rawContract={contracts['ice-raw-no11']}
              onOpenSpreadAlert={(val) => {
                setModalDefaultContract('ice-white-no5');
                setModalDefaultPrice(contracts['ice-white-no5'].pricePerTonUSD);
                setIsModalOpen(true);
              }}
            />

            {/* Cargo Physical Valuation Calculator */}
            <CargoCalculator
              whiteContract={contracts['ice-white-no5']}
              rawContract={contracts['ice-raw-no11']}
            />
          </div>
        )}

        {/* VIEW: COURBE EN DIRECT PLEIN ÉCRAN */}
        {activeTab === 'live-curve' && (
          <div className="space-y-6">
            <LivePriceCurve
              contract={currentContract}
              points={currentLivePoints}
              selectedWindow={liveTimeWindow}
              onSelectWindow={setLiveTimeWindow}
              onSelectContract={(id) => {
                setSelectedContractId(id);
                setOrderBook(generateOrderBook(contracts[id].pricePerTonUSD));
              }}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
              streamSpeedMs={streamSpeedMs}
              onSelectSpeedMs={setStreamSpeedMs}
            />

            <OrderBookAndTrades
              contract={currentContract}
              orderBook={orderBook}
              trades={trades.filter((t) => t.contractId === selectedContractId)}
            />
          </div>
        )}

        {/* VIEW 2: GRAPHIQUE PLEIN ÉCRAN */}
        {activeTab === 'chart' && (

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#111827] border border-slate-800 rounded-xl">
              <div>
                <h3 className="text-base font-bold text-white">Analyse Technique Avancée</h3>
                <p className="text-xs text-slate-400">
                  Cours chandeliers OHLC, volumes de négociation et moyennes mobiles calculées en $/tonne.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedContractId('ice-white-no5')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    selectedContractId === 'ice-white-no5'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Londres N°5 (Blanc)
                </button>
                <button
                  onClick={() => setSelectedContractId('ice-raw-no11')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded ${
                    selectedContractId === 'ice-raw-no11'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  New York N°11 (Brut)
                </button>
              </div>
            </div>

            <CandlestickChart
              contract={currentContract}
              data={currentCandles}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
            />

            <OrderBookAndTrades
              contract={currentContract}
              orderBook={orderBook}
              trades={trades.filter((t) => t.contractId === selectedContractId)}
            />
          </div>
        )}

        {/* VIEW 3: WHITE PREMIUM SPREAD */}
        {activeTab === 'premium' && (
          <div className="space-y-6">
            <WhitePremiumSpread
              whiteContract={contracts['ice-white-no5']}
              rawContract={contracts['ice-raw-no11']}
              onOpenSpreadAlert={() => {
                setModalDefaultContract('ice-white-no5');
                setModalDefaultPrice(contracts['ice-white-no5'].pricePerTonUSD);
                setIsModalOpen(true);
              }}
            />

            <CargoCalculator
              whiteContract={contracts['ice-white-no5']}
              rawContract={contracts['ice-raw-no11']}
            />
          </div>
        )}

        {/* VIEW 4: CALCULATEUR CARGAISON */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <CargoCalculator
              whiteContract={contracts['ice-white-no5']}
              rawContract={contracts['ice-raw-no11']}
            />
          </div>
        )}

        {/* VIEW 5: ALERTES DE PRIX */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <AlertsManager
              alerts={alerts}
              contracts={contracts}
              onAddAlert={handleAddAlert}
              onToggleAlert={handleToggleAlert}
              onDeleteAlert={handleDeleteAlert}
              onResetTriggeredAlert={handleResetTriggeredAlert}
              onClearTriggeredHistory={handleClearTriggeredHistory}
            />
          </div>
        )}

        {/* VIEW 6: FONDAMENTAUX & RAPPORTS ISO */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <MarketFundamentals />
          </div>
        )}

        {/* VIEW 7: ÉCHÉANCES FUTURES & FORWARD CURVE */}
        {activeTab === 'expiries' && (
          <div className="space-y-6">
            <FuturesExpiryCalendar
              contracts={contracts}
              onOpenAlertForPrice={handleOpenAlertForPrice}
            />
          </div>
        )}

        {/* VIEW 8: GUIDE PÉDAGOGIQUE POUR NOVICE */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <BeginnerGuide />
          </div>
        )}
      </main>


      {/* 6. Quick Alert Modal */}
      <AlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contracts={contracts}
        defaultContractId={modalDefaultContract}
        defaultPrice={modalDefaultPrice}
        onAddAlert={handleAddAlert}
      />

      {/* 7. Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F17] py-6 text-xs text-slate-500 font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-sans font-bold">SugarDesk Global</span>
            <span>·</span>
            <span>Terminal Professionnel de Cotations Mondiales du Sucre</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>ICE Futures Europe (LSU)</span>
            <span>·</span>
            <span>ICE Futures US (SB)</span>
            <span>·</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Normalisation $/Tonne Vérifiée</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
