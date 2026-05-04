import { useState, useEffect, useCallback } from "react";
import { useFreighter } from "../hooks/useFreighter";
import {
  COUNTER_CONTRACT_ID,
  getCount,
  increment,
  decrement,
} from "../lib/contract";
import styles from "./CounterContract.module.css";

type TxState = "idle" | "signing" | "success" | "error";

export function CounterContract() {
  const { status, address } = useFreighter();
  const connected = status === "connected" && !!address;

  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [txState, setTxState] = useState<TxState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    if (!connected || !address || !COUNTER_CONTRACT_ID) return;
    setLoading(true);
    try {
      setCount(await getCount(address));
    } catch {
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, [connected, address]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const handleAction = async (action: (addr: string) => Promise<number>) => {
    if (!address) return;
    setTxState("signing");
    setErrorMsg(null);
    try {
      const newCount = await action(address);
      setCount(newCount);
      setTxState("success");
      setTimeout(() => setTxState("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Bilinmeyen hata");
      setTxState("error");
      setTimeout(() => setTxState("idle"), 4000);
    }
  };

  const busy = txState === "signing";

  // Sözleşme ID'si yoksa kurulum rehberini göster
  if (!COUNTER_CONTRACT_ID) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Akıllı Sözleşme Demo</span>
          <span className={styles.badge}>Kurulum gerekli</span>
        </div>
        <p className={styles.desc}>
          Testnet'e bir Soroban sayaç sözleşmesi deploy etmek için aşağıdaki
          adımları izleyin.
        </p>
        <ol className={styles.steps}>
          <li>
            <strong>Rust + Stellar CLI'yi kurun</strong>
            <code>cargo install --locked stellar-cli</code>
          </li>
          <li>
            <strong>Kimlik oluşturun ve fonlayın</strong>
            <code>stellar keys generate --global alice --network testnet --fund</code>
          </li>
          <li>
            <strong>Sözleşmeyi derleyin</strong>
            <code>cd contracts/counter && stellar contract build</code>
          </li>
          <li>
            <strong>Deploy edin</strong>
            <code>{"stellar contract deploy \\\n  --wasm target/wasm32-unknown-unknown/release/counter.wasm \\\n  --source alice --network testnet \\\n  -- --admin alice"}</code>
          </li>
          <li>
            <strong>Contract ID'yi kaydedin</strong>
            <code>VITE_COUNTER_CONTRACT_ID=C… &gt; frontend/.env</code>
          </li>
        </ol>
      </div>
    );
  }

  if (!connected) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.label}>Sayaç Sözleşmesi</span>
        <span
          className={styles.contractId}
          title={COUNTER_CONTRACT_ID}
        >
          {COUNTER_CONTRACT_ID.slice(0, 6)}…{COUNTER_CONTRACT_ID.slice(-6)}
        </span>
      </div>

      <div className={styles.counter}>
        {loading ? (
          <span className={styles.loading}>Yükleniyor…</span>
        ) : (
          <span className={styles.countValue}>{count ?? "—"}</span>
        )}
        <span className={styles.countLabel}>sayaç değeri</span>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnMuted}`}
          onClick={() => handleAction(decrement)}
          disabled={busy}
        >
          − Azalt
        </button>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => handleAction(increment)}
          disabled={busy}
        >
          + Artır
        </button>
      </div>

      {txState !== "idle" && (
        <div
          className={`${styles.statusBar} ${
            txState === "success"
              ? styles.statusSuccess
              : txState === "error"
              ? styles.statusError
              : styles.statusPending
          }`}
        >
          {txState === "signing" && "Freighter'da imzalayın, işlem bekleniyor…"}
          {txState === "success" && "İşlem onaylandı!"}
          {txState === "error" && `Hata: ${errorMsg}`}
        </div>
      )}
    </div>
  );
}
