import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { createHmac } from 'crypto';
import moment, { unitOfTime } from "moment";

import { ExchangeApi, MarketType, HttpMethod, ApiOptions, ApiRequestOptions, SymbolType, MarketPrice, KlinesRequest, MarketKline, KlineIntervalType, calculateCloseTime } from '@metacodi/abstract-exchange';
import { ApiClient } from "@metacodi/node-api-client";
import { timestamp } from "@metacodi/node-utils";

import { OkxMarketType } from "./types/okx.types";
import { formatKlineInterval, formatMarketType, formatSymbol, parseKlineInterval, parseKlineTickerEvent, parseKlinesResults } from './types/okx-parsers';



/** {@link https://www.okx.com/docs-v5/en/#rest-api-authentication-making-requests Making Requests} */
export class OkxApi extends ApiClient {
// export class OkxApi implements ExchangeApi {

  /** Opcions de configuració. */
  protected options: ApiOptions;

  constructor(
    options?: ApiOptions,
  ) {
    super(options);
  }


  // ---------------------------------------------------------------------------------------------------
  //  options
  // ---------------------------------------------------------------------------------------------------

  get okxMarket(): OkxMarketType { return formatMarketType(this.market); }
  
  get market(): MarketType { return this.options?.market; }


  // ---------------------------------------------------------------------------------------------------
  //  ApiClient implementation
  // ---------------------------------------------------------------------------------------------------

  /** Retorna la url base sense el protocol.
   * {@link https://www.okx.com/docs-v5/en/#overview-production-trading-services Production Trading Services}
   * {@link https://www.okx.com/docs-v5/en/#overview-demo-trading-services Demo Trading Services}
   * 
   *  OKX account can be used for login on Demo Trading. If you already have an OKX account, you can log in directly.
   *  Start API Demo Trading by the following steps:
   *  Login OKX —> Assets —> Start Demo Trading —> Personal Center —> Demo Trading API -> Create Demo Trading V5 APIKey —> Start your Demo Trading
   */
   baseUrl(): string { return `www.okx.com` };

  async request(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): Promise<any> {

    if (!options) { options = {}; }
    options.headers = options.headers || {};
    if (method === 'POST' || method === 'PUT') {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Accept'] = 'application/json' ;
    }

    return super.request(method, endpoint, options);
  }


  /** {@link https://www.okx.com/docs-v5/en/#rest-api-authentication-making-requests Making Requests} */
  protected async getAuthHeaders(method: HttpMethod, endpoint: string, params: any) {
    const { apiKey, apiSecret, apiPassphrase } = this;
    
    const timestamp = new Date().toISOString();
    const message = this.buildSignMessage(timestamp, method, endpoint, params);
    const signature = await this.signMessage(message, apiSecret);
    const headers: { [header: string]: number | string } = {
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-KEY': apiKey,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': apiPassphrase || '',
      'x-simulated-trading': this.isTest ? '1' : '0',
    };
    return headers;
  }


  // ---------------------------------------------------------------------------------------------------
  //  Public
  // ---------------------------------------------------------------------------------------------------

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-instruments Get instruments} */
  getInstruments(): Promise<any[]> {
    return this.get(`api/v5/public/instruments?instType=${this.okxMarket}`, { isPublic: true });
  }

  // getExchangeInfo(): Promise<ExchangeInfo> {

  // }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-public-data-get-mark-price Get mark price} */
  async getPriceTicker(symbol: SymbolType): Promise<MarketPrice> {
    const uly = formatSymbol(symbol);
    return this.get(`api/v5/public/mark-price?instType=${this.okxMarket}&uly=${uly}`, { isPublic: true }).then(response => {
      const data = response.data[0];
      return {
        symbol,
        price: +data.markPx,
        timestamp: timestamp(+data.ts),
        baseVolume: undefined,
        quoteVolume: undefined,
      };
    });
  }
  
  /** {@link https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history Get candlesticks history} */
  async getKlines(params: KlinesRequest): Promise<MarketKline[]> {
    const { symbol, interval, limit } = params;
    const instId = `${formatSymbol(symbol)}-${this.okxMarket}`;
    const bar = formatKlineInterval(interval);
    // NOTA: Ampliem el conjunt per incloure l'inici (start) i el final (end) a la consulta pq l'api exclou els límits del conjunt.
    const unit = interval.charAt(interval.length - 1) as unitOfTime.DurationConstructor;
    const duration = +interval.slice(0, -1);
    const start: string | moment.MomentInput = params.start ? moment(params.start).subtract(duration, unit) : moment();
    const before: string | moment.MomentInput = params.end ? moment(params.end).add(duration, unit) : '';
    const toUnix = (time: string | moment.MomentInput): string => { return moment(time).unix().toString() + '000'; }
    const requestKlines = (query: string): Promise<MarketKline[]> => this.get(`api/v5/market/history-candles${query}`, { isPublic: true }).then(r => parseKlinesResults(interval, this.market, symbol, r));
    const results: MarketKline[] = [];
    
    let after: string | moment.MomentInput = start;
    if (!before && !limit) {
      const query = this.formatQuery({ instId, bar });
      results.push(...await requestKlines(query));

    } else if (!before && !!limit) {
      do {
        const query = this.formatQuery({ instId, bar, after: toUnix(after) });
        const response = await requestKlines(query);
        if (!response.length) { break; }
        results.push(...response);
        after = results[results.length - 1].openTime;
      } while (results.length < limit);
      if (results.length > limit) { results.splice(limit); }

    } else {
      do {
        const query = this.formatQuery({ instId, bar, after: toUnix(after), before: toUnix(before) });
        const response = await requestKlines(query);
        if (!response.length) { break; }
        results.push(...response);
        after = results[results.length - 1].openTime;
      } while (moment(after).isAfter(moment(before)));
    }
    return results;
  }

}
