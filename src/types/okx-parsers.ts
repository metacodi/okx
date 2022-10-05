import moment, { unitOfTime } from 'moment';

import { SymbolType, WsStreamType, MarketType, MarketPrice, MarketKline, calculateCloseTime, KlineIntervalType, Order, WsBalancePositionUpdate, WsAccountUpdate, OrderSide, OrderType } from '@metacodi/abstract-exchange';
import { timestamp } from '@metacodi/node-utils';

import { OkxWsStreamType, OkxMarketType, OkxWsSubscriptionArguments, OkxWsChannelEvent, OkxOrderSide, OkxOrderType } from './okx.types';


export const parseSymbol = (symbol: string): SymbolType => {
  return symbol.replace('-', '_') as SymbolType;
}

export const formatSymbol = (symbol: SymbolType): string => {
  return symbol.replace('_', '-') as SymbolType;
}

export const parseWsStreamType = (stream: OkxWsStreamType): WsStreamType => {
  switch (stream) {
    case 'public': return 'market';
    case 'private': return 'user';
  }
}

export const formatWsStreamType = (stream: WsStreamType): OkxWsStreamType => {
  switch (stream) {
    case 'market': return 'public';
    case 'user': return 'private';
  }
}

export const parseMarketType = (market: OkxMarketType): MarketType => {
  switch (market) {
    case 'SPOT': return 'spot';
    case 'FUTURES': return 'futures';
    case 'SWAP': return 'futures';
    case 'MARGIN': return 'margin';
    default: throw ({ message: `No s'ha implementat el parser OKX pel market type '${market}'` });
  }
}

export const formatMarketType = (market: MarketType): OkxMarketType => {
  switch (market) {
    case 'spot': return 'SPOT';
    // case 'futures': return 'FUTURES';
    case 'futures': return 'SWAP';
    case 'margin': return 'MARGIN';
    default: throw ({ message: `No s'ha implementat el parser OKX pel market type '${market}'` });
  }
}

export const parseOrderSide = (market: OkxOrderSide): OrderSide => {
  switch (market) {
    case 'buy': return 'buy';
    case 'sell': return 'sell';
    default: throw ({ message: `No s'ha implementat el parser OKX pel OrderSide type '${market}'` });
  }
}

export const formatOrderSide = (market: OrderSide): OkxOrderSide => {
  switch (market) {
    case 'buy': return 'buy';
    case 'sell': return 'sell';
    default: throw ({ message: `No s'ha implementat el format OKX pel OrderSide type '${market}'` });
  }
}

export const parseOrderType = (market: OkxOrderType): OrderType => {
  switch (market) {
    case 'market': return 'market';
    case 'limit': return 'limit';
    default: throw ({ message: `No s'ha implementat el parser OKX pel OrderType type '${market}'` });
  }
}

export const formatOrderType = (market: OrderType): OkxOrderType => {
  switch (market) {
    case 'market': return 'market';
    case 'limit': return 'limit';
    default: throw ({ message: `No s'ha implementat el format OKX pel OrderSide type '${market}'` });
  }
}


// ---------------------------------------------------------------------------------------------------
//  Market STREAM
// ---------------------------------------------------------------------------------------------------

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-public-channel-tickers-channel Tickers channel} */
export const parsePriceTickerEvent = (ev: OkxWsChannelEvent): MarketPrice => {
  // Ex: instId = 'BTC-USDT-SWAP'.
  const instId: string[] = ev.arg.instId.split('-');
  const market = parseMarketType(instId.pop() as OkxMarketType);
  const symbol = parseSymbol(instId.join('-'));
  const data = ev.data[0];
  const baseVolume = market === 'futures' ? +data.volCcy24h : +data.volCcy24h / +data.last;
  const quoteVolume = market === 'futures' ? +data.volCcy24h * +data.last : +data.volCcy24h;
  return {
    symbol,
    price: +data.last,
    baseVolume, quoteVolume,
    timestamp: timestamp(moment(+data.ts)),
  }
}

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-public-channel-candlesticks-channel Candlesticks channel} */
export const parseKlineTickerEvent = (ev: OkxWsChannelEvent): MarketKline => {
  // Ex: instId = 'BTC-USDT-SWAP'.
  const instId: string[] = ev.arg.instId.split('-');
  const market = parseMarketType(instId.pop() as OkxMarketType);
  const symbol = parseSymbol(instId.join('-'));
  const data = ev.data[0];
  const interval = ev.arg.channel.replace('candle', '') as KlineIntervalType;
  const openTime = timestamp(moment(+data[0]));
  const closeTime = calculateCloseTime(openTime, interval);
  const baseVolume = market === 'futures' ? +data[6] : +data[6] / +data[4];
  const quoteVolume = market === 'futures' ? +data[6] * +data[4] : +data[6];
  return {
    symbol, openTime, closeTime, interval,
    open: +data[1],
    high: +data[2],
    low: +data[3],
    close: +data[4],
    baseVolume, quoteVolume,
  }
}


// ---------------------------------------------------------------------------------------------------
//  Account STREAMS
// ---------------------------------------------------------------------------------------------------

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-account-channel Account channel} */
export const parseAccountUpdateEvent = (ev: OkxWsChannelEvent): WsAccountUpdate => {
  return ev as any;
}

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-balance-and-position-channel Balance and position channel} */
export const parseBalancePositionUpdateEvent = (ev: OkxWsChannelEvent): WsBalancePositionUpdate => {
  return ev as any;
}

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-order-channel Order channel} */
export const parseOrderUpdateEvent = (ev: OkxWsChannelEvent): Order => {
  return ev as any;
  // return {
  //   id: data.clOrdId,
  //   exchangeId: data.ordId,
  //   side: parseOrderSide(data.side as OkxOrderSide),
  //   type: OrderType;
  //   status: OrderStatus;
  //   symbol: SymbolType;
  //   // baseQuantity ?: number;
  //   // quoteQuantity ?: number;
  //   // price ?: number;
  //   // stopPrice ?: number;
  //   // isOco ?: boolean;
  //   // created ?: string;
  //   // posted ?: string;
  //   // executed ?: string;
  //   // syncronized ?: boolean;
  //   // idOrderBuyed ?: string;
  //   // profit ?: number;
  //   // commission ?: number;
  //   // commissionAsset ?: CoinType;

  // };
}

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-algo-orders-channel Algo orders channel} */
export const parseOrderAlgoUpdateEvent = (ev: OkxWsChannelEvent): WsBalancePositionUpdate => {
  console.log(ev);
  return ev as any;
}