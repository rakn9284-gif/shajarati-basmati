"use client";

import { useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { qrCodeFromValue } from "@/lib/qr";

/**
 * Public scanner entry point. A QR deep link (?code=/?id=/?campaign=) is
 * handled by the store's detail modal; a plain /scan visit opens the camera.
 * No authentication is required for either path.
 */
export default function ScanLauncher() {
  const { hydrated, openModal } = useApp();
  const launched = useRef(false);

  useEffect(() => {
    if (!hydrated || launched.current || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("code") ?? params.get("id") ?? params.get("campaign");
    if (qrCodeFromValue(raw ?? "")) return;

    launched.current = true;
    openModal({ type: "scanner" });
  }, [hydrated, openModal]);

  return null;
}
