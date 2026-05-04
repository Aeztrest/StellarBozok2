import { Horizon, Networks, rpc as StellarRpc } from "@stellar/stellar-sdk";

export const NETWORK = "testnet";

export const config = {
  horizonUrl: "https://horizon-testnet.stellar.org",
  rpcUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: Networks.TESTNET,
  explorerUrl: "https://stellar.expert/explorer/testnet",
};

export const horizon = new Horizon.Server(config.horizonUrl);
export const rpc = new StellarRpc.Server(config.rpcUrl);

export async function getAccountInfo(address: string) {
  try {
    const account = await horizon.loadAccount(address);
    const xlmBalance = account.balances.find((b) => b.asset_type === "native");
    return {
      address,
      balance: xlmBalance?.balance ?? "0",
      sequence: account.sequence,
      subentryCount: account.subentry_count,
    };
  } catch (err: unknown) {
    const e = err as { response?: { status: number } };
    if (e?.response?.status === 404) {
      return { address, balance: "0", sequence: "0", subentryCount: 0 };
    }
    throw err;
  }
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export function explorerLink(address: string): string {
  return `${config.explorerUrl}/account/${address}`;
}
