import {decShift} from "./big";

type RequestModule = (options: RequestOptions, callback: (err: any, res: any) => void) => void;

interface BlockchainClientOptions {
  inBrowser: boolean;
  chain: string;
  key: string;
  BlockCypherKey?: string;
  network: string;
}

interface RequestOptions {
  method: string;
  uri: string;
  headers: Record<string, string>;
  body?: string;
}

class BlockchainClient {
  private request: RequestModule;
  private opts: BlockchainClientOptions;
  private cacheBlock: Record<string | number, any> = {};
  private cacheTx: Record<string, any> = {};
  private bc: any;

  constructor(opts: BlockchainClientOptions) {
    if (!opts.chain) throw new Error('Missing chain parameter');
    if (!opts.key) throw new Error('Missing API key');

    this.opts = opts;

    if (opts.inBrowser) {
      this.request = require('browser-request');
    } else {
      this.request = require('request');
    }

    if (opts.BlockCypherKey) {
      const blockcypher = require('./blockcypher');
      this.bc = blockcypher({
        inBrowser: opts.inBrowser,
        key: opts.BlockCypherKey,
        network: opts.network,
      });
    }
  }

  private getBaseUrl(): string {
    return `https://api.tatum.io/v3/${this.opts.chain}`;
  }

  private constructUrl(path: string): string {
    return `${this.getBaseUrl()}${path}`;
  }

  get(path: string, callback: (err: any, res: any) => void): void {
    const options: RequestOptions = {
      method: 'GET',
      uri: this.constructUrl(path),
      headers: { 'x-api-key': this.opts.key },
    };

    this.request(options, (err, res) => {
      if (err) {
        return callback(err, res);
      }
      let body = res.body;
      try {
        body = JSON.parse(body);
      } catch (e) {
        console.error('Error parsing data:', e, body);
      }
      callback(err, body);
    });
  }

  post(path: string, body: Record<string, any>, callback: (err: any, res: any) => void): void {
    const options: RequestOptions = {
      method: 'POST',
      uri: this.constructUrl(path),
      body: JSON.stringify(body),
      headers: {
        'x-api-key': this.opts.key,
        'content-type': 'application/json',
      },
    };

    this.request(options, (err, res) => {
      if (err) {
        return callback(err, res);
      }
      let parsedBody = res.body;
      try {
        parsedBody = JSON.parse(parsedBody);
      } catch (e) {
        console.error('Error parsing data:', e, parsedBody);
      }
      callback(err, parsedBody);
    });
  }

  getInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.get('/info', (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  getBlock(numberOrHash: string | number): Promise<any> {
    if (this.cacheBlock[numberOrHash]) {
      return Promise.resolve(this.cacheBlock[numberOrHash]);
    }

    return new Promise((resolve, reject) => {
      this.get(`/block/${numberOrHash}`, (err, block) => {
        if (err) return reject(err);
        if (block.errorCode) return reject({ ...block, block: numberOrHash });
        this.cacheBlock[block.hash] = this.cacheBlock[block.height] = this.cacheBlock[numberOrHash] = block;
        resolve(block);
      });
    });
  }

  getTx(hash: string): Promise<any> {
    if (this.cacheTx[hash]) {
      return Promise.resolve(this.cacheTx[hash]);
    }

    return new Promise((resolve, reject) => {
      this.get(`/transaction/${hash}`, (err, tx) => {
        if (err) return reject(err);
        this.cacheTx[tx.hash] = tx;
        resolve(tx);
      });
    });
  }

  getBalance(address: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.get(`/address/balance/${address}`, (err, data) => {
        if (err) return reject(err);
        const balance = Number(decShift(data.incoming, 8)) - Number(decShift(data.outgoing, 8));
        resolve(decShift(balance, -8));
      });
    });
  }

  getUnspents(address: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (this.bc) {
        this.bc.get(`/addrs/${address}?unspentOnly=true`, (err: any, data: any) => {
          if (err) return reject(err);
          const unspents = data.txrefs || [];
          unspents.balance = data.final_balance;
          resolve(unspents);
        });
      } else {
        this.get(`/transaction/address/${address}?pageSize=50`, (err, txs) => {
          if (err) return reject(err);
          const unspents = BlockchainClient.extractUnspents(txs, address);
          resolve(unspents);
        });
      }
    });
  }

  private static extractUnspents(txs: any[], address: string): any[] {
    const unspents: any[] = [];
    for (const tx of txs) {
      const u = tx.outputs.reduce((acc: any[], output: any, index: number) => {
        if (output.address === address) {
          const spent = txs.some(t => t.inputs.some(({ prevout }: any) => prevout.hash === tx.hash && prevout.index === index));
          if (!spent) {
            acc.push({ ...output, tx_hash: tx.hash, index });
          }
        }
        return acc;
      }, []);
      unspents.push(...u);
    }
    return unspents;
  }

  getTxs(address: string, pageSize = 50, offset = 0): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.get(`/transaction/address/${address}?pageSize=${pageSize}&offset=${offset}`, (err, txs) => {
        if (err) reject(err);
        else resolve(txs);
      });
    });
  }

  sendTx(txHex: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.bc) {
        this.bc.post('/txs/push', { tx: txHex }, (unknown: any, { error, tx }: any) => {
          if (error) reject(error);
          else resolve(tx);
        });
      } else {
        this.post('/broadcast', { txData: txHex }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      }
    });
  }
}

export default BlockchainClient;
