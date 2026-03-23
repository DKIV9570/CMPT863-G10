import { useEffect, useState } from "react";
import type { ActionFeedback } from "../types/feedback";

export function useTransientFeedback(feedback?: ActionFeedback) {
  const [activeFeedback, setActiveFeedback] = useState<ActionFeedback | null>(
    feedback ?? null
  );

  useEffect(() => {
    if (feedback) {
      setActiveFeedback(feedback);
    }
  }, [feedback?.title, feedback?.message, feedback?.tone]);

  useEffect(() => {
    if (!activeFeedback) return;

    const timeoutId = window.setTimeout(() => {
      setActiveFeedback(null);
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [activeFeedback]);

  return {
    activeFeedback,
    dismissFeedback: () => setActiveFeedback(null),
  };
}
