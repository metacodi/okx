import { ApiOptions } from '@metacodi/abstract-exchange';

import { OkxApi } from "./okx-api";
import { OkxInstrumentType } from './types/okx.types';


export class OkxApiFunctions extends OkxApi {

  instrument: OkxInstrumentType = 'SPOT';

  constructor(
    options?: ApiOptions,
  ) {
    super(options);
  }

  /** Retorna la url base sense el protocol.
   * {@link https://www.okx.com/docs-v5/en/#overview-production-trading-services Production Trading Services}
   * {@link https://www.okx.com/docs-v5/en/#overview-demo-trading-services Demo Trading Services}
   * 
   *  OKX account can be used for login on Demo Trading. If you already have an OKX account, you can log in directly.
   *  Start API Demo Trading by the following steps:
   *  Login OKX —> Assets —> Start Demo Trading —> Personal Center —> Demo Trading API -> Create Demo Trading V5 APIKey —> Start your Demo Trading
   */
  baseUrl(): string { return this.isTest ? `www.okx.com` : `www.okx.com`; }


  // ---------------------------------------------------------------------------------------------------
  //  Public
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments Get instruments} */
  getInstruments(): Promise<any[]> {
    return this.get(`api/v5/public/instruments?instType=${this.instrument}`, { isPublic: true });
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments Get instruments} */
  getSymbolInformation(symbol: string): Promise<any> {
    return this.get(`api/v5/public/instruments?instType=${this.instrument}&instId=${symbol}`, { isPublic: true });
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-limit-price Get limit price} */
  getLimitPrice(symbol: string): Promise<any[]> {
    return this.get(`api/v5/public/price-limit?instId=${symbol}`, { isPublic: true });
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-mark-price Get mark price} */
  async getMarketPrice(symbol: string): Promise<any> {
    const results = await this.get(`api/v5/public/mark-price?instType=${this.instrument}&instId=${symbol}`, { isPublic: true }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }


  // ---------------------------------------------------------------------------------------------------
  //  Market
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-market-data-get-ticker Get ticker} */
  async getSymbolPriceTicker(symbol: string): Promise<any> {
    const results = await this.get(`api/v5/market/ticker?instId=${symbol}`, { isPublic: true }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks Get candlesticks} */
  async getKChart(symbol: string, options?: { bar?: string, after?: string, before?: string, limit?: string }): Promise<any> {
    const bar = options?.bar === undefined ? '' : options.bar;
    const after = options?.after === undefined ? '' : options.after;
    const before = options?.before === undefined ? '' : options.before;
    const limit = options?.limit === undefined ? '' : options.limit;
    const results = await this.get(`api/v5/market/candles?instId=${symbol}&bar=${bar}&after=${after}&before=${before}&limit=${limit}`, { isPublic: true }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history Get candlesticks history} */
  async getKChartHistory(symbol: string, options?: { bar?: string, after?: string, before?: string, limit?: string }): Promise<any> {
    const bar = options?.bar === undefined ? '' : options.bar;
    const after = options?.after === undefined ? '' : options.after;
    const before = options?.before === undefined ? '' : options.before;
    const limit = options?.limit === undefined ? '' : options.limit;
    const results = await this.get(`api/v5/market/history-candles?instId=${symbol}&bar=${bar}&after=${after}&before=${before}&limit=${limit}`, { isPublic: true }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }


  // ---------------------------------------------------------------------------------------------------
  //  Account
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-account-get-balance Get balance} */
  async getAccountOverview(ccy?: string): Promise<any> {
    ccy = ccy === undefined ? '' : ccy;
    const results = await this.get(`api/v5/account/balance?ccy=${ccy}`) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-account-get-positions Get positions} */
  async getPositions(options?: { instType?: string, instId?: string, posId?: string }): Promise<any> {
    const instType = options?.instType === undefined ? '' : options.instType;
    const instId = options?.instId === undefined ? '' : options.instId;
    const posId = options?.posId === undefined ? '' : options.posId;
    const results = await this.get(`api/v5/account/positions?instType=${instType}&instId=${instId}&posId=${posId}`) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);

  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-account-get-positions-history Get positions history} */
  async getPositionsHistory(options?: { instType?: string, instId?: string, mgnMode?: string, type?: string, posId?: string, after?: string, before?: string, limit?: string }): Promise<any> {
    const instType = options?.instType === undefined ? '' : options.instType;
    const instId = options?.instId === undefined ? '' : options.instId;
    const mgnMode = options?.mgnMode === undefined ? '' : options.mgnMode;
    const type = options?.type === undefined ? '' : options.type;
    const posId = options?.posId === undefined ? '' : options.posId;
    const after = options?.after === undefined ? '' : options.after;
    const before = options?.before === undefined ? '' : options.before;
    const limit = options?.limit === undefined ? '' : options.limit;
    const results = await this.get(`api/v5/account/positions-history?instType=${instType}&instId=${instId}&mgnMode=${mgnMode}&type=${type}&posId=${posId}&after=${after}&before=${before}&limit=${limit}`) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-account-set-position-mode Set position mode} */
  async setPositionMode(posMode: string): Promise<any> {
    posMode = posMode === undefined ? 'long_short_mode' : posMode; // long_short_mode: long/short, only applicable to FUTURES/SWAP
    const params = { posMode };
    const results = await this.post(`api/v5/account/set-position-mode`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-account-get-leverage Get leverage} */
  async getLeverage(instId: string, mgnMode: string): Promise<any> {
    const results = await this.get(`api/v5/account/leverage-info?instId=${instId}&mgnMode=${mgnMode}`) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-account-set-leverage Set leverage} */
  async setLeverage(lever: string, mgnMode: string, options?: { instId?: string, ccy?: string, posSide?: string }): Promise<any> {
    const instId = options?.instId === undefined ? '' : options.instId;
    const ccy = options?.ccy === undefined ? '' : options.ccy;
    const posSide = options?.posSide === undefined ? '' : options.posSide;
    const params = { lever, mgnMode, instId, ccy, posSide };
    const results = await this.post(`api/v5/account/set-leverage`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-account-get-fee-rates Get fee rates} */
  async getFeeRates(instType: string, options?: { instId?: string, uly?: string, posSide?: string }): Promise<any> {
    const instId = options?.instId === undefined ? '' : options.instId;
    const uly = options?.uly === undefined ? '' : options.uly;
    const results = await this.get(`api/v5/account/trade-fee?instType=${instType}&instId=${instId}&uly=${uly}`) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }


  // ---------------------------------------------------------------------------------------------------
  //  Orders
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-trade-place-order Place order} */
  async postOrder(instId: string, tdMode: string, side: string, ordType: string, sz: number, options?: { ccy?: string, clOrdId?: string, posSide?: string }): Promise<any> {
    let params = { instId, tdMode, side, ordType, sz };
    params = options?.ccy === undefined ? params : { ...params, ...{ ccy: options.ccy } };
    params = options?.clOrdId === undefined ? params : { ...params, ...{ clOrdId: options.clOrdId } };
    params = options?.posSide === undefined ? params : { ...params, ...{ posSide: options.posSide } };
    const results = await this.post(`api/v5/trade/order`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-trade-close-positions Close positions} */
  async closePosition(instId: string, mgnMode: string, options?: { posSide?: string, ccy?: string, clOrdId?: string, autoCxl?: string, tag?: string }): Promise<any> {
    let params = { instId, mgnMode };
    params = options?.posSide === undefined ? params : { ...params, ...{ posSide: options.posSide } };
    params = options?.ccy === undefined ? params : { ...params, ...{ ccy: options.ccy } };
    params = options?.clOrdId === undefined ? params : { ...params, ...{ clOrdId: options.clOrdId } };
    params = options?.autoCxl === undefined ? params : { ...params, ...{ autoCxl: options.autoCxl } };
    params = options?.tag === undefined ? params : { ...params, ...{ tag: options.tag } };
    const results = await this.post(`api/v5/trade/close-position`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }


  /** {@link https://www.okx.com/docs-v5/en/#rest-api-trade-cancel-order Cancel order} */
  async cancelOrder(instId: string, options?: { ordId?: string, clOrdId?: string }): Promise<any> {
    let params = { instId };
    params = options?.ordId === undefined ? params : { ...params, ...{ ordId: options.ordId } };
    params = options?.clOrdId === undefined ? params : { ...params, ...{ clOrdId: options.clOrdId } };
    const results = await this.post(`api/v5/trade/cancel-order`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-trade-get-order-list Get order List} */
  async getOrders(options?: { instType: string, uly: string, instId: string, ordType?: string, state?: string, after?: string, before?: string, limit?: string }): Promise<any> {
    let params = {};
    params = options?.instId === undefined ? params : { ...params, ...{ instId: options.instId } };
    params = options?.ordType === undefined ? params : { ...params, ...{ ordType: options.ordType } };
    params = options?.state === undefined ? params : { ...params, ...{ state: options.state } };
    params = options?.after === undefined ? params : { ...params, ...{ after: options.after } };
    params = options?.before === undefined ? params : { ...params, ...{ before: options.before } };
    params = options?.limit === undefined ? params : { ...params, ...{ limit: options.limit } };
    const results = await this.get(`api/v5/trade/orders-pending`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-trade-get-order-details Get order details} */
  async getOrder(instId: string, options?: { ordId?: string, clOrdId?: string }): Promise<any> {
    let params = { instId };
    params = options?.ordId === undefined ? params : { ...params, ...{ ordId: options.ordId } };
    params = options?.clOrdId === undefined ? params : { ...params, ...{ clOrdId: options.clOrdId } };
    const results = await this.get(`api/v5/trade/order`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }


  // ---------------------------------------------------------------------------------------------------
  //  Founding
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-funding-get-balance Get balance} */
  async getAssetBalance(ccy?: string): Promise<any> {
    ccy = ccy === undefined ? '' : ccy;
    const results = await this.get(`api/v5/asset/balances?ccy=${ccy}`) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-funding-get-currencies Get currencies} */
  async getCurrencies(ccy?: string): Promise<any> {
    ccy = ccy === undefined ? '' : ccy;
    const results = await this.get(`api/v5/asset/currencies?ccy=${ccy}`) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-funding-funds-transfer Funds transfer} */
  async fundsTransfer(ccy: string, amt: string, from: string, to: string, options?: { subAcct: string, type: string, loanTrans: string, clientId?: string, omitPosRisk?: string }): Promise<any> {
    let params = { ccy, amt, from, to };
    params = options?.subAcct === undefined ? params : { ...params, ...{ subAcct: options.subAcct } };
    params = options?.type === undefined ? params : { ...params, ...{ type: options.type } };
    params = options?.loanTrans === undefined ? params : { ...params, ...{ loanTrans: options.loanTrans } };
    params = options?.clientId === undefined ? params : { ...params, ...{ clientId: options.clientId } };
    params = options?.omitPosRisk === undefined ? params : { ...params, ...{ omitPosRisk: options.omitPosRisk } };
    const results = await this.post(`api/v5/asset/transfer`, { params }) as { code: string; data: any };
    if (results.code === '0') { return results.data; }
    return Promise.reject(results);
  }


  // /** {@link https://docs.kucoin.com/futures/#get-order-list Get Order List} */
  // async getOrders(params?: KucoinFuturesGetOrdersRequest): Promise<KucoinFuturesGetOrdersResponse> {
  //   const results = await this.get('api/v1/orders', { params }) as { code: string; data: KucoinFuturesGetOrdersResponse };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#get-details-of-a-single-order Get Details of a Single Order} */
  // async getOrder(orderId: string, params: KucoinFuturesGetOrderRequest): Promise<KucoinFuturesOrder> {
  //   const results = await this.get(`api/v1/orders/${orderId}`, { params }) as { code: string; data: KucoinFuturesOrder };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#get-fills Get Fills} */
  // async getFills(params?: KucoinFuturesGetFillsRequest): Promise<KucoinFuturesGetFillsResponse> {
  //   const results = await this.get(`api/v1/fills`, { params }) as { code: string; data: KucoinFuturesGetFillsResponse };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#recent-fills Recent Fills} */
  // async getRecentFills(): Promise<KucoinFuturesOrderFilled> {
  //   const results = await this.get(`api/v1/recentFills`) as { code: string; data: KucoinFuturesOrderFilled };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#place-an-order Place an Order} */
  // async postOrder(params: KucoinFuturesPostOrderRequest): Promise<KucoinFuturesOrderResponse> {
  //   const results = await this.post('api/v1/orders', { params }) as { code: string; data: KucoinFuturesOrderResponse };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#cancel-an-order Cancel an Order} */
  // async cancelOrder(orderId: string): Promise<KucoinFuturesCancelOrdersResponse> {
  //   const results = await this.delete(`api/v1/orders/${orderId}`) as { code: string; data: KucoinFuturesCancelOrdersResponse };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#limit-order-mass-cancelation Limit Order Mass Cancelation} */
  // async cancelAllSymbolOrders(params?: KucoinFuturesCancelAllSymbolOrdersRequest): Promise<KucoinFuturesCancelOrdersResponse> {
  //   const results = await this.delete(`api/v1/orders`, { params }) as { code: string; data: KucoinFuturesCancelOrdersResponse };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }


}