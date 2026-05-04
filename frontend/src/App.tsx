import { useFreighter } from "./hooks/useFreighter";
import { ConnectButton } from "./components/ConnectButton";
import { WalletInfo } from "./components/WalletInfo";
import { CounterContract } from "./components/CounterContract";
import styles from "./App.module.css";

export default function App() {
  const { error } = useFreighter();

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <StellarLogo />
          <span>Stellar Wallet</span>
        </div>
        <ConnectButton />
      </header>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Stellar ağına<br />
            <span className={styles.accent}>bağlanın</span>
          </h1>
          <p className={styles.subtitle}>
            Freighter cüzdanınızı bağlayarak XLM bakiyenizi ve hesap
            bilgilerinizi görüntüleyin.
          </p>

          {error && (
            <div className={styles.errorBanner}>
              <span>⚠</span> {error}
            </div>
          )}
        </div>

        <WalletInfo />
        <CounterContract />
      </main>

      <footer className={styles.footer}>
        <span>Testnet üzerinde çalışıyor</span>
        <span className={styles.dot}>·</span>
        <span>Powered by Stellar SDK</span>
      </footer>
    </div>
  );
}

function StellarLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="14" fill="#6C63FF" />
      <path
        d="M7 14l7-7 7 7-7 7-7-7z"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
