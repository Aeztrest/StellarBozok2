import express from "express";
import cors from "cors";
import { Horizon, Networks } from "@stellar/stellar-sdk";

const app = express();
const PORT = 4000;

const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, network: "testnet", timestamp: new Date().toISOString() });
});

app.get("/api/account/:address", async (req, res) => {
  const { address } = req.params;

  if (!/^G[A-Z2-7]{55}$/.test(address)) {
    return res.status(400).json({ error: "Geçersiz Stellar adresi" });
  }

  try {
    const account = await horizon.loadAccount(address);
    const xlm = account.balances.find((b) => b.asset_type === "native");
    const tokens = account.balances.filter((b) => b.asset_type !== "native");

    return res.json({
      address,
      xlmBalance: xlm?.balance ?? "0",
      sequence: account.sequence,
      subentryCount: account.subentry_count,
      tokens: tokens.map((t) => ({
        asset: `${t.asset_code}:${t.asset_issuer}`,
        balance: t.balance,
      })),
      networkPassphrase: Networks.TESTNET,
    });
  } catch (err) {
    if (err?.response?.status === 404) {
      return res.status(404).json({ error: "Hesap bulunamadı (fonlanmamış)" });
    }
    console.error(err);
    return res.status(500).json({ error: "Horizon bağlantı hatası" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend: http://localhost:${PORT}`);
  console.log(`Health:  http://localhost:${PORT}/api/health`);
});
