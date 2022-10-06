import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { createHmac } from 'crypto';
import moment, { unitOfTime } from "moment";

import { ExchangeApi, MarketType, HttpMethod, ApiOptions, ApiRequestOptions, SymbolType, MarketPrice, KlinesRequest, MarketKline, KlineIntervalType, calculateCloseTime } from '@metacodi/abstract-exchange';
import { timestamp } from "@metacodi/node-utils";

import { OkxMarketType } from "./types/okx.types";
import { formatKlineInterval, formatMarketType, formatSymbol, parseKlineInterval, parseKlineTickerEvent, parseKlinesResults } from './types/okx-parsers';



/** {@link https://www.okx.com/docs-v5/en/#rest-api-authentication-making-requests Making Requests} */
export class OkxApi {
// export class OkxApi implements ExchangeApi {
  
  /** Retorna la url base sense el protocol.
   * {@link https://www.okx.com/docs-v5/en/#overview-production-trading-services Production Trading Services}
   * {@link https://www.okx.com/docs-v5/en/#overview-demo-trading-services Demo Trading Services}
   * 
   *  OKX account can be used for login on Demo Trading. If you already have an OKX account, you can log in directly.
   *  Start API Demo Trading by the following steps:
   *  Login OKX —> Assets —> Start Demo Trading —> Personal Center —> Demo Trading API -> Create Demo Trading V5 APIKey —> Start your Demo Trading
   */
  baseUrl(): string { return `www.okx.com` };

  /** Opcions de configuració. */
  protected options: ApiOptions;

  constructor(
    options?: ApiOptions,
  ) {
    this.options = { ...this.defaultOptions, ...options };
  }


  // ---------------------------------------------------------------------------------------------------
  //  options
  // ---------------------------------------------------------------------------------------------------

  get okxMarket(): OkxMarketType { return formatMarketType(this.market); }
  
  get market(): MarketType { return this.options?.market; }

  /** {@link https://www.okx.com/es-es/account/my-api Create API Keys} */
  get apiKey(): string { return this.options?.apiKey; }
  
  get apiSecret(): string { return this.options?.apiSecret; }
  
  get apiPassphrase(): string { return this.options?.apiPassphrase; }
  
  get isTest(): boolean { return !!this.options?.isTest; }
  
  get defaultOptions(): Partial<ApiOptions> {
    return {
      isTest: false,
      // recvWindow: 5000,
    }
  }

  public setCredentials(data: { apiKey: string; apiSecret: string; apiPassphrase: string }): void {
    this.options.apiKey = data.apiKey;
    this.options.apiSecret = data.apiSecret;
    this.options.apiPassphrase = data.apiPassphrase;
  }


  // ---------------------------------------------------------------------------------------------------
  //  request helpers
  // ---------------------------------------------------------------------------------------------------

  public get(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('GET', endpoint, options); }

  public post(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('POST', endpoint, options); }

  public put(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('PUT', endpoint, options); }

  public delete(endpoint: string, options?: ApiRequestOptions): Promise<any> { return this.request('DELETE', endpoint, options); }


  // ---------------------------------------------------------------------------------------------------
  //  request
  // ---------------------------------------------------------------------------------------------------

  async request(method: HttpMethod, endpoint: string, options?: ApiRequestOptions): Promise<any> {
    if (!options) { options = {}; }
    const isPublic = options.isPublic === undefined ? false : options.isPublic;
    const headers = options.headers === undefined ? undefined : options.headers;
    const params = options.params === undefined ? undefined : options.params;

    const baseUrl = this.baseUrl();
    const [uri, _query = ''] = endpoint.split('?');

    const config: AxiosRequestConfig<any> = {
      method,
      // url: 'https://' + [baseUrl, endpoint].join('/'),
      headers: { ...headers as any},
      // timeout: 1000 * 60 * 5, // 5 min.
    };

    const { body, query } = this.resolveData(method, params || {});

    if (query) {
      const concat = endpoint.includes('?') ? (endpoint.endsWith('?') ? '' : '&') : '?';
      endpoint += concat + query;
    }

    if (method === 'POST' || method === 'PUT') {
      config.headers['Content-Type'] = 'application/json' ;
      config.headers['Accept'] = 'application/json' ;
      config.data = body;
    }1

    if (!isPublic) {
      const authHeaders = await this.getAuthHeaders(method, '/' + endpoint, body);
      config.headers = { ...config.headers, ...authHeaders } as any;
    }
    
    config.url = 'https://' + [baseUrl, endpoint].join('/');

    console.log(config);
    
    return axios(config).then(response => {
      // console.log(config.url, response);
      if (response.status !== 200) { throw response; }
      return response.data;
    }).catch(e => this.parseException(e, config.url));
  }

  protected resolveData(method: HttpMethod, data: { [key: string]: any } = {}, options?: { encodeValues?: boolean, strictValidation?: boolean }) {
    if (!options) { options = {}; }
    const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
    const encodeValues = options.encodeValues === undefined ? true : options.encodeValues;
    const d: { [key: string]: any } = {};
    Object.keys(data).map(key => {
      const value = data[key];
      if (strictValidation && value === undefined) {
        throw new Error('Failed to sign API request due to undefined parameter');
      }
      const canEncode = method === 'GET' || method === 'DELETE';
      const encodedValue = encodeValues && canEncode ? encodeURIComponent(value) : value;
      d[key] = encodedValue;
    });

    if (method === 'GET' || method === 'DELETE') {
      return {
        query: Object.keys(d).map(v => `${v}=${d[v]}`).join('&'),
        body: undefined,
      }
    } else {
      return {
        query: '',
        body: JSON.stringify(d),
      }
    }
  }

  /** {@link https://www.okx.com/docs-v5/en/#rest-api-authentication-making-requests Making Requests} */
  protected async getAuthHeaders(method: string, endpoint: string, params: any) {
    const { apiKey, apiSecret, apiPassphrase } = this;
    // const { authVersion } = getConfig();
    
    const timestamp = new Date().toISOString();
    const mParams = String(JSON.stringify(params)).slice(1, -1);
    const formatedParams = String(mParams).replace(/\\/g, '');
    const data = (method === 'GET' || method === 'DELETE') ? this.formatQuery(params) : formatedParams;
    const message = timestamp + method + endpoint + data;
    // console.log('message =>', message);
    const signature = await this.signMessage(message, apiSecret);
    const headers: { [header: string]: number | string } = {
      'OK-ACCESS-KEY': apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': apiPassphrase || '',
      'x-simulated-trading': this.isTest ? '1' : '0',
    };
    return headers;
  }


  protected formatQuery(params: any) {
    if (!!params && JSON.stringify(params).length !== 2) {
      const serialisedParams = this.serialiseParams(params, { encodeValues: true });
      return '?' + serialisedParams;
      // return '?' + qs.stringify(params)
    } else {
      return '';
    }
  }

  protected serialiseParams(params: { [key: string]: any } = {}, options?: { encodeValues?: boolean, strictValidation?: boolean }): string {
    if (!options) { options = {}; }
    const strictValidation = options.strictValidation === undefined ? false : options.strictValidation;
    const encodeValues = options.encodeValues === undefined ? true : options.encodeValues;
    return Object.keys(params).map(key => {
      const value = params[key];
      if (strictValidation && value === undefined) {
        throw new Error('Failed to sign API request due to undefined parameter');
      }
      const encodedValue = value === undefined ? '' : (encodeValues ? encodeURIComponent(value) : value);
      return `${key}=${encodedValue}`;
    }).join('&');
  };


  async signMessage(message: string, secret: string): Promise<string> {
    // Si és possible, fem servir la funció de crypto.
    if (typeof createHmac === 'function') {
      return createHmac('sha256', secret).update(message).digest('base64');
    }
    // Si no s'ha pogut importar la funció en entorn browser, li donem suport.
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const algorithm = {name: 'HMAC', hash: {name: 'SHA-256'}};
    const extractable = false;
    const keyUsages: KeyUsage[] = ['sign'];
    const key = await window.crypto.subtle.importKey('raw', keyData, algorithm, extractable, keyUsages);
    const signature = await window.crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Buffer.from(signature).toString('base64');
  };

  protected parseException(e: AxiosError, url: string): unknown {
    const { response, request, message } = e;
    // Si no hem rebut una resposta...
    if (!response) { throw request ? e : message; }
    throw {
      code: response.data?.code,
      message: response.data?.msg,
      body: response.data,
      headers: response.headers,
      requestUrl: url,
      requestBody: request.body,
      options: { ...this.options },
    };
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
        // baseVolume: 0.0,
        // quoteVolume: 0.0,
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
