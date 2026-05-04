import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  getNetwork,
} from "@stellar/freighter-api";

export type WalletStatus = "idle" | "connecting" | "connected" | "error";

export interface FreighterState {
  status: WalletStatus;
  address: string | null;
  network: string | null;
  error: string | null;
  isInstalled: boolean;
}

export function useFreighter() {
  const [state, setState] = useState<FreighterState>({
    status: "idle",
    address: null,
    network: null,
    error: null,
    isInstalled: false,
  });

  useEffect(() => {
    checkInstalled();
  }, []);

  const checkInstalled = async () => {
    const connResult = await isConnected();
    if (!connResult.isConnected) {
      setState((s) => ({ ...s, isInstalled: false }));
      return;
    }

    setState((s) => ({ ...s, isInstalled: true }));

    const allowedResult = await isAllowed();
    if (allowedResult.isAllowed) {
      try {
        const addrResult = await getAddress();
        const netResult = await getNetwork();
        if (!addrResult.error && !netResult.error) {
          setState({
            status: "connected",
            address: addrResult.address,
            network: netResult.network,
            error: null,
            isInstalled: true,
          });
        }
      } catch {
        // Not connected yet
      }
    }
  };

  const connect = useCallback(async () => {
    setState((s) => ({ ...s, status: "connecting", error: null }));

    try {
      const connResult = await isConnected();
      if (!connResult.isConnected) {
        setState((s) => ({
          ...s,
          status: "error",
          error: "Freighter yüklü değil. Tarayıcı eklentisini kurun.",
          isInstalled: false,
        }));
        return;
      }

      await setAllowed();
      const addrResult = await getAddress();
      const netResult = await getNetwork();

      if (addrResult.error) {
        throw new Error("Adres alınamadı");
      }

      setState({
        status: "connected",
        address: addrResult.address,
        network: netResult.network,
        error: null,
        isInstalled: true,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bağlantı başarısız";
      setState((s) => ({ ...s, status: "error", error: message }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState((s) => ({
      ...s,
      status: "idle",
      address: null,
      network: null,
      error: null,
    }));
  }, []);

  return { ...state, connect, disconnect };
}
