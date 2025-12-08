import { useEffect, useState } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';

export function useSafeBreakpointValue(values) {
  const [mounted, setMounted] = useState(false);
  const value = useBreakpointValue(values);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? value : undefined;
}
