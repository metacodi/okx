import { OkxApi } from "./okx-api";
import { OkxApiOptions, OkxMarketType } from "./types/okx.types";

export class OkxApiFunctions extends OkxApi {
  
  market: OkxMarketType = 'SPOT';

  constructor(
    options?: OkxApiOptions,
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
    return this.get(`api/v5/public/instruments?instType=${this.market}`, { isPublic: true });
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments Get instruments} */
  getSymbolInformation(symbol: string): Promise<any> {
    return this.get(`api/v5/public/instruments?instType=${this.market}&instId=${symbol}`, { isPublic: true });
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-limit-price Get limit price} */
  getLimitPrice(symbol: string): Promise<any[]> {
    return this.get(`api/v5/public/price-limit?instId=${symbol}`, { isPublic: true });
  }

 /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-mark-price Get mark price} */
  async getMarketPrice(symbol: string): Promise<any> {
    const results = await this.get(`api/v5/public/mark-price?instType=${this.market}&instId=${symbol}`, { isPublic: true }) as { code: string; data: any };
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


  
  // /** {@link https://docs.kucoin.com/futures/#get-open-contract-list Get Open Contract List} */
  // getActiveSymbols(): Promise<any[]> {
  //   return this.get(`api/v1/contracts/active`, { isPublic: true });
  // }

  // /** {@link https://docs.kucoin.com/futures/#get-order-info-of-the-contract Get Order Info of the Contract} */
  // getSymbolInformation(symbol: string): Promise<KucoinFuturesSymbolInformation> {
  //   return this.get(`api/v1/contracts/${symbol}`, { isPublic: true });
  // }

  // /** {@link https://docs.kucoin.com/futures/#get-real-time-ticker Get Ticker} */
  // async getSymbolPriceTicker(params: KucoinFuturesSymbolRequest): Promise<KucoinFuturesSymbolPriceTicker> {
  //   const results = await this.get(`api/v1/ticker`, { isPublic: true, params }) as { code: string; data: KucoinFuturesSymbolPriceTicker };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#k-chart Get K Line Data of Contract} */
  // getKChart(symbol: string, from: number, to: number): Promise<any> {
  //   return this.get(`api/v1/kline/query?symbol=${symbol}&granularity=1&from=${from}&to=${to}`, { isPublic: true });
  // }


  // // ---------------------------------------------------------------------------------------------------
  // //  Account
  // // ---------------------------------------------------------------------------------------------------

  // /** {@link https://docs.kucoin.com/futures/#get-account-overview Get Account Overview} */
  // async getAccountOverview(params?: KucoinFuturesAccountOverviewRequest): Promise<KucoinFuturesAccountOverview> {
  //   const results = await this.get('api/v1/account-overview', { params }) as { code: string; data: KucoinFuturesAccountOverview };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }

  // /** {@link https://docs.kucoin.com/futures/#get-position-list Get Position List} */
  // async getPositions(): Promise<KucoinFuturesPosition> {
  //   return this.get('api/v1/positions');
  // }

  // /** {@link https://docs.kucoin.com/futures/#get-position-details Get Position Details} */
  // async getPosition(params: KucoinFuturesSymbolRequest): Promise<KucoinFuturesPosition> {
  //   return this.get('api/v1/position', { params });
  // }
  
  // /** {@link https://docs.kucoin.com/futures/#risk-limit-level Risk Limit Level} */
  // async getRiskLimitLevel(symbol: string): Promise<KucoinFuturesRiskLimit[]> {
  //   const results = await this.get(`api/v1/contracts/risk-limit/${symbol}`) as { code: string; data: KucoinFuturesRiskLimit[] };
  //   if (results.code === '200000') { return results.data; }
  //   return Promise.reject(results);
  // }
  

  // // ---------------------------------------------------------------------------------------------------
  // //  Orders
  // // ---------------------------------------------------------------------------------------------------

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