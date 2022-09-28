import moment from 'moment';
import { interval } from 'rxjs';
import * as fs from 'fs';

import { OkxApiFunctions } from '../src/okx-api-function';
import { OkxApiOptions, OkxMarketType } from '../src/types/okx.types';

import { getApiKeys } from './api-keys';
import { writeLog } from './log/write-log';

/**
 * ```bash
 * npx ts-node test/test-api.ts
 * ```
 */

const testApi = async () => {
  try {
    
    console.log('---------------- API TEST ----------------------');
 
    const options: OkxApiOptions = {
      ...getApiKeys(),
      // isTest: true,
    } as any;

    // if (options.isTest) { setTestKeys(options, market); }

    const api = new OkxApiFunctions(options);

    api.market = 'SWAP';
    
    // ---------------------------------------------------------------------------------------------------
    //  Public Data
    // ---------------------------------------------------------------------------------------------------

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
    
    console.log('getSymbolPriceTicker() =>', await api.getSymbolPriceTicker('BTC-USD-SWAP'));
    
    


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

      // ---------------------------------------------------------------------------------------------------
      //  Account (Spot)
      // ---------------------------------------------------------------------------------------------------
      
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
      
      // console.log('getAccountOverview() =>', await api.getAccountOverview());
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
