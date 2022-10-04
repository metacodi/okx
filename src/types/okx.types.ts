// ---------------------------------------------------------------------------------------------------
//  Api types
// ---------------------------------------------------------------------------------------------------

export interface OkxApiCredentials {
  /** Public user api key. */
  apiKey: string;
  /** Private user api key. */
  apiSecret: string;
  /** User api passphrase. */
  apiPassphrase: string;
}

export interface OkxApiOptions {
  /** Public user api key. */
  apiKey: string;
  /** Private user api key. */
  apiSecret: string;
  /** User api passphrase. */
  apiPassphrase: string;
  /** Indica si l'api està en mode test o en real. */
  isTest?: boolean,
  // /** Override the max size of the request window (in ms). */
  // recvWindow?: number;
}


export type WsConnectionState = 'initial' | 'connecting' | 'connected' | 'reconnecting' | 'closing';

export type WsStreamType = 'user' | 'market';

export interface OkxWebsocketOptions {
  /** Market associat. S'utilitza per discernir les variants de futurs: 'usdm' | 'coinm'. */
  market: OkxMarketType;
  /** Indica si l'stream és d'usuari o de mercat. */
  streamType: WsStreamType;
  /** Public user api key. */
  apiKey?: string;
  /** Private user api key. */
  apiSecret?: string;
  /** User api passphrase. */
  apiPassphrase?: string;
  /** Indica si l'api està en mode test o en real. */
  isTest?: boolean,
  /** Indica el periode de delay abans de tornar a connectar. */
  reconnectPeriod?: number;
  /** Temps en milisegons per l'interval qua ha de manetenir viva la connexió. */
  pingInterval?: number;
  /** Temps en milisegons pel timeout si no hi ha la resposta per part del servidor. */
  pongTimeout?: number;
}


/**
 * ```typescript
 * { params?: any; headers?: { [key: string]: string | number }; isPublic?: boolean; createSignature?: boolean; baseUrlOverride?: string }
 * ```
 */
/** {@link https://www.okx.com/docs-v5/en/#rest-api-authentication-making-requests Making Requests} */
 export interface OkxApiResquestOptions {
  params?: any;
  headers?: { [key: string]: string | number };
  isPublic?: boolean;
  baseUrlOverride?: string;
}


/** {@link https://www.okx.com/docs-v5/en/#websocket-api-connect Making Requests} */
export interface OkxWebsocketTokenResponse {
  instanceServers: OkxWebsocketServer[];
  token: string;
}

/** {@link https://www.okx.com/docs-v5/en/#websocket-api-connect Connect} */
export interface OkxWebsocketServer {
  /** Websocket server address for establishing connection. Ex: `'wss://push1-v2.kucoin.com/endpoint'`. */
  endpoint: string;
  /** Protocol supported. Ex: `websocket`. */
  protocol: string;
  /** Indicate whether SSL encryption is used. */
  encrypt: boolean;
  /** Recommended to send ping interval in millisecond. */
  pingInterval: number;
  /** After such a long time(millisecond), if you do not receive pong, it will be considered as disconnected. */
  pongTimeout: number;
}



// ---------------------------------------------------------------------------------------------------
//  shared types
// ---------------------------------------------------------------------------------------------------

export type OkxMarketType = 'SPOT' | 'FUTURES' | 'MARGIN' | 'SWAP'| 'OPTION';

// export type OkxOrderSide = 'buy' | 'sell';

// export type OkxOrderType = 'limit' | 'market' | 'limit_stop' | 'market_stop';

// export type OkxStopOrderType = 'up' | 'down';

// export type OkxOrderTimeInForce = 'GTC' | 'IOC';

// export type OkxOrderStatus = 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED' | 'CANCELLING' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED';

// export type OkxOrderExecutionType = 'NEW' | 'CANCELED' | 'REJECTED' | 'TRADE' | 'EXPIRED';

// export type OkxTradeType = 'TRADE' | 'MARGIN_TRADE';


// ---------------------------------------------------------------------------------------------------
//  Topic subscription
// ---------------------------------------------------------------------------------------------------

export interface OkxSubscription {
  
  op: 'subscribe' | 'unsubscribe';
  /** Channel name ",".
   * Ex: `'candle1Y candle6M candle3M candle1M candle1W'`.
   */
   args: any[];
  
}