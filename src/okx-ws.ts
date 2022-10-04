import WebSocket from 'isomorphic-ws';
import EventEmitter from 'events';
import { Subject, interval, timer, Subscription } from 'rxjs';

import { OkxApi } from './okx-api';
import { OkxApiOptions, OkxApiResquestOptions, OkxMarketType, OkxSubscription, OkxWebsocketOptions, WsConnectionState, WsStreamType } from './types/okx.types';

export class OkxWebsocket extends EventEmitter {
  /** Opcions de configuració. */
  protected options: OkxWebsocketOptions;
  /** Referència a la instància del websocket subjacent. */
  protected ws: WebSocket
  /** Referència a la instància del client API. */
  protected api: OkxApi;
  /** Estat de la connexió. */
  protected status: WsConnectionState = 'initial';
  /** Subscripció al interval que envia un ping al servidor per mantenir viva la connexió.  */
  protected pingTimer?: Subscription;
  /** Subscriptor al timer que controla la resposta del servidor. */
  protected pongTimer?: Subscription;
  /** Identificador de connexió rebut del servidor websocket. */
  protected connectId?: string;
  /** Emisors de missatges. */
  protected emitters: { [WsStreamEmitterType: string]: Subject<any> } = {};
  /** Identificador de login del servidor websocket. */
  protected loggedIn: boolean;
  /** Arguments. */
  protected argumets: { [key: string]: any } = {};

  constructor(
    options: OkxWebsocketOptions,
  ) {
    super();
    this.options = { ...this.defaultOptions, ...options };

    this.initialize();
  }

  // ---------------------------------------------------------------------------------------------------
  //  options
  // ---------------------------------------------------------------------------------------------------

  get market(): OkxMarketType { return this.options?.market; }

  get streamType(): WsStreamType { return this.options?.streamType; }

  get apiKey(): string { return this.options?.apiKey; }

  get apiSecret(): string { return this.options?.apiSecret; }

  get apiPassphrase(): string { return this.options?.apiPassphrase; }

  get isTest(): boolean { return this.options?.isTest; }

  get reconnectPeriod(): number { return this.options?.reconnectPeriod; }

  get pingInterval(): number { return this.options?.pingInterval; }

  get pongTimeout(): number { return this.options?.pongTimeout; }

  get defaultOptions(): Partial<OkxWebsocketOptions> {
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

    const url = !isTest ? `wss://ws.okx.com:8443/ws/v5/${wsType}`: `wss://wspap.okx.com:8443/ws/v5/${wsType}?brokerId=215489475109851136`;

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

  protected async login(){
    const { apiKey, apiSecret, apiPassphrase } = this;
    const timestamp = new Date().toISOString();
    const message = timestamp +'GET'+'/users/self/verify';
    this.loggedIn = false;
    // console.log('message =>', message);
    const signature = await this.api.signMessage(message, apiSecret);
    this.ws.send(JSON.stringify({
      op: 'login',
      args: [{
        apiKey: this.apiKey,
        passphrase: this.apiPassphrase,
        timestamp,
        signature
      }]
    }));

    this.on('login', () => this.loggedIn = true);
  }

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
    this.status = 'connected';
    // Iniciem la comunicació ping-pong.
    if (this.pingTimer) { this.pingTimer.unsubscribe(); }
    this.pingTimer = interval(this.pingInterval).subscribe(() => this.ping());
    // Ens logagem si es necessari
    if (wsType === 'private') { await this.login(); }
    // Establim les subscripcions dels topics.
    this.respawnTopicSubscriptions();
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
    console.log(data);
    switch (this.discoverEventType(data)) {
      case 'welcome':
        this.connectId = data.id;
        console.log(this.wsId, '=> connectId:', this.connectId);
        break;
      case 'symbolTicker':
        this.emitTopicEvent(data);
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


  protected discoverEventType(data: any): any {
    const obj = Array.isArray(data) ? (data.length ? data[0] : undefined) : data;
    if (typeof obj === 'object') {
      if (Object.keys(obj).length === 2 && obj.hasOwnProperty('id') && obj.hasOwnProperty('type')) {
        return obj.type;
      } else if (obj.hasOwnProperty('arg')) {
        const { channel } = obj.arg;
        if (channel === `tickers` ) { return 'symbolTicker'; }
        else if (channel) { return 'symbolTickerV2'; }
        // else if (topic.startsWith(`/contractMarket/tradeOrders`)) { return 'orderUpdate'; }
        // else if (topic === '/contractAccount/wallet' && subject === 'availableBalance.change') { return 'balanceUpdate'; }
        // else if (topic === '/contractAccount/wallet' && subject === 'withdrawHold.change') { return 'withdrawHold'; }
        // else if (topic.startsWith('/contract/position') && subject === 'position.change') { return 'positionChange'; }
        // else if (topic.startsWith('/contract/position') && subject === 'position.settlement') { return 'fundingSettlement'; }
        // else if (topic.startsWith('/contract/position') && subject === 'position.adjustRiskLimit') { return 'riskLimitChange'; }
      }
    }
    return undefined;
  }

   // ---------------------------------------------------------------------------------------------------
  //  Market (public)
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-public-channel-tickers-channel Tickers channel} */
  symbolTicker(symbol: string): Subject<any> {
    const topic = `tickers`;
    const subject = symbol;
    return this.registerTopicSubscription(topic, subject, { channel: topic, instId: symbol });
  }

  /** {@link https://www.okx.com/docs-v5/en/#websocket-api-public-channel-tickers-channel Candlesticks channel} */
  klines(symbol: string, channel: string): Subject<any> {
    const topic = channel;
    const subject = symbol;
    return this.registerTopicSubscription(topic, subject, { channel, instId: symbol });
  }


  // ---------------------------------------------------------------------------------------------------
  //  Topics subscriptions
  // ---------------------------------------------------------------------------------------------------

  private subscriptionId = 0;

  protected registerTopicSubscription(topic: string, subject: string, args: any) {
    const topicKey = subject ? `${topic}#${subject}` : topic;
    const stored = this.emitters[topicKey];
    if (stored) { return stored; }
    const created = new Subject<any>();
    this.emitters[topicKey] = created;
    this.argumets[topicKey] = args;
    // console.log('Register new topic =>', topicKey);
    if (this.status === 'connected') { this.subscribeTopic(args); }
    return created;
  }

  protected respawnTopicSubscriptions() {
    const topics: string[] = [];
    Object.keys(this.emitters).map(topicKey => {
      const stored = this.emitters[topicKey];
      const [topic, subject] = topicKey.split('#');
      const hasSubscriptions = !this.isSubjectUnobserved(stored);
      if (hasSubscriptions) {
        const args = this.argumets[topicKey];
        this.subscribeTopic( args);
      } else {
        if (stored) { stored.complete(); }
        delete this.emitters[topicKey];
      }
    });
  }

  protected emitTopicEvent(event: any) {
    if (typeof event !== 'object' || !event.hasOwnProperty('topic')) {
      throw (`No s'ha pogut interpretar el tipus d'event`);
    }
    const topic = event.topic;
    const subject = event.subject;
    const topicKey = subject ? `${topic}#${subject}` : topic;
    const stored = this.emitters[topicKey];
    if (!stored) { return; }
    const hasSubscriptions = !this.isSubjectUnobserved(stored);
    if (hasSubscriptions) {
      stored.next(event);
    } else {
      this.unsubscribeTopic(topic, subject);
      if (stored) { stored.complete(); }
      delete this.emitters[topicKey];
    }
  }

  protected isSubjectUnobserved(emitter: Subject<any>): boolean {
    return !emitter || emitter.closed || !emitter.observers?.length;
  }

  protected subscribeTopic(args: any) {
    // const channel = { channel, instId };
    const data: OkxSubscription = { op: "subscribe", args: [args]  };
    // if (instId) { data.instId = instId; }
    console.log(this.wsId, '=> subscribing...', JSON.stringify(data));
    this.ws.send(JSON.stringify(data), error => error ? this.onWsError(error as any) : undefined);
  }

  protected unsubscribeTopic(channel: string, instId?: string) {
    console.log(this.wsId, '=> unsubscribing...', { channel, instId });
    const data: any = { op: "unsubscribe", channel };
    if (instId) { data.instId = instId; }
    this.ws.send(JSON.stringify(data), error => error ? this.onWsError(error as any) : undefined);
  }


  // ---------------------------------------------------------------------------------------------------
  //  log
  // ---------------------------------------------------------------------------------------------------

  protected get wsId(): string { return `${this.market}-${this.streamType}-ws`; }
}

