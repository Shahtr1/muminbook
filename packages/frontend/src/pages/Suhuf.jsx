import { useParams } from 'react-router-dom';

import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';

import { useSuhuf } from '@/hooks/suhuf/useSuhuf.js';
import { useReadings } from '@/hooks/reading/useReadings.js';
import { SuhufProvider } from '@/context/SuhufWorkspaceContext.jsx';
import { SuhufContent } from '@/components/suhuf/SuhufContent.jsx';

export const Suhuf = () => {
  const { id: suhufId } = useParams();

  const {
    data: suhuf,
    isPending: isSuhufLoading,
    isError: isSuhufError,
  } = useSuhuf(suhufId);

  const {
    readings,
    isPending: isReadingsLoading,
    isError: isReadingsError,
  } = useReadings();

  if (isSuhufLoading || isReadingsLoading) return <Loader height="100dvh" />;

  if (isSuhufError || isReadingsError)
    return <SomethingWentWrong height="100dvh" />;

  return (
    <SuhufProvider suhuf={suhuf}>
      <SuhufContent readings={readings} />
    </SuhufProvider>
  );
};
