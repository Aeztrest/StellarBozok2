import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  rpc as StellarRpc,
  scValToNative,
  Transaction,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { config, rpc } from "./stellar";

export const COUNTER_CONTRACT_ID =
  import.meta.env.VITE_COUNTER_CONTRACT_ID ?? "";

async function buildTx(userAddress: string, method: string) {
  const account = await rpc.getAccount(userAddress);
  const contract = new Contract(COUNTER_CONTRACT_ID);

  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method))
    .setTimeout(180)
    .build();
}

/** Mevcut sayaç değerini simülasyon ile okur (imza gerekmez). */
export async function getCount(userAddress: string): Promise<number> {
  const tx = await buildTx(userAddress, "get_count");
  const sim = await rpc.simulateTransaction(tx);
  if (StellarRpc.Api.isSimulationError(sim)) throw new Error(sim.error);
  if (!sim.result) return 0;
  return scValToNative(sim.result.retval) as number;
}

/** İmzalı işlem gönderir ve yeni değeri döner. */
async function invokeAndWait(
  userAddress: string,
  method: string
): Promise<number> {
  const tx = await buildTx(userAddress, method);
  const sim = await rpc.simulateTransaction(tx);
  if (StellarRpc.Api.isSimulationError(sim)) throw new Error(sim.error);

  const assembled = StellarRpc.assembleTransaction(tx, sim).build();

  const { signedTxXdr, error } = await signTransaction(assembled.toXDR(), {
    networkPassphrase: config.networkPassphrase,
  });
  if (error) throw new Error(error);

  const signed = TransactionBuilder.fromXDR(
    signedTxXdr,
    config.networkPassphrase
  ) as Transaction;

  const response = await rpc.sendTransaction(signed);
  if (response.status === "ERROR") {
    throw new Error("İşlem ağ tarafından reddedildi");
  }

  let result = await rpc.getTransaction(response.hash);
  while (result.status === "NOT_FOUND") {
    await new Promise((r) => setTimeout(r, 1000));
    result = await rpc.getTransaction(response.hash);
  }

  if (result.status !== "SUCCESS") throw new Error("İşlem başarısız oldu");

  return scValToNative(result.returnValue!) as number;
}

export const increment = (addr: string) => invokeAndWait(addr, "increment");
export const decrement = (addr: string) => invokeAndWait(addr, "decrement");
