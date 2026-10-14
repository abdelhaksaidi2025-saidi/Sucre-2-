import {
  SugarContract,
  CandlestickBar,
  OrderBookLevel,
  TradeTick,
  Timeframe,
  MarketFundamentalReport,
  FuturesExpiry,
  LiveTimeWindow,
  LivePricePoint,
} from '../types/market';



/**
 * Standard International Physical Commodities Conversion Constant:
 * 1 Metric Tonne = 2,204.622621849 Pounds (lbs)
 * Price in $/MT = (Price in cents/lb / 100) * 2204.62262 = cents/lb * 22.0462262
 */
export const CENTS_PER_LB_TO_USD_PER_TONNE = 22.046226218;

export function convertCentsPerLbToUsdPerTon(cents: number): number {
  return Number((cents * CENTS_PER_LB_TO_USD_PER_TONNE).toFixed(2));
}

export function convertUsdPerTonToCentsPerLb(usdTon: number): number {
  return Number((usdTon / CENTS_PER_LB_TO_USD_PER_TONNE).toFixed(2));
}

export const INITIAL_CONTRACTS: Record<string, SugarContract> = {
  'ice-white-no5': {
    id: 'ice-white-no5',
    name: 'Sucre Blanc Raffiné N°5',
    shortName: 'White Sugar No. 5',
    exchange: 'ICE Futures Europe (Londres)',
    symbol: 'LSU (W)',
    deliveryMonth: 'Décembre 2026',
    nativePrice: 554.80, // $/tonne
    nativeUnit: 'USD/t',
    pricePerTonUSD: 554.80,
    previousCloseUSD: 549.20,
    changeUSD: 5.60,
    changePercent: 1.02,
    dayHighUSD: 558.00,
    dayLowUSD: 548.50,
    volumeLots: 14820,
    volumeTonnes: 14820 * 50, // 50 tonnes per lot = 741,000 MT
    openInterest: 84630,
    bidPriceUSD: 554.60,
    askPriceUSD: 555.00,
    bidSizeLots: 42,
    askSizeLots: 38,
    contractLotSizeTonnes: 50,
    qualityStandard: 'Qualité Crystal White, max 45 ICUMSA, humidité max 0.06%',
    originInfo: 'Livraison FOB ports désignés en Europe, Asie et Moyen-Orient',
    lastUpdated: Date.now(),
  },
  'ice-raw-no11': {
    id: 'ice-raw-no11',
    name: 'Sucre Brut Centrifuge N°11',
    shortName: 'Raw Sugar No. 11',
    exchange: 'ICE Futures US (New York)',
    symbol: 'SB',
    deliveryMonth: 'Mars 2027',
    nativePrice: 20.45, // US cents/lb
    nativeUnit: 'USc/lb',
    pricePerTonUSD: convertCentsPerLbToUsdPerTon(20.45), // ~450.85 $/t
    previousCloseUSD: convertCentsPerLbToUsdPerTon(20.30), // ~447.54 $/t
    changeUSD: Number((convertCentsPerLbToUsdPerTon(20.45) - convertCentsPerLbToUsdPerTon(20.30)).toFixed(2)),
    changePercent: 0.74,
    dayHighUSD: convertCentsPerLbToUsdPerTon(20.62),
    dayLowUSD: convertCentsPerLbToUsdPerTon(20.22),
    volumeLots: 88400,
    volumeTonnes: Math.round(88400 * 50.8), // 50 long tons = ~50.8 MT
    openInterest: 612400,
    bidPriceUSD: convertCentsPerLbToUsdPerTon(20.44),
    askPriceUSD: convertCentsPerLbToUsdPerTon(20.46),
    bidSizeLots: 120,
    askSizeLots: 95,
    contractLotSizeTonnes: 50.8,
    qualityStandard: 'Sucre de canne brut centrifuge base 96° polarisation',
    originInfo: 'Livraison FOB ports du Brésil (Santos, Paranaguá), Thaïlande, etc.',
    lastUpdated: Date.now(),
  },
};

/**
 * Generate historical candlesticks based on real benchmark behavior
 */
export function generateHistoricalCandles(
  contractId: 'ice-white-no5' | 'ice-raw-no11',
  timeframe: Timeframe
): CandlestickBar[] {
  const bars: CandlestickBar[] = [];
  const basePrice = contractId === 'ice-white-no5' ? 554.80 : 450.85;

  let count = 40;
  let intervalMinutes = 15;

  switch (timeframe) {
    case '1J':
      count = 32;
      intervalMinutes = 15;
      break;
    case '1S':
      count = 35;
      intervalMinutes = 60 * 4; // 4 hours
      break;
    case '1M':
      count = 30;
      intervalMinutes = 60 * 24; // 1 day
      break;
    case '3M':
      count = 45;
      intervalMinutes = 60 * 24 * 2; // 2 days
      break;
    case '1A':
      count = 52;
      intervalMinutes = 60 * 24 * 7; // 1 week
      break;
    case '5A':
      count = 60;
      intervalMinutes = 60 * 24 * 30; // 1 month
      break;
  }

  const now = Date.now();
  let currentClose = basePrice;
  const volatility = contractId === 'ice-white-no5' ? 2.8 : 2.2;

  // Generate walk backwards then reverse
  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * intervalMinutes * 60 * 1000;
    const dateObj = new Date(timestamp);
    
    // Trend bias based on index
    const cycle = Math.sin((count - i) / 5) * 6;
    const randomStep = (Math.random() - 0.48) * volatility * 2;
    const close = Number((basePrice + cycle + randomStep).toFixed(2));
    const openOffset = (Math.random() - 0.5) * volatility * 1.5;
    const open = Number((close + openOffset).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * volatility * 1.4).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * volatility * 1.4).toFixed(2));
    const volume = Math.floor(800 + Math.random() * 2400);

    let timeLabel = '';
    if (timeframe === '1J') {
      timeLabel = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1S' || timeframe === '1M') {
      timeLabel = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } else {
      timeLabel = dateObj.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    }

    bars.push({
      time: timeLabel,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
    currentClose = close;
  }

  // Ensure last bar matches contract current price
  if (bars.length > 0) {
    bars[bars.length - 1].close = basePrice;
    bars[bars.length - 1].high = Math.max(bars[bars.length - 1].high, basePrice);
    bars[bars.length - 1].low = Math.min(bars[bars.length - 1].low, basePrice);
  }

  return bars;
}

/**
 * Generate synthetic Order Book (Depth of Market) around current price
 */
export function generateOrderBook(midPrice: number): { bids: OrderBookLevel[]; asks: OrderBookLevel[] } {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  let runningBidTotal = 0;
  let runningAskTotal = 0;

  for (let i = 1; i <= 5; i++) {
    const bidPrice = Number((midPrice - i * 0.40).toFixed(2));
    const bidLots = Math.floor(15 + Math.random() * 45);
    runningBidTotal += bidLots;
    bids.push({ priceUSD: bidPrice, volumeLots: bidLots, totalLots: runningBidTotal });

    const askPrice = Number((midPrice + i * 0.40).toFixed(2));
    const askLots = Math.floor(12 + Math.random() * 40);
    runningAskTotal += askLots;
    asks.push({ priceUSD: askPrice, volumeLots: askLots, totalLots: runningAskTotal });
  }

  return { bids, asks };
}

/**
 * Generate synthetic recent trades
 */
export function generateInitialTrades(contract: SugarContract): TradeTick[] {
  const trades: TradeTick[] = [];
  const now = Date.now();

  for (let i = 0; i < 8; i++) {
    const side: 'buy' | 'sell' = Math.random() > 0.5 ? 'buy' : 'sell';
    const delta = (Math.random() - 0.5) * 0.6;
    const priceUSD = Number((contract.pricePerTonUSD + delta).toFixed(2));
    const nativePrice = contract.id === 'ice-white-no5' 
      ? priceUSD 
      : convertUsdPerTonToCentsPerLb(priceUSD);
    const lots = Math.floor(5 + Math.random() * 25);
    const tonnes = Math.round(lots * contract.contractLotSizeTonnes);

    trades.push({
      id: `trade-${now - i * 3500}`,
      contractId: contract.id,
      priceUSD,
      nativePrice,
      lots,
      tonnes,
      side,
      timestamp: now - i * 3500,
    });
  }

  return trades;
}

export const MARKET_FUNDAMENTALS: MarketFundamentalReport[] = [
  {
    id: 'fund-1',
    title: 'Brésil UNICA : Taux de broyage et allocation éthanol/sucre Centre-Sud',
    source: 'UNICA (União da Agroindústria Canavieira)',
    date: '12 Octobre 2026',
    category: 'RECOLTE',
    summary: 'Le ratio de canne orientée vers la production de sucre atteint 49,2% contre 48,1% l’an passé.',
    impact: 'BAISSIER',
    details: 'Les usines brésiliennes continuent de maximiser la production de sucre au détriment de l’éthanol hydraté, profitant de la prime rémunératrice du sucre sur le marché mondial. Le broyage dans le Centre-Sud affiche une progression de 2,4% en glissement annuel.',
  },
  {
    id: 'fund-2',
    title: 'Inde : Politiques de quotas d’exportation et programme E20',
    source: 'ISMA (Indian Sugar Mills Association)',
    date: '08 Octobre 2026',
    category: 'POLITIQUE',
    summary: 'Le gouvernement indien maintient des quotas d’exportation sous contrôle strict pour sécuriser les stocks intérieurs.',
    impact: 'HAUSSIER',
    details: 'Avec le déploiement accéléré du mélange d’éthanol à 20% (E20), près de 4,2 millions de tonnes de saccharose sont dérivées vers les distilleries, limitant l’offre d’exportation de sucre blanc sur le marché mondial.',
  },
  {
    id: 'fund-3',
    title: 'ISO : Bilan mondial de l’Organisation Internationale du Sucre',
    source: 'International Sugar Organization (Londres)',
    date: '03 Octobre 2026',
    category: 'CONSOMMATION',
    summary: 'Déficit global prévu de 1,6 million de tonnes métriques pour la campagne en cours.',
    impact: 'HAUSSIER',
    details: 'La demande industrielle en Afrique et au Moyen-Orient reste robuste. Les flux tendus de sucre raffiné soutiennent la prime de raffinage (White Premium) au-dessus de 100 $/tonne.',
  },
  {
    id: 'fund-4',
    title: 'Météo Mousson & Récolte en Thaïlande',
    source: 'Thai Sugar Millers Corp',
    date: '28 Septembre 2026',
    category: 'METEO',
    summary: 'Des pluies régulières favorisent le développement végétatif de la canne.',
    impact: 'NEUTRE',
    details: 'Les prévisions de récolte thaïlandaise s’établissent à 88-92 millions de tonnes de canne, marquant une stabilisation après les sécheresses passées.',
  },
];

export const FUTURES_EXPIRIES: FuturesExpiry[] = [
  // --- ICE Futures Europe : White Sugar No. 5 (LSU) ---
  {
    id: 'exp-lsu-z26',
    contractId: 'ice-white-no5',
    symbolCode: 'LSUZ26',
    deliveryMonthName: 'Décembre 2026',
    deliveryDateTimestamp: new Date('2026-12-01').getTime(),
    lastTradingDay: '16 Nov. 2026',
    noticeDay: '17 Nov. 2026',
    deliveryWindow: '01 Déc. - 31 Déc. 2026',
    priceUSDPerTon: 554.80,
    nativePrice: 554.80,
    spreadFromPromptUSD: 0.00,
    volumeLots: 14820,
    openInterest: 84630,
    status: 'ACTIF',
  },
  {
    id: 'exp-lsu-h27',
    contractId: 'ice-white-no5',
    symbolCode: 'LSUH27',
    deliveryMonthName: 'Mars 2027',
    deliveryDateTimestamp: new Date('2027-03-01').getTime(),
    lastTradingDay: '15 Fév. 2027',
    noticeDay: '16 Fév. 2027',
    deliveryWindow: '01 Mar. - 31 Mar. 2027',
    priceUSDPerTon: 549.20,
    nativePrice: 549.20,
    spreadFromPromptUSD: -5.60,
    volumeLots: 9450,
    openInterest: 62100,
    status: 'PROCHAIN',
  },
  {
    id: 'exp-lsu-k27',
    contractId: 'ice-white-no5',
    symbolCode: 'LSUK27',
    deliveryMonthName: 'Mai 2027',
    deliveryDateTimestamp: new Date('2027-05-01').getTime(),
    lastTradingDay: '15 Avr. 2027',
    noticeDay: '16 Avr. 2027',
    deliveryWindow: '01 Mai - 31 Mai 2027',
    priceUSDPerTon: 543.50,
    nativePrice: 543.50,
    spreadFromPromptUSD: -11.30,
    volumeLots: 5620,
    openInterest: 41800,
    status: 'DISTANT',
  },
  {
    id: 'exp-lsu-q27',
    contractId: 'ice-white-no5',
    symbolCode: 'LSUQ27',
    deliveryMonthName: 'Août 2027',
    deliveryDateTimestamp: new Date('2027-08-01').getTime(),
    lastTradingDay: '16 Juil. 2027',
    noticeDay: '19 Juil. 2027',
    deliveryWindow: '01 Août - 31 Août 2027',
    priceUSDPerTon: 538.00,
    nativePrice: 538.00,
    spreadFromPromptUSD: -16.80,
    volumeLots: 3200,
    openInterest: 29400,
    status: 'DISTANT',
  },
  {
    id: 'exp-lsu-v27',
    contractId: 'ice-white-no5',
    symbolCode: 'LSUV27',
    deliveryMonthName: 'Octobre 2027',
    deliveryDateTimestamp: new Date('2027-10-01').getTime(),
    lastTradingDay: '15 Sept. 2027',
    noticeDay: '16 Sept. 2027',
    deliveryWindow: '01 Oct. - 31 Oct. 2027',
    priceUSDPerTon: 534.20,
    nativePrice: 534.20,
    spreadFromPromptUSD: -20.60,
    volumeLots: 1980,
    openInterest: 18700,
    status: 'DISTANT',
  },
  {
    id: 'exp-lsu-z27',
    contractId: 'ice-white-no5',
    symbolCode: 'LSUZ27',
    deliveryMonthName: 'Décembre 2027',
    deliveryDateTimestamp: new Date('2027-12-01').getTime(),
    lastTradingDay: '15 Nov. 2027',
    noticeDay: '16 Nov. 2027',
    deliveryWindow: '01 Déc. - 31 Déc. 2027',
    priceUSDPerTon: 531.00,
    nativePrice: 531.00,
    spreadFromPromptUSD: -23.80,
    volumeLots: 1140,
    openInterest: 12200,
    status: 'DISTANT',
  },

  // --- ICE Futures US : Raw Sugar No. 11 (SB) ---
  {
    id: 'exp-sb-h27',
    contractId: 'ice-raw-no11',
    symbolCode: 'SBH27',
    deliveryMonthName: 'Mars 2027',
    deliveryDateTimestamp: new Date('2027-03-01').getTime(),
    lastTradingDay: '26 Fév. 2027',
    noticeDay: '01 Mar. 2027',
    deliveryWindow: '01 Mar. - 30 Avr. 2027',
    priceUSDPerTon: convertCentsPerLbToUsdPerTon(20.45), // ~450.85 $/t
    nativePrice: 20.45,
    spreadFromPromptUSD: 0.00,
    volumeLots: 88400,
    openInterest: 612400,
    status: 'ACTIF',
  },
  {
    id: 'exp-sb-k27',
    contractId: 'ice-raw-no11',
    symbolCode: 'SBK27',
    deliveryMonthName: 'Mai 2027',
    deliveryDateTimestamp: new Date('2027-05-01').getTime(),
    lastTradingDay: '30 Avr. 2027',
    noticeDay: '03 Mai 2027',
    deliveryWindow: '01 Mai - 30 Juin 2027',
    priceUSDPerTon: convertCentsPerLbToUsdPerTon(19.95), // ~439.82 $/t
    nativePrice: 19.95,
    spreadFromPromptUSD: Number((convertCentsPerLbToUsdPerTon(19.95) - convertCentsPerLbToUsdPerTon(20.45)).toFixed(2)),
    volumeLots: 52100,
    openInterest: 384000,
    status: 'PROCHAIN',
  },
  {
    id: 'exp-sb-n27',
    contractId: 'ice-raw-no11',
    symbolCode: 'SBN27',
    deliveryMonthName: 'Juillet 2027',
    deliveryDateTimestamp: new Date('2027-07-01').getTime(),
    lastTradingDay: '30 Juin 2027',
    noticeDay: '01 Juil. 2027',
    deliveryWindow: '01 Juil. - 31 Août 2027',
    priceUSDPerTon: convertCentsPerLbToUsdPerTon(19.60), // ~432.11 $/t
    nativePrice: 19.60,
    spreadFromPromptUSD: Number((convertCentsPerLbToUsdPerTon(19.60) - convertCentsPerLbToUsdPerTon(20.45)).toFixed(2)),
    volumeLots: 31800,
    openInterest: 242000,
    status: 'DISTANT',
  },
  {
    id: 'exp-sb-v27',
    contractId: 'ice-raw-no11',
    symbolCode: 'SBV27',
    deliveryMonthName: 'Octobre 2027',
    deliveryDateTimestamp: new Date('2027-10-01').getTime(),
    lastTradingDay: '30 Sept. 2027',
    noticeDay: '01 Oct. 2027',
    deliveryWindow: '01 Oct. - 30 Nov. 2027',
    priceUSDPerTon: convertCentsPerLbToUsdPerTon(19.45), // ~428.80 $/t
    nativePrice: 19.45,
    spreadFromPromptUSD: Number((convertCentsPerLbToUsdPerTon(19.45) - convertCentsPerLbToUsdPerTon(20.45)).toFixed(2)),
    volumeLots: 18400,
    openInterest: 165000,
    status: 'DISTANT',
  },
  {
    id: 'exp-sb-h28',
    contractId: 'ice-raw-no11',
    symbolCode: 'SBH28',
    deliveryMonthName: 'Mars 2028',
    deliveryDateTimestamp: new Date('2028-03-01').getTime(),
    lastTradingDay: '29 Fév. 2028',
    noticeDay: '01 Mar. 2028',
    deliveryWindow: '01 Mar. - 30 Avr. 2028',
    priceUSDPerTon: convertCentsPerLbToUsdPerTon(19.25), // ~424.39 $/t
    nativePrice: 19.25,
    spreadFromPromptUSD: Number((convertCentsPerLbToUsdPerTon(19.25) - convertCentsPerLbToUsdPerTon(20.45)).toFixed(2)),
    volumeLots: 9200,
    openInterest: 94000,
    status: 'DISTANT',
  },
];

/**
 * Generate historical buffer points for continuous real-time live price curve
 */
export function generateLiveTimePoints(
  contractId: 'ice-white-no5' | 'ice-raw-no11',
  window: LiveTimeWindow,
  currentPrice: number
): LivePricePoint[] {
  let count = 35;
  let intervalSec = 2;

  switch (window) {
    case '1m':
      count = 30;
      intervalSec = 2; // 30 points across 60 seconds
      break;
    case '5m':
      count = 30;
      intervalSec = 10; // 30 points across 300 seconds
      break;
    case '15m':
      count = 30;
      intervalSec = 30; // 30 points across 900 seconds
      break;
    case '1h':
      count = 30;
      intervalSec = 120; // 30 points across 3600 seconds
      break;
    case '4h':
      count = 32;
      intervalSec = 450; // 32 points across 14400 seconds
      break;
    case '1j':
      count = 36;
      intervalSec = 2400; // 36 points across 86400 seconds
      break;
  }

  const now = Date.now();
  const points: LivePricePoint[] = [];
  const volatility = contractId === 'ice-white-no5' ? 0.35 : 0.28;

  // Walk backwards
  const tempPrices: number[] = [currentPrice];
  for (let i = 1; i < count; i++) {
    const prev = tempPrices[tempPrices.length - 1];
    const step = (Math.random() - 0.49) * volatility;
    tempPrices.push(Number((prev - step).toFixed(2)));
  }

  // Reverse so oldest is first
  tempPrices.reverse();

  for (let i = 0; i < count; i++) {
    const ts = now - (count - 1 - i) * intervalSec * 1000;
    const d = new Date(ts);
    let timeLabel = '';

    if (window === '1m' || window === '5m' || window === '15m') {
      timeLabel = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } else {
      timeLabel = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    points.push({
      timestamp: ts,
      timeLabel,
      priceUSDPerTon: tempPrices[i],
    });
  }

  // Ensure last point is strictly current price
  if (points.length > 0) {
    points[points.length - 1].priceUSDPerTon = currentPrice;
  }

  return points;
}


