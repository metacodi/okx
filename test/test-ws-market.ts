import { MarketType, WebsocketOptions } from '@metacodi/abstract-exchange';
import * as fs from 'fs';

import { Resource } from '@metacodi/node-utils';

import { OkxWebsocket } from '../src/okx-websocket';


/**
 * ```bash
 * npx ts-node test/test-ws-market.ts
 * ```
 */


/** Archivo donde se escribirá la salida. */
const logFileName = 'results/klines-1m.json';

/** Escribe en el archivo `logFileName`. */
function writeLog(variable: string, data: any) {
  const url = Resource.normalize(`./test/${logFileName}`);
  const value = JSON.stringify(data, null, ' ');
  console.log(value);
  fs.appendFileSync(url, `const ${variable} = ${value};\n\n`);
}

const testMarketWs = async () => {
  try {

    console.log('---------------- Market WebSocket TEST ----------------------');

    const market: MarketType = 'futures';
    // const market: OkxMarketType = 'futures';

    const isTest = false;

    const options: WebsocketOptions = {
      streamType: 'market',
      market: market,
      isTest,
    };

    const ws = new OkxWebsocket(options);

    // ws.addListener('message', msg => console.log('message =>', msg));

    // ---------------------------------------------------------------------------------------------------
    //  PUBLIC
    // ---------------------------------------------------------------------------------------------------

    // const tickerBTCUSDTSWAP = ws.priceTicker('BTC_USDT').subscribe(data => console.log('priceTicker =>', data));
    const klines = ws.klineTicker('BTC_USDT', '1m').subscribe(data => console.log('klines =>', data));
    // const klines = ws.klineTicker('BTC-USDT-SWAP', 'candle1m').subscribe(data => console.log('klines =>', data));
    
    // setTimeout(() => { console.log('Test => Unsubscribe BTC-USDT-SWAP ticker'); tickerBTCUSDTSWAP.unsubscribe(); }, 5000);
    // setTimeout(() => { console.log('Test => Unsubscribe XBTUSDM tickerV2'); tickerV2XBTUSDM.unsubscribe(); }, 2500);
    setTimeout(() => { console.log('Test => Unsubscribe BTC-USDT-SWAP klines'); klines.unsubscribe(); }, 3000);
    
    // setTimeout(() => { console.log('Reconnecting...'); ws.reconnect(); }, 52000);
    
    // ---------------------------------------------------------------------------------------------------
    //  PRIVATE
    // ---------------------------------------------------------------------------------------------------
    
    
    // const account = ws.accountUpdate().subscribe(data => console.log('accountUpdate =>', data));
    // const account = ws.accountUpdate({ ccy: 'USDT'}).subscribe(data => console.log('accountUpdate =>', data));
    // const accountETH = ws.accountUpdate({ ccy: 'ETH'}).subscribe(data => console.log('accountUpdate ETH =>', data));
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
