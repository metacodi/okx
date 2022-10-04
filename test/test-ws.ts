import * as fs from 'fs';

import { OkxMarketType } from '../src/types/okx.types';
import { OkxWebsocketOptions } from '../src/types/okx.types';
import { OkxWebsocket } from '../src/okx-ws';



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

    const options: OkxWebsocketOptions = {
      streamType: 'market',
      market: market,
      isTest: false,
    };
    
    const ws = new OkxWebsocket(options);

    // ws.addListener('message', msg => console.log('message =>', msg));

    const tickerBTCUSDTSWAP = ws.symbolTicker('BTC-USDT-SWAP').subscribe(data => console.log('symbolTicker =>', data));
    // const tickerV2XBTUSDM = ws.symbolTickerV2('XBTUSDM').subscribe(data => console.log('symbolTickerV2 =>', data));
    // const klines = ws.klines('XBTUSDM', '1min').subscribe(data => console.log('klines =>', data));
    // const klines = ws.klines('BTC-USDT-SWAP', 'candle1m').subscribe(data => console.log('klines =>', data));
    
    setTimeout(() => { console.log('Test => Unsubscribe BTC-USDT-SWAP ticker'); tickerBTCUSDTSWAP.unsubscribe(); }, 5000);
    // setTimeout(() => { console.log('Test => Unsubscribe XBTUSDM tickerV2'); tickerV2XBTUSDM.unsubscribe(); }, 2500);
    // setTimeout(() => { console.log('Test => Unsubscribe XBTUSDM klines'); klines.unsubscribe(); }, 10000);

    // setTimeout(() => { console.log('Reconnecting...'); ws.reconnect(); }, 52000);
    setTimeout(() => { console.log('Close...'); ws.close(); }, 6000);

  } catch (error) {
    console.error('Websocket ERROR', error);
  }
};

testMarketWs();
