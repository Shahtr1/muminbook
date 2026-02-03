import { useEffect, useState } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';

/**
 * A safe wrapper around Chakra UI's useBreakpointValue.
 *
 * Prevents hydration mismatch issues by returning `undefined`
 * during the initial render (before the component mounts).
 *
 * This is useful in SSR environments where breakpoints cannot
 * be reliably determined on the server.
 */
export function useSafeBreakpointValue(values) {
  // Track whether the component has mounted on the client
  const [mounted, setMounted] = useState(false);

  // Get the responsive value from Chakra
  // (depends on window size)
  const value = useBreakpointValue(values);

  // Mark as mounted after first client render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return the breakpoint value only after mount
  // Prevents SSR/client mismatch
  return mounted ? value : undefined;
}
