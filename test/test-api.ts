import moment from 'moment';
import { interval } from 'rxjs';
import * as fs from 'fs';

import { Resource, timestamp } from '@metacodi/node-utils';
import { ApiOptions, MarketType } from '@metacodi/abstract-exchange';

import { getApiKeys } from './api-keys';
import { OkxApi } from '../src/okx-api';


/**
 * ```bash
 * npx ts-node test/test-api.ts
 * ```
 */

/** Archivo donde se escribirá la salida. */
const logFileName = 'results/getAssetBalance.ts';

/** Escribe en el archivo `logFileName`. */
function writeLog(variable: string, data: any) {
  const url = Resource.normalize(`./test/${logFileName}`);
  const value = JSON.stringify(data, null, ' ');
  console.log(value);
  fs.appendFileSync(url, `const ${variable} = ${value};\n\n`);
}

const testApi = async () => {
  try {

    console.log('---------------- API TEST ----------------------');

    // const market: MarketType = 'spot';
    const market: MarketType = 'futures';

    const isTest = false;

    const options: ApiOptions = {
      ...getApiKeys({ isTest }),
      market,
      isTest,
    } as any;

    // if (options.isTest) { setTestKeys(options, market); }

    // const api = new OkxApiFunctions(options);
    const api = new OkxApi(options);
    
    // ---------------------------------------------------------------------------------------------------
    //  ExchangeApi
    // ---------------------------------------------------------------------------------------------------

    // console.log('getPriceTicker() =>', await api.getPriceTicker('BTC_USDT'));

    // const results = await api.getKlines({ symbol: 'BTC_USDT', interval: '4h' });
    // const results = await api.getKlines({ symbol: 'BTC_USDT', interval: '30m', limit: 5, start: timestamp('2022-10-05 10:00'), end: timestamp('2022-10-01 09:30') });
    // const results = await api.getKlines({ symbol: 'BTC_USDT', interval: '30m', limit: 220 });
    // console.log('getKlines() =>', { results: results.length, start: results[0], end: results[results.length - 1] });

    // ---------------------------------------------------------------------------------------------------
    //  Public Data
    // ---------------------------------------------------------------------------------------------------

    // writeLog('instrument', await api.getInstruments());
    // console.log('getInstruments() =>', await api.getInstruments());
    // api.getInstruments().then( (res: any) => {
    //   console.log('getInstruments() =>');
    //   res.data.map( (r: any) => { console.log(r.instId, r.state ); });
    //   const result = res.data.find( (r: any) => r.instId === 'BTC-USD-SWAP');
    //   console.log(result);
    // });

    // console.log('getSymbolInformation() =>', await api.getSymbolInformation('BTC-USD-SWAP'));

    // console.log('getLimitPrice() =>', await api.getLimitPrice('BTC-USD-SWAP'));

    // console.log('getMarketPrice() =>', await api.getMarketPrice('BTC-USD-SWAP'));


    // ---------------------------------------------------------------------------------------------------
    //  Market Data
    // ---------------------------------------------------------------------------------------------------

    // console.log('getSymbolPriceTicker() =>', await api.getSymbolPriceTicker('BTC-USD-SWAP'));
    // console.log('getKChart() =>', await api.getKChart('BTC-USD-SWAP'));
    // console.log('getKChartHistory() =>', await api.getKChartHistory('BTC-USD-SWAP'));


    // ---------------------------------------------------------------------------------------------------
    //  Account 
    // ---------------------------------------------------------------------------------------------------

    // console.log('getAccountOverview() =>', await api.getAccountOverview());
    // api.getAccountOverview().then( (res: any) => {
    //   res.map( (r: any) => { console.log(r.details ); });
    // });

    //  console.log('getPositions() =>', await api.getPositions());
    // api.getPositions().then( (res: any) => {
    //   console.log(res);
    //   res.map( (r: any) => { console.log(r.details ); });
    // });

    // api.getPositionsHistory().then( (res: any) => {
    //   res.map( (r: any) => { console.log(r.details ); });
    // });

    // console.log('setPositionMode() =>', await api.setPositionMode('long_short_mode'));

    // console.log('getLeverage() =>', await api.getLeverage('BTC-USDT-SWAP', 'isolated'));

    // console.log('======================================================');

    // console.log('setLeverage() =>', await api.setLeverage('10', 'isolated', { instId: 'BTC-USDT-SWAP' }));

    // console.log('getFeeRates() =>', await api.getFeeRates('SWAP'));


    // ---------------------------------------------------------------------------------------------------
    //  Trade
    // ---------------------------------------------------------------------------------------------------


    // console.log('postOrder() =>', await api.postOrder('BTG-USDT-SWAP', 'cash', 'sell', 'market', 0.73167092, { clOrdId: '010779' }));
    // console.log('postOrder() =>', await api.postOrder('BTC-USDT-SWAP', 'isolated', 'buy', 'market', 1000, { clOrdId: '010779' }));
    // console.log('postOrder() =>', await api.postOrder('BTC-USDT-SWAP', 'isolated', 'buy', 'limit', 10, { clOrdId: '010779', px: '19000' }));
    // console.log('postOrder() =>', await api.postOrder('BTC-USDT-SWAP', 'isolated', 'sell', 'market', 200, { clOrdId: '010777' }));
    // console.log('cancelOrder() =>', await api.cancelOrder('BTC-USDT-SWAP', { ordId: '497214683267596288' }));
    // console.log('closePosition() =>', await api.closePosition('BTC-USDT-SWAP', 'isolated'));
    // console.log('getOrder() =>', await api.getOrder('BTC-USDT-SWAP', { clOrdId: '010777' }));
    // console.log('getOrders() =>', await api.getOrders());


    // ---------------------------------------------------------------------------------------------------
    //  Founding
    // ---------------------------------------------------------------------------------------------------

    // console.log('getAssetBalance() =>', await api.getAssetBalance());
    // writeLog('getAssetBalance', await api.getAssetBalance());
    // console.log('getCurrencies() =>', await api.getCurrencies());
    // console.log('fundsTransfer() =>', await api.fundsTransfer('BTG','0.73167092', '6', '18'));

    // api.getAssetBalance().then((resp: any[]) => {
    //   const found = resp.find( c => c.ccy === 'BTG');
    //   if (found) {
    //     api.fundsTransfer('BTG',found.availBal, '6', '18').then((resptransfer: any) => {
    //       api.postOrder('BTG-USDT', 'cash', 'sell', 'market', found.availBal, { clOrdId: '010779' }).then( respOrder => {
    //         console.log(respOrder);
    //       });
    //     });
    //   }
    // })


    // api.getAccountOverview().then((resp: any) => {
    //   const details = resp[0].details;
    //   const found = details.find((c: any) => c.ccy === 'USDT');
    //   if (found) {
    //     // console.log(found);
    //     api.fundsTransfer('USDT', found.cashBal, '18', '6').then((resptransfer: any) => {
    //       console.log(resptransfer);

    //     });
    //   }
    // })



    // Probat fins aqui.

    // ---------------------------------------------------------------------------------------------------
    //  Websocket (Spot)
    // ---------------------------------------------------------------------------------------------------

    // console.log('getWebsocketToken() =>', await api.getWebsocketToken('public'));
    // console.log('getWebsocketToken() =>', await api.getWebsocketToken('private'));


    // if (api instanceof OkxApiSpot) {

    // ---------------------------------------------------------------------------------------------------
    //  Market (Spot)
    // ---------------------------------------------------------------------------------------------------

    // console.log('getMarketsList() =>', await api.getMarketsList());

    // console.log('getSymbolsList() =>', await api.getSymbolsList());
    // console.log('getSymbolsList({ market }) =>', writeLog('getSymbolsList', await api.getSymbolsList({ market: 'USDS' })));

    // console.log('getSymbolKlines({ market }) =>', await api.getSymbolKlines({ symbol: 'BNB-USDT', type: '1hour' }));

    // console.log('getUserInfo() =>', await api.getUserInfo());

    // console.log('getAccountsList() =>', await api.getAccountsList());

    // console.log('getAccountInformation(accountId) =>', await api.getAccountInformation('62272237c6c8070001d9ec84'));

    // ---------------------------------------------------------------------------------------------------
    //  Orders (Spot)
    // ---------------------------------------------------------------------------------------------------

    // console.log('getOrders({ tradeType }) =>', await api.getOrders({ } as any));
    // console.log('getOrders({ tradeType }) =>', await api.getOrders({ tradeType: 'TRADE', startAt: 1648764000000, endAt: 1651269600000 }));

    // console.log('getRecentOrders() =>', await api.getRecentOrders());

    // console.log('getFills({ tradeType }) =>', await api.getFills({ tradeType: 'TRADE' } as any));
    // console.log('getFills({ tradeType }) =>', await api.getFills({ tradeType: 'TRADE', startAt: 1652800936000, endAt: 1652810510000 }));

    // console.log('getRecentFills() =>', await api.getRecentFills());

    // } else if (api instanceof OkxApiFutures) {

    // ---------------------------------------------------------------------------------------------------
    //  Market (Futures)
    // ---------------------------------------------------------------------------------------------------

    // console.log('getActiveSymbols() =>', await api.getActiveSymbols());

    // console.log('getSymbolInformation(symbol) =>', await api.getSymbolInformation('ENJUSDTM'));

    // console.log('getSymbolPriceTicker({ symbol }) =>', await api.getSymbolPriceTicker({ symbol: 'BNBUSDTM' }).catch(err => { throw err; }));

    // interval(1000).subscribe(async () => {
    //   const startTime = moment().subtract(2, 'minutes').unix() * 1000;
    //   const endTime = moment().unix() * 1000;
    //   console.log('getKChart() =>', await api.getKChart('XBTUSDM', startTime, endTime));
    // });


    // ---------------------------------------------------------------------------------------------------
    //  Account (Spot)
    // ---------------------------------------------------------------------------------------------------

    // console.log('getAccountOverview({ currency }) =>', await api.getAccountOverview({ currency: 'BTC' }));

    // console.log('getPositions() =>', await api.getPositions());
    // console.log('getPosition({ symbol }) =>', await api.getPosition({ symbol: 'ENJUSDTM' }));

    // console.log('getRiskLimitLevel({ symbol }) =>', await api.getRiskLimitLevel('ENJUSDTM'));

    // ---------------------------------------------------------------------------------------------------
    //  Orders (Futures)
    // ---------------------------------------------------------------------------------------------------

    // console.log('getFills() =>', await api.getFills());
    // console.log('getFills() =>', await api.getFills({ startAt: 1648764000, endAt: 1651269600 }));

    // console.log('getRecentFills() =>', await api.getRecentFills());

    // console.log('getOrders() =>', await api.getOrders());
    // }


  } catch (error) {
    console.error('API ERROR', error);
  }
};

testApi();
