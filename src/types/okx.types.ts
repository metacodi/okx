import { ApiOptions, MarketType, SymbolType, MarketPrice, WsStreamType } from '@metacodi/abstract-exchange';
import { KlineIntervalType } from '../../../abstract-exchange/dist/abstract/types';


// ---------------------------------------------------------------------------------------------------
//  Api types
// ---------------------------------------------------------------------------------------------------

// export interface OkxApiOptions extends ApiOptions {
//   /** Instrument type. */
//   instrument: OkxInstrumentType;
  
// }


// /**
//  * ```typescript
//  * { params?: any; headers?: { [key: string]: string | number }; isPublic?: boolean; createSignature?: boolean; baseUrlOverride?: string }
//  * ```
//  */
// /** {@link https://www.okx.com/docs-v5/en/#rest-api-authentication-making-requests Making Requests} */
//  export interface OkxApiResquestOptions {
//   params?: any;
//   headers?: { [key: string]: string | number };
//   isPublic?: boolean;
//   baseUrlOverride?: string;
// }


// /** {@link https://www.okx.com/docs-v5/en/#websocket-api-connect Making Requests} */
// export interface OkxWebsocketTokenResponse {
//   instanceServers: OkxWebsocketServer[];
//   token: string;
// }

// /** {@link https://www.okx.com/docs-v5/en/#websocket-api-connect Connect} */
// export interface OkxWebsocketServer {
//   /** Websocket server address for establishing connection. Ex: `'wss://push1-v2.kucoin.com/endpoint'`. */
//   endpoint: string;
//   /** Protocol supported. Ex: `websocket`. */
//   protocol: string;
//   /** Indicate whether SSL encryption is used. */
//   encrypt: boolean;
//   /** Recommended to send ping interval in millisecond. */
//   pingInterval: number;
//   /** After such a long time(millisecond), if you do not receive pong, it will be considered as disconnected. */
//   pongTimeout: number;
// }



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

export interface OkxWsSubscriptionArguments {
  channel: OkxWsChannelType;
  [key: string]: any;
}

export interface OkxWsSubscription {
  op: 'subscribe' | 'unsubscribe';
  args: [OkxWsSubscriptionArguments];
}
