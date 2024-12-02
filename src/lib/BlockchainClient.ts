import axios, { AxiosRequestConfig } from 'axios';
import { decShift } from './big';
import blockcypher from './blockcypher';

interface BlockchainClientOptions {
  inBrowser: boolean;
  chain: string;
  key: string;
  BlockCypherKey?: string;
  network: string;
}

class BlockchainClient {
  private opts: BlockchainClientOptions;
  private cacheBlock: Record<string | number, any> = {};
  private cacheTx: Record<string, any> = {};
  private bc: any;

  constructor(opts: BlockchainClientOptions) {
    if (!opts.chain) throw new Error('Missing chain parameter');
    if (!opts.key) throw new Error('Missing API key');

    this.opts = opts;

    if (opts.BlockCypherKey) {
      this.bc = new blockcypher({
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

  private async request(config: AxiosRequestConfig): Promise<any> {
    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw error.response.data;
      } else {
        throw error.message;
      }
    }
  }

  async get(path: string): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: this.constructUrl(path),
      headers: { 'x-api-key': this.opts.key },
    };
    return this.request(config);
  }

  async post(path: string, body: Record<string, any>): Promise<any> {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: this.constructUrl(path),
      headers: {
        'x-api-key': this.opts.key,
        'Content-Type': 'application/json',
      },
      data: body,
    };
    return this.request(config);
  }

  async getInfo(): Promise<any> {
    return this.get('/info');
  }

  async getBlock(numberOrHash: string | number): Promise<any> {
    if (this.cacheBlock[numberOrHash]) {
      return this.cacheBlock[numberOrHash];
    }

    const block = await this.get(`/block/${numberOrHash}`);
    if (block.errorCode) {
      throw { ...block, block: numberOrHash };
    }
    this.cacheBlock[block.hash] = this.cacheBlock[block.height] = this.cacheBlock[numberOrHash] = block;
    return block;
  }

  async getTx(hash: string): Promise<any> {
    if (this.cacheTx[hash]) {
      return this.cacheTx[hash];
    }

    const tx = await this.get(`/transaction/${hash}`);
    this.cacheTx[tx.hash] = tx;
    return tx;
  }

  async getBalance(address: string): Promise<string> {
    const data = await this.get(`/address/balance/${address}`);
    const balance = Number(decShift(data.incoming, 8)) - Number(decShift(data.outgoing, 8));
    return decShift(balance, -8);
  }

  async getUnspents(address: string): Promise<any[]> {
    if (this.bc) {
      const data = await this.bc.get(`/addrs/${address}?unspentOnly=true`);
      const unspents = data.txrefs || [];
      unspents.balance = data.final_balance;
      return unspents;
    } else {
      const txs = await this.get(`/transaction/address/${address}?pageSize=50`);
      return BlockchainClient.extractUnspents(txs, address);
    }
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

  async getTxs(address: string, pageSize = 50, offset = 0): Promise<any[]> {
    return this.get(`/transaction/address/${address}?pageSize=${pageSize}&offset=${offset}`);
  }

  async sendTx(txHex: string): Promise<any> {
    if (this.bc) {
      const { error, tx } = await this.bc.post('/txs/push', { tx: txHex });
      if (error) throw error;
      return tx;
    } else {
      return this.post('/broadcast', { txData: txHex });
    }
  }
}

export default BlockchainClient;
