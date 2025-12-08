import { useQuery } from '@tanstack/react-query';
import { getSessions } from '@/services/index.js';

export const SESSIONS = 'sessions';

const useSessions = (opts = {}) => {
  const { data: sessions = [], ...rest } = useQuery({
    queryKey: [SESSIONS],
    queryFn: getSessions,
    ...opts,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return { sessions, ...rest };
};

export default useSessions;
