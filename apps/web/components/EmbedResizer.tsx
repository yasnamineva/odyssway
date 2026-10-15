"use client";

import { useEffect } from "react";

/** Tells the host page our height, so the /widget snippet can size its iframe to fit. */
export default function EmbedResizer({ widget = "calculator" }: { widget?: string }) {
  useEffect(() => {
    if (window.parent === window) return;
    const post = () =>
      window.parent.postMessage(
        { type: "odyssway:height", widget, height: document.documentElement.scrollHeight },
        "*",
      );
    const observer = new ResizeObserver(post);
    observer.observe(document.body);
    post();
    return () => observer.disconnect();
  }, [widget]);
  return null;
}
