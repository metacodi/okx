import moment, { unitOfTime } from 'moment';

import { SymbolType, WsStreamType, MarketType, MarketPrice, MarketKline, calculateCloseTime, KlineIntervalType, OrderEvent, WsBalancePositionUpdate, WsAccountUpdate } from '@metacodi/abstract-exchange';
import { timestamp } from '@metacodi/node-utils';

import { OkxWsStreamType, OkxMarketType, OkxWsSubscriptionArguments, OkxWsEvent } from './okx.types';


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


// ---------------------------------------------------------------------------------------------------
//  Market STREAM
// ---------------------------------------------------------------------------------------------------

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-public-channel-tickers-channel Tickers channel} */
export const parsePriceTickerEvent = (obj: OkxWsEvent): MarketPrice => {
  // Ex: instId = 'BTC-USDT-SWAP'.
  const instId: string[] = obj.arg.instId.split('-');
  const market = parseMarketType(instId.pop() as OkxMarketType);
  const symbol = parseSymbol(instId.join('-'));
  const data = obj.data[0];
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
export const parseKlineTickerEvent = (obj: OkxWsEvent): MarketKline => {
  // Ex: instId = 'BTC-USDT-SWAP'.
  const instId: string[] = obj.arg.instId.split('-');
  const market = parseMarketType(instId.pop() as OkxMarketType);
  const symbol = parseSymbol(instId.join('-'));
  const data = obj.data[0];
  const interval = obj.arg.channel.replace('candle', '') as KlineIntervalType;
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
export const parseAccountUpdateEvent = (obj: OkxWsEvent): WsAccountUpdate => {
  return;
}

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-balance-and-position-channel Balance and position channel} */
export const parseBalancePositionUpdateEvent = (obj: OkxWsEvent): WsBalancePositionUpdate => {
  return;
}
  
/** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-order-channel Order channel} */
export const parseOrderUpdateEvent = (obj: OkxWsEvent): OrderEvent => {
  return;
}

