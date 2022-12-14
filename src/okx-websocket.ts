import WebSocket from 'isomorphic-ws';
import EventEmitter from 'events';
import { Subject, interval, timer, Subscription } from 'rxjs';
import { createHmac } from 'crypto';

import { MarketType, SymbolType, MarketPrice, KlinesRequest, MarketKline, KlineIntervalType, Order, CoinType, ApiOptions, isSubjectUnobserved, matchChannelKey, buildChannelKey } from '@metacodi/abstract-exchange';
import { ExchangeWebsocket, WebsocketOptions, WsStreamType, WsConnectionState, WsAccountUpdate, WsBalancePositionUpdate } from '@metacodi/abstract-exchange';

import { OkxApi } from './okx-api';
import { OkxMarketType, OkxWsSubscriptionRequest, OkxWsSubscriptionArguments, OkxWsChannelType, OkxWsEventType, OkxWsChannelEvent, OkxWsLoginRequest } from './types/okx.types';
import { formatMarketType, formatWsStreamType, parseSymbol, formatSymbol, parsePriceTickerEvent, parseKlineTickerEvent, parseAccountUpdateEvent, parseBalancePositionUpdateEvent, parseOrderUpdateEvent } from './types/okx-parsers';
import { OkxApiFunctions } from './okx-api-function';



export class OkxWebsocket extends EventEmitter implements ExchangeWebsocket {
  /** Estat de la connexió. */
  status: WsConnectionState = 'initial';
  /** Referència a la instància del client API. */
  protected api: OkxApiFunctions;
  /** Opcions de configuració. */
  protected options: WebsocketOptions;
  /** Referència a la instància del websocket subjacent. */
  protected ws: WebSocket
  /** Subscripció al interval que envia un ping al servidor per mantenir viva la connexió.  */
  protected pingTimer?: Subscription;
  /** Subscriptor al timer que controla la resposta del servidor. */
  protected pongTimer?: Subscription;
  /** Identificador de connexió rebut del servidor websocket. */
  protected connectId?: string;
  /** Emisors de missatges. */
  protected emitters: { [channelKey: string]: Subject<any> } = {};
  /** Identificador de login del servidor websocket. */
  protected loggedIn: boolean;
  /** Arguments per tornar a subscriure's al canal (respawn). */
  protected subArguments: { [key: string]: OkxWsSubscriptionArguments[] } = {};
  /** Identificador de connexió rebut del servidor websocket. */
  protected userId?: string;

  constructor(
    options: WebsocketOptions,
  ) {
    super();
    this.options = { ...this.defaultOptions, ...options };

    this.initialize();
  }

  // ---------------------------------------------------------------------------------------------------
  //  options
  // ---------------------------------------------------------------------------------------------------

  get okxMarket(): OkxMarketType { return formatMarketType(this.market); }

  get market(): MarketType { return this.options?.market; }

  get streamType(): WsStreamType { return this.options?.streamType; }

  get apiKey(): string { return this.options?.apiKey; }

  get apiSecret(): string { return this.options?.apiSecret; }

  get apiPassphrase(): string { return this.options?.apiPassphrase; }

  get isTest(): boolean { return this.options?.isTest; }

  get reconnectPeriod(): number { return this.options?.reconnectPeriod; }

  get pingInterval(): number { return this.options?.pingInterval; }

  get pongTimeout(): number { return this.options?.pongTimeout; }

  get defaultOptions(): Partial<WebsocketOptions> {
    return {
      isTest: true,
      reconnectPeriod: 5 * 1000,
      pingInterval: 18 * 1000,
      pongTimeout: 10 * 1000,
    }
  }

  protected async initialize() {
    // Iniciem la connexió amb l'stream de l'exchange.
    this.connect();
  }

  // ---------------------------------------------------------------------------------------------------
  //  connect . close . login
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-connect Connect} */
  async connect() {
    // Obtenim dades de connexió amb el websocket.
    const wsType = this.streamType === 'market' ? 'public' : 'private';

    // TODO: Throw error if !wsInfo.
    const { pingInterval, pongTimeout, isTest } = this.options;

    // if (isTest) {
    //   const options: ApiOptions = {
    //     apiKey: this.apiKey,
    //     apiSecret: this.apiSecret,
    //     apiPassphrase: this.apiPassphrase,
    //     market: this.market,
    //     isTest,
    //   } as any;
  
    //   // if (options.isTest) { setTestKeys(options, market); }
  
    //   this.api = new OkxApiFunctions(options);
  
    //   const config = await this.api.getAccountConfig();
    //   console.log('config', config);
    //   if (config !== undefined) { this.userId = config[0].data.uid; } else {  throw ({ message: `No s'ha pogut trobar la cofiguració de l'usuari` });}
    // }

    

    const url = !isTest ? `wss://ws.okx.com:8443/ws/v5/${wsType}` : `wss://wspap.okx.com:8443/ws/v5/${wsType}?brokerId=${this.userId}`;

    // Ajustem els paràmetres segons el nou servidor.
    this.options.pingInterval = pingInterval || this.defaultOptions.pingInterval;
    this.options.pongTimeout = pongTimeout || this.defaultOptions.pongTimeout;

    // Nova instància.
    console.log(this.wsId, '=> connecting...', url);
    this.ws = new WebSocket(url);
    // Listeners.
    this.ws.onopen = event => this.onWsOpen(event);
    this.ws.onerror = event => this.onWsError(event);
    this.ws.onclose = event => this.onWsClose(event);
    this.ws.onmessage = event => this.onWsMessage(event);
    // ping . pong
    if (typeof this.ws.on === 'function') {
      this.ws.on('ping', event => this.onWsPing(event));
      this.ws.on('pong', event => this.onWsPong(event));
    }
    // Not sure these work in the browser, the traditional event listeners are required for ping/pong frames in node.
    (this.ws as any).onping = (event: WebSocket.Event) => this.onWsPing(event);
    (this.ws as any).onpong = (event: WebSocket.Event) => this.onWsPong(event);

  }

  async signMessage(message: string, secret: string): Promise<string> {
    // Si és possible, fem servir la funció de crypto.
    if (typeof createHmac === 'function') {
      return createHmac('sha256', secret).update(message).digest('base64');
    }
    // Si no s'ha pogut importar la funció en entorn browser, li donem suport.
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const algorithm = { name: 'HMAC', hash: { name: 'SHA-256' } };
    const extractable = false;
    const keyUsages: KeyUsage[] = ['sign'];
    const key = await window.crypto.subtle.importKey('raw', keyData, algorithm, extractable, keyUsages);
    const signature = await window.crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Buffer.from(signature).toString('base64');
  };

  reconnect() {
    if (this.status === 'reconnecting') { return; }
    this.status = 'reconnecting';
    this.close();
    setTimeout(() => this.connect(), this.reconnectPeriod);
  }


  async close() {
    try {
      if (this.status !== 'reconnecting') { this.status = 'closing'; }
      if (this.pingTimer) { this.pingTimer.unsubscribe(); }
      if (this.pongTimer) { this.pongTimer.unsubscribe(); }
      // if (this.streamType === 'user') { await this.api.closeUserDataListenKey(this.listenKey); }
      this.ws.close();
      // #168: ws.terminate() undefined in browsers.
      if (typeof this.ws.terminate === 'function') { this.ws.terminate(); }

    } catch (error) {
      console.error(error);
    }
  }

  destroy() {
    Object.keys(this.emitters).map(WsStreamEmitterType => this.emitters[WsStreamEmitterType].complete());
    this.emitters = {};
  }


  // ---------------------------------------------------------------------------------------------------
  //  open . close . error
  // ---------------------------------------------------------------------------------------------------

  protected async onWsOpen(event: WebSocket.Event) {
    const wsType = this.streamType === 'market' ? 'public' : 'private';

    if (this.status === 'reconnecting') {
      console.log(this.wsId, '=> reconnected!');
      this.emit('reconnected', { event });
    } else {
      console.log(this.wsId, '=> connected!');
      this.emit('open', { event });

    }
    if (wsType === 'private') {
      await this.login();
    } else {
      this.onConnected();
    }
  }

  protected async login() {
    const { apiKey, apiSecret, apiPassphrase } = this;
    this.status = 'login';
    this.loggedIn = false;
    const timestamp = Date.now() / 1000;
    const message = `${timestamp}GET/users/self/verify`;
    const signature = await this.signMessage(message, apiSecret);
    const data: OkxWsLoginRequest = { op: 'login', args: [{ apiKey, passphrase: apiPassphrase, timestamp, sign: signature }] };
    console.log(`${this.wsId} =>`, data);
    this.ws.send(JSON.stringify(data));
  }

  protected onConnected() {
    this.status = 'connected';
    // Iniciem la comunicació ping-pong.
    if (this.pingTimer) { this.pingTimer.unsubscribe(); }
    this.pingTimer = interval(this.pingInterval).subscribe(() => this.ping());
    // Establim les subscripcions dels topics.
    this.respawnChannelSubscriptions();
  }

  protected onWsClose(event: WebSocket.CloseEvent) {
    console.log(this.wsId, '=> closed');
    if (this.status !== 'closing') {
      this.reconnect();
      this.emit('reconnecting', { event });
    } else {
      this.status = 'initial';
      this.emit('close', { event });
    }
  }

  protected onWsError(event: WebSocket.ErrorEvent) {
    // console.log(this.wsId, '=> onWsError');
    console.error(`${this.wsId} =>`, event?.error || event);
  }


  // ---------------------------------------------------------------------------------------------------
  //  ping . pong
  // ---------------------------------------------------------------------------------------------------

  protected ping() {
    console.log(this.wsId, `=> Sending ping...`);
    try {
      if (this.pongTimer) { this.pongTimer.unsubscribe(); }

      if (typeof this.ws.ping === 'function') {
        this.pongTimer = timer(this.pongTimeout).subscribe(() => {
          console.log(this.wsId, `=> Pong timeout - closing socket to reconnect`);
          this.reconnect();
        });
        this.ws.ping();
      } else {
        // this.ws.send(0x09);
        // this.ws.send(Buffer.alloc(0x09));
      }

    } catch (error) {
      console.error(this.wsId, `=> Failed to send WS ping`, error);
      // TODO: Notificar l'error.
    }
  }

  protected onWsPing(event: any) {
    try {
      console.log(this.wsId, '=> Received ping, sending pong');
      if (typeof this.ws.pong === 'function') {
        this.ws.pong();
      } else {
        // this.ws.send(0xA);
      }

    } catch (error) {
      console.error(this.wsId, `=> Failed to send WS pong`, error);
      // TODO: Notificar l'error.
    }
  }

  protected onWsPong(event: any) {
    console.log(this.wsId, '=> Received pong, clearing timer');
    if (this.pongTimer) { this.pongTimer.unsubscribe(); }
  }


  // ---------------------------------------------------------------------------------------------------
  //  message event
  // ---------------------------------------------------------------------------------------------------

  protected onWsMessage(event: WebSocket.MessageEvent) {
    const data = this.parseWsMessage(event);
    this.emit('message', data);
    switch (this.discoverEventType(data)) {
      case 'login':
        this.loggedIn = true;
        this.onConnected();
        break;
      case 'tickers':
      case 'klines':
      case 'account':
      case 'balance_and_position':
      // case 'positions':
      case 'orders':
      case 'orders-algo':
        const obj = data as OkxWsChannelEvent;
        this.emitChannelEvent(obj);
        break;
      default:
        console.log('onWsMessage =>', data);
        console.log(JSON.stringify(data));
    }
  }

  protected parseWsMessage(event: any): any {
    if (typeof event === 'string') {
      const parsedEvent = JSON.parse(event);
      if (parsedEvent.data) {
        return this.parseWsMessage(parsedEvent.data);
      }
    }
    return event?.data ? JSON.parse(event.data) : event;
  }

  protected discoverEventType(data: any): OkxWsChannelType | 'klines' | OkxWsEventType | undefined {
    const obj = Array.isArray(data) ? (data.length ? data[0] : undefined) : data;
    if (typeof obj === 'object') {
      if (obj.hasOwnProperty('event')) {
        return obj.event as OkxWsEventType;
      } else if (obj.hasOwnProperty('arg') && obj.arg.hasOwnProperty('channel')) {
        const ev = obj as OkxWsChannelEvent;
        const channel = ev.arg.channel.startsWith('candle') ? 'klines' : ev.arg.channel;
        return channel;
      }
    }
    return undefined;
  }


  // ---------------------------------------------------------------------------------------------------
  //  Public channels
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-public-channel-tickers-channel Tickers channel} */
  priceTicker(symbol: SymbolType): Subject<MarketPrice> {
    const channel: OkxWsChannelType = `tickers`;
    const instId = `${formatSymbol(symbol)}-${this.okxMarket}`;
    return this.registerChannelSubscription({ channel, instId });
  }

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-public-channel-candlesticks-channel Candlesticks channel} */
  klineTicker(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline> {
    const channel: OkxWsChannelType = `candle${interval}`;
    const instId = `${formatSymbol(symbol)}-${this.okxMarket}`;
    return this.registerChannelSubscription({ channel, instId });
  }


  // ---------------------------------------------------------------------------------------------------
  //  Private channels
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-account-channel Account channel} */
  accountUpdate(asset?: CoinType): Subject<WsAccountUpdate> {
    const channel: OkxWsChannelType = 'account';
    const ccy = asset ? { ccy: asset } : undefined;
    return this.registerChannelSubscription({ channel, ...ccy });
  }

  // /** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-positions-channel Positions channel} */
  // positionsUpdate(symbol?: SymbolType): Subject<any> {
  //   const channel: OkxWsChannelType = 'positions';
  //   const instType = this.okxMarket;
  //   const uly = symbol ? { uly: formatSymbol(symbol) } : undefined;
  //   return this.registerChannelSubscription({ channel, instType, ...uly });
  // }

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-balance-and-position-channel Balance and position channel} */
  balancePositionUpdate(): Subject<WsBalancePositionUpdate> {
    const channel: OkxWsChannelType = 'balance_and_position';
    return this.registerChannelSubscription({ channel });
  }

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-order-channel Order channel} */
  orderUpdate(symbol?: SymbolType): Subject<Order> {
    const instType = this.okxMarket;
    const uly = symbol ? { uly: formatSymbol(symbol) } : undefined;
    const subject = this.registerChannelSubscription([{ channel: 'orders', instType, ...uly }, { channel: 'orders-algo', instType, ...uly }]);
    return subject;
  }

  // /** {@link https://www.okx.com/docs-v5/en/#websocket-api-private-channel-position-risk-warning Position risk warning} */
  // positionRiskWarnig(symbol?: SymbolType): Subject<any> {
  //   const channel: OkxWsChannelType = 'liquidation-warning';
  //   const instType = this.okxMarket;
  //   const uly = symbol ? { uly: formatSymbol(symbol) } : undefined;
  //   return this.registerChannelSubscription({ channel, instType, ...uly });
  // }


  // ---------------------------------------------------------------------------------------------------
  //  Channel subscriptions
  // ---------------------------------------------------------------------------------------------------

  protected registerChannelSubscription(args: OkxWsSubscriptionArguments | OkxWsSubscriptionArguments[]) {
    if (!Array.isArray(args)) { args = [args] };
    // Ex: channelKey = 'orders#SWAP;orders-algo#SWAP'
    const channelKey = args.map(arg => buildChannelKey(arg)).join(';');
    const stored = this.emitters[channelKey]
    if (stored) { return stored; }
    const created = new Subject<any>();
    this.emitters[channelKey] = created;
    this.subArguments[channelKey] = args;
    if (this.status === 'connected') { args.map(a => this.subscribeChannel(a)); }
    return created;
  }

  protected respawnChannelSubscriptions() {
    const topics: string[] = [];
    Object.keys(this.emitters).map(channelKey => {
      const stored = this.emitters[channelKey];
      const hasSubscriptions = !isSubjectUnobserved(stored);
      if (hasSubscriptions) {
        const args = this.subArguments[channelKey];
        args.map(a => this.subscribeChannel(a));
      } else {
        if (stored) { stored.complete(); }
        delete this.emitters[channelKey];
        delete this.subArguments[channelKey];
      }
    });
  }

  protected emitChannelEvent(ev: OkxWsChannelEvent) {
    // NOTA: Eliminem l'identificador d'usuari que l'exchange ha afegit a la resposta per fer coincidir la channelKey.
    delete ev.arg.uid;
    const channelKey = Object.keys(this.subArguments).find(key => !!this.subArguments[key].find(arg => matchChannelKey(arg, ev.arg)));
    const stored = this.emitters[channelKey];
    if (!stored) { return; }
    const hasSubscriptions = !isSubjectUnobserved(stored);
    if (hasSubscriptions) {
      const parser = this.getChannelParser(ev.arg);
      const value = parser ? parser(ev) : ev;
      stored.next(value);
    } else {
      this.unsubscribeChannel(ev.arg);
      if (stored) { stored.complete(); }
      delete this.emitters[channelKey];
      delete this.subArguments[channelKey];
    }
  }

  protected getChannelParser(arg: OkxWsSubscriptionArguments) {
    console.log('getChannelParser => ', arg);
    const channel = arg.channel.startsWith('candle') ? 'klines' : arg.channel;
    switch (channel) {
      case 'tickers': return parsePriceTickerEvent;
      case 'klines': return parseKlineTickerEvent;
      case 'account': return parseAccountUpdateEvent;
      case 'balance_and_position': return parseBalancePositionUpdateEvent;
      case 'orders': return parseOrderUpdateEvent;
      case 'orders-algo': return parseOrderUpdateEvent;
      default: return undefined;
    }
  }

  protected subscribeChannel(arg: OkxWsSubscriptionArguments) {
    const data: OkxWsSubscriptionRequest = { op: "subscribe", args: [arg] };
    console.log(this.wsId, '=> subscribing...', JSON.stringify(data));
    this.ws.send(JSON.stringify(data), error => error ? this.onWsError(error as any) : undefined);
  }

  protected unsubscribeChannel(arg: OkxWsSubscriptionArguments) {
    console.log(this.wsId, '=> unsubscribing...', arg);
    const data: OkxWsSubscriptionRequest = { op: "unsubscribe", args: [arg] };
    this.ws.send(JSON.stringify(data), error => error ? this.onWsError(error as any) : undefined);
  }


  // ---------------------------------------------------------------------------------------------------
  //  log
  // ---------------------------------------------------------------------------------------------------

  protected get wsId(): string { return `${this.market}-${this.streamType}-ws`; }

}

