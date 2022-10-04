import * as fs from 'fs';

import { OkxMarketType } from '../src/types/okx.types';
import { OkxWebsocketOptions } from '../src/types/okx.types';
import { OkxWebsocket } from '../src/okx-ws';

import { getApiKeys } from './api-keys';

/**
 * ```bash
 * npx ts-node test/test-ws.ts
 * ```
 */
const testMarketWs = async () => {
  try {

    console.log('---------------- Market WebSocket TEST ----------------------');

    const market: OkxMarketType = 'FUTURES';
    // const market: OkxMarketType = 'futures';

    const isTest = true;

    const options: OkxWebsocketOptions = {
      streamType: 'user',
      market: market,
      isTest,
      ...getApiKeys({ isTest}), // Activar per privades
    };

    const ws = new OkxWebsocket(options);

    // ws.addListener('message', msg => console.log('message =>', msg));

    // ---------------------------------------------------------------------------------------------------
    //  PUBLIC
    // ---------------------------------------------------------------------------------------------------

    // const tickerBTCUSDTSWAP = ws.symbolTicker('BTC-USDT-SWAP').subscribe(data => console.log('symbolTicker =>', data));
    // const klines = ws.klines('BTC-USDT-SWAP', 'candle1m').subscribe(data => console.log('klines =>', data));
    // const klines = ws.klines('BTC-USDT-SWAP', 'candle1m').subscribe(data => console.log('klines =>', data));
    
    // setTimeout(() => { console.log('Test => Unsubscribe BTC-USDT-SWAP ticker'); tickerBTCUSDTSWAP.unsubscribe(); }, 5000);
    // setTimeout(() => { console.log('Test => Unsubscribe XBTUSDM tickerV2'); tickerV2XBTUSDM.unsubscribe(); }, 2500);
    // setTimeout(() => { console.log('Test => Unsubscribe BTC-USDT-SWAP klines'); klines.unsubscribe(); }, 5000);
    
    // setTimeout(() => { console.log('Reconnecting...'); ws.reconnect(); }, 52000);
    
    // ---------------------------------------------------------------------------------------------------
    //  PRIVATE
    // ---------------------------------------------------------------------------------------------------
    
    
    // const account = ws.accountUpdate({ ccy: 'USDT'}).subscribe(data => console.log('accountUpdate =>', data));
    // const positionsUpdate = ws.positionsUpdate({ instType: 'SWAP'}).subscribe(data => console.log('positionsUpdate =>', data));
    // const balancePositioUpdate = ws.balancePositioUpdate().subscribe(data => console.log('balancePositioUpdate =>', data));
    // const orderUpdate = ws.orderUpdate({ instType: 'SWAP'}).subscribe(data => console.log('orderUpdate =>', data));
    // const orderUpdateSPOT = ws.orderUpdate({ instType: 'SPOT'}).subscribe(data => console.log('orderUpdate =>', data));
    // setTimeout(() => { console.log('Close...'); ws.close(); }, 120000);

  } catch (error) {
    console.error('Websocket ERROR', error);
  }
};

testMarketWs();
