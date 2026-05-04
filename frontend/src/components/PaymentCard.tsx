import { useEffect, useState } from "react";
import { signTransaction } from "@stellar/freighter-api";
import {
  Asset,
  BASE_FEE,
  Memo,
  Operation,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { useFreighter } from "../hooks/useFreighter";
import { config, horizon, shortAddress } from "../lib/stellar";
import styles from "./PaymentCard.module.css";

const ADDRESS_RE = /^G[A-Z2-7]{55}$/;

export function PaymentCard() {
  const { status, address } = useFreighter();
  const connected = status === "connected" && !!address;

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("1");
  const [memo, setMemo] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!address || !connected) {
      setBalance(null);
      return;
    }

    horizon
      .loadAccount(address)
      .then((acc) => {
        const xlm = acc.balances.find((b) => b.asset_type === "native");
        setBalance(xlm?.balance ?? "0");
      })
      .catch(() => setBalance(null));
  }, [address, connected]);

  if (!connected || !address) return null;

  const sendPayment = async () => {
    setMessage(null);
    setTxHash(null);
    setIsError(false);

    if (!ADDRESS_RE.test(destination)) {
      setIsError(true);
      setMessage("Destination address is invalid.");
      return;
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setIsError(true);
      setMessage("Amount must be a positive number.");
      return;
    }

    try {
      setSending(true);

      const source = await horizon.loadAccount(address);

      let txBuilder = new TransactionBuilder(source, {
        fee: BASE_FEE,
        networkPassphrase: config.networkPassphrase,
      }).addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: amountNum.toFixed(7),
        })
      );

      if (memo.trim()) {
        txBuilder = txBuilder.addMemo(Memo.text(memo.trim().slice(0, 28)));
      }

      const tx = txBuilder.setTimeout(180).build();

      const { signedTxXdr, error } = await signTransaction(tx.toXDR(), {
        networkPassphrase: config.networkPassphrase,
      });

      if (error) throw new Error(error);

      const signedTx = TransactionBuilder.fromXDR(
        signedTxXdr,
        config.networkPassphrase
      ) as Transaction;

      const submitted = await horizon.submitTransaction(signedTx);

      setTxHash(submitted.hash);
      setMessage("Transaction submitted successfully.");

      const refreshed = await horizon.loadAccount(address);
      const xlm = refreshed.balances.find((b) => b.asset_type === "native");
      setBalance(xlm?.balance ?? "0");
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Send XLM Transaction</span>
        <span className={styles.balance}>Balance: {balance ?? "—"} XLM</span>
      </div>

      <p className={styles.helper}>
        Quick test: you can paste your own address ({shortAddress(address)}) as
        destination.
      </p>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Destination Address</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value.trim())}
            placeholder="G..."
          />
        </label>

        <label className={styles.field}>
          <span>Amount (XLM)</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
          />
        </label>

        <label className={styles.field}>
          <span>Memo (optional)</span>
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="demo payment"
          />
        </label>
      </div>

      <button className={styles.sendBtn} onClick={sendPayment} disabled={sending}>
        {sending ? "Waiting for signature..." : "Sign & Send"}
      </button>

      {message && (
        <div className={`${styles.message} ${isError ? styles.error : styles.ok}`}>
          {message}
        </div>
      )}

      {txHash && (
        <a
          className={styles.hashLink}
          href={`${config.explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View transaction: {txHash.slice(0, 10)}...{txHash.slice(-10)}
        </a>
      )}
    </div>
  );
}
