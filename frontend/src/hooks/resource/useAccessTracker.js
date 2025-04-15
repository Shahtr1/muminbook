import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateAccess } from "@/services/index.js";

const FIVE_MINUTES = 5 * 60 * 1000;

export const useAccessTracker = () => {
  const queryClient = useQueryClient();
  const timeoutRef = useRef(null);
  const lastUpdatedRef = useRef(new Map());

  const triggerUpdate = (resourceId) => {
    const now = Date.now();
    const lastAccessed = lastUpdatedRef.current.get(resourceId) || 0;

    if (now - lastAccessed < FIVE_MINUTES) {
      return;
    }

    // Debounce logic
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await updateAccess(resourceId);
        lastUpdatedRef.current.set(resourceId, Date.now());
        queryClient.invalidateQueries({ queryKey: ["overview"] });
      } catch (err) {
        console.error("Access update failed", err);
      }
    }, 300); // Debounce delay
  };

  return { updateAccessedAt: triggerUpdate };
};
