import { useParams } from 'react-router-dom';

import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';

import { useSuhuf } from '@/hooks/suhuf/useSuhuf.js';
import { useReadings } from '@/hooks/reading/useReadings.js';
import { SuhufProvider } from '@/context/SuhufWorkspaceContext.jsx';
import { SuhufContent } from '@/components/suhuf/SuhufContent.jsx';
import { useSurahs } from '@/hooks/quran/useSurahs.js';
import { useJuz } from '@/hooks/quran/useJuz.js';
import { useHizb, useManzil, useRuku } from '@/hooks/quran/useOtherDivision.js';

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

  const {
    surahs,
    isPending: isSurahsLoading,
    isError: isSurahsError,
  } = useSurahs();

  const { juzList, isPending: isJuzLoading, isError: isJuzError } = useJuz();

  const { manzils } = useManzil();
  const { hizbs } = useHizb();
  const { rukus } = useRuku();

  if (isSuhufLoading || isReadingsLoading || isSurahsLoading || isJuzLoading)
    return <Loader height="100dvh" />;

  if (isSuhufError || isReadingsError || isSurahsError || isJuzError)
    return <SomethingWentWrong height="100dvh" />;

  return (
    <SuhufProvider
      suhuf={suhuf}
      surahs={surahs}
      juzList={juzList}
      manzils={manzils}
      hizbs={hizbs}
      rukus={rukus}
    >
      <SuhufContent readings={readings} />
    </SuhufProvider>
  );
};
