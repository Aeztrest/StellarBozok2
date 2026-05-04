import { useEffect, useState } from "react";
import { useFreighter } from "../hooks/useFreighter";
import { getAccountInfo, explorerLink, shortAddress } from "../lib/stellar";
import styles from "./WalletInfo.module.css";

interface AccountInfo {
  balance: string;
  sequence: string;
  subentryCount: number;
}

export function WalletInfo() {
  const { status, address, network } = useFreighter();
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "connected" || !address) {
      setInfo(null);
      return;
    }

    setLoading(true);
    getAccountInfo(address)
      .then((data) => setInfo(data))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, [status, address]);

  if (status !== "connected" || !address) return null;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.label}>Cüzdan Bilgileri</span>
        <a
          href={explorerLink(address)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.explorerLink}
        >
          Explorer'da Gör ↗
        </a>
      </div>

      <div className={styles.addressRow}>
        <span className={styles.fieldLabel}>Adres</span>
        <span className={styles.address}>{shortAddress(address)}</span>
        <button
          className={styles.copyBtn}
          onClick={() => navigator.clipboard.writeText(address)}
          title="Kopyala"
        >
          ⧉
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.fieldLabel}>XLM Bakiye</span>
          {loading ? (
            <span className={styles.loading}>Yükleniyor...</span>
          ) : (
            <span className={styles.balance}>
              {info ? parseFloat(info.balance).toFixed(4) : "—"}
              <span className={styles.unit}>XLM</span>
            </span>
          )}
        </div>

        <div className={styles.stat}>
          <span className={styles.fieldLabel}>Ağ</span>
          <span className={styles.networkBadge}>{network ?? "—"}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.fieldLabel}>Alt Kayıtlar</span>
          <span className={styles.value}>{info?.subentryCount ?? "—"}</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.fieldLabel}>Sıra No</span>
          <span className={styles.value}>{info?.sequence ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}
