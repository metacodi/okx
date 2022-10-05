import { ApiOptions, MarketType, SymbolType, MarketPrice, WsStreamType, KlineIntervalType } from '@metacodi/abstract-exchange';


// ---------------------------------------------------------------------------------------------------
//  shared types
// ---------------------------------------------------------------------------------------------------

export type OkxWsStreamType = 'public' | 'private';

export type OkxMarketType = 'SPOT' | 'MARGIN' | 'SWAP' | 'FUTURES' | 'OPTION';

// export type OkxOrderSide = 'buy' | 'sell';

// export type OkxOrderType = 'limit' | 'market' | 'limit_stop' | 'market_stop';

// export type OkxStopOrderType = 'up' | 'down';

// export type OkxOrderTimeInForce = 'GTC' | 'IOC';

// export type OkxOrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'CANCELLING' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED';

// export type OkxOrderExecutionType = 'NEW' | 'CANCELED' | 'REJECTED' | 'TRADE' | 'EXPIRED';

// export type OkxTradeType = 'TRADE' | 'MARGIN_TRADE';


// ---------------------------------------------------------------------------------------------------
//  Websocket
// ---------------------------------------------------------------------------------------------------

export type OkxWsChannelType = 'tickers' | `candle${KlineIntervalType}` | 'account' | 'positions' | 'balance_and_position' | 'orders' | 'liquidation-warning';

export type OkxWsEventType = 'login' | 'subscribe' | 'unsubscribe';

export interface OkxWsSubscriptionArguments {
  channel: OkxWsChannelType;
  [key: string]: any;
}

export interface OkxWsSubscription {
  op: 'subscribe' | 'unsubscribe';
  args: [OkxWsSubscriptionArguments];
}

export type OkxWsEvent = { arg: OkxWsSubscriptionArguments } & { data: any[] };