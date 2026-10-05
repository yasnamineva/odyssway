"use client";

import { useEffect } from "react";

/** Tells the host page our height, so the /widget snippet can size its iframe to fit. */
export default function EmbedResizer() {
  useEffect(() => {
    if (window.parent === window) return;
    const post = () =>
      window.parent.postMessage(
        { type: "odyssway:height", height: document.documentElement.scrollHeight },
        "*",
      );
    const observer = new ResizeObserver(post);
    observer.observe(document.body);
    post();
    return () => observer.disconnect();
  }, []);
  return null;
}
