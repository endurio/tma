// Config variables for the module (only network for now)
// "testnet" for testnet and anything else for mainnet

import {IncomingMessage} from 'http';

// Define interfaces for options and request callbacks
interface BlockCypherOptions {
  inBrowser?: boolean;
  network?: string;
  key?: string;
}

type Callback<T = any> = (error: Error | null, response: T | null) => void;

// BlockCypher class definition
class BlockCypher {
  private network: string | undefined;
  private key: string | undefined;
  private request: any;

  constructor(opts: BlockCypherOptions) {
    if (!opts.network) {
      console.warn("Please specify a blockchain. (defaults to mainnet)");
    }

    if (!opts.key) {
      console.warn("No key specified, your requests will be limited by BlockCypher.");
    }

    this.network = opts.network;
    this.key = opts.key;
    this.request = opts.inBrowser ? require('browser-request') : require('request');
  }

  // Returns the correct URL endpoint based on the network being used
  private getBaseURL(network: string): string {
    switch (network) {
      case "testnet":
        return "https://api.blockcypher.com/v1/btc/test3";
      case "blockcypher-testnet":
        return "https://api.blockcypher.com/v1/bcy/test";
      default:
        return "https://api.blockcypher.com/v1/btc/main";
    }
  }

  // Constructs the full URL for the API call
  private constructUrl(path: string): string {
    let url = this.getBaseURL(this.network || "");
    if (this.key) {
      url += path.includes('?') ? `${path}&token=${this.key}` : `${path}?token=${this.key}`;
    } else {
      url += path;
    }
    return url;
  }

  // Abstracted JSON GET request method
  private getFromURL<T>(url: string, callback: Callback<T>): void {
    this.request.get(url, (err: Error, response: IncomingMessage, body: string) => {
      if (err) {
        console.error("Error getting data:", err);
        return callback(err, null);
      }
      try {
        const parsedBody = JSON.parse(body);
        callback(null, parsedBody);
      } catch (e:any) {
        console.error("Error parsing response body:", e, body);
        callback(e, null);
      }
    });
  }

  // Abstracted JSON POST request method
  private postToURL<T>(url: string, body: object, callback: Callback<T>): void {
    this.request(
      {
        url,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      (err: Error, response: IncomingMessage, body: string) => {
        if (err) {
          console.error("Error getting response data:", err);
          return callback(err, null);
        }
        try {
          const parsedBody = JSON.parse(body);
          callback(null, parsedBody);
        } catch (e:any) {
          console.error("Error parsing response body:", e, body);
          callback(e, null);
        }
      }
    );
  }

  // Public GET method
  get<T>(path: string, callback: Callback<T>): void {
    const url = this.constructUrl(path);
    this.getFromURL<T>(url, callback);
  }

  // Public POST method
  post<T>(path: string, body: object, callback: Callback<T>): void {
    const url = this.constructUrl(path);
    this.postToURL<T>(url, body, callback);
  }
}

export default BlockCypher;
