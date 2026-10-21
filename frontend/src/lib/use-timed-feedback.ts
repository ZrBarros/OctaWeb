"use client";

import { useEffect, useRef, useState } from "react";

export function useTimedFeedback(durationMs = 3500) {
  const [message, setMessage] = useState("");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  function clearFeedback() {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    setMessage("");
  }

  function showFeedback(text: string) {
    if (timeout.current) clearTimeout(timeout.current);
    setMessage(text);
    timeout.current = setTimeout(() => {
      setMessage("");
      timeout.current = null;
    }, durationMs);
  }

  return { message, showFeedback, clearFeedback };
}
