"use client";

import { useEffect, useRef } from "react";
import { withAccessTokenQuery, hasTabSession } from "@/lib/tab-session";

export function useTicketStream(onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!hasTabSession()) return;

    const eventSource = new EventSource(
      withAccessTokenQuery("/api/tickets/stream")
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ticket_update") {
          onUpdateRef.current();
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => eventSource.close();
  }, []);
}
