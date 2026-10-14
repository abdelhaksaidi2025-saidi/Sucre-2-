export type ContractId = 'ice-white-no5' | 'ice-raw-no11';

export interface SugarContract {
  id: ContractId;
  name: string;
  shortName: string;
  exchange: string;
  symbol: string;
  deliveryMonth: string;
  nativePrice: number; // For No. 5: USD/t, For No. 11: US cents/lb
  nativeUnit: 'USD/t' | 'USc/lb';
  pricePerTonUSD: number; // Canonical normalized price in USD per metric tonne
  previousCloseUSD: number;
  changeUSD: number;
  changePercent: number;
  dayHighUSD: number;
  dayLowUSD: number;
  volumeLots: number;
  volumeTonnes: number;
  openInterest: number;
  bidPriceUSD: number;
  askPriceUSD: number;
  bidSizeLots: number;
  askSizeLots: number;
  contractLotSizeTonnes: number; // No. 5 = 50 MT, No. 11 = 50 long tons = 50.8 MT
  qualityStandard: string;
  originInfo: string;
  lastUpdated: number;
}

export interface CandlestickBar {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  priceUSD: number;
  volumeLots: number;
  totalLots: number;
}

export interface TradeTick {
  id: string;
  contractId: ContractId;
  priceUSD: number;
  nativePrice: number;
  lots: number;
  tonnes: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface PriceAlert {
  id: string;
  contractId: ContractId;
  targetPriceUSD: number;
  condition: 'ABOVE' | 'BELOW';
  label: string;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: number;
  triggeredAt?: number;
  triggeredPrice?: number;
  soundEnabled: boolean;
}

export interface TriggeredNotification {
  id: string;
  alert: PriceAlert;
  contractName: string;
  currentPriceUSD: number;
  targetPriceUSD: number;
  timestamp: number;
}

export type Timeframe = '1J' | '1S' | '1M' | '3M' | '1A' | '5A';

export interface MarketFundamentalReport {
  id: string;
  title: string;
  source: string;
  date: string;
  category: 'RECOLTE' | 'METEO' | 'POLITIQUE' | 'CONSOMMATION';
  summary: string;
  impact: 'HAUSSIER' | 'BAISSIER' | 'NEUTRE';
  details: string;
}

export interface FuturesExpiry {
  id: string;
  contractId: ContractId;
  symbolCode: string; // ex: LSUZ26, LSUH27, SBH27
  deliveryMonthName: string; // "Décembre 2026", "Mars 2027", etc.
  deliveryDateTimestamp: number;
  lastTradingDay: string;
  noticeDay: string;
  deliveryWindow: string;
  priceUSDPerTon: number; // Toujours en $/tonne
  nativePrice: number; // ¢/lb pour SB ou $/t pour LSU
  spreadFromPromptUSD: number; // Différence par rapport à la 1ère échéance active ($/t)
  volumeLots: number;
  openInterest: number;
  status: 'ACTIF' | 'PROCHAIN' | 'DISTANT';
}

export type LiveTimeWindow = '1m' | '5m' | '15m' | '1h' | '4h' | '1j';

export interface LivePricePoint {
  timestamp: number;
  timeLabel: string;
  priceUSDPerTon: number;
}


