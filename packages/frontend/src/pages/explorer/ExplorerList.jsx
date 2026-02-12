import { Flex } from '@chakra-ui/react';
import { ExplorerCard } from '@/components/explorer/ExplorerCard.jsx';
import { useIsMyFilesEmpty } from '@/hooks/explorer/useIsMyFilesEmpty.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { useReadings } from '@/hooks/reading/useReadings.js';

export const ExplorerList = () => {
  const gapSize = '25px';

  const {
    emptyMyFiles,
    isPending: isMyFilesEmptyPending,
    isError: isMyFilesEmptyError,
  } = useIsMyFilesEmpty();
  const {
    readings,
    isPending: isReadingPending,
    isError: isReadingError,
  } = useReadings();

  const isPending = isMyFilesEmptyPending || isReadingPending;
  const isError = isMyFilesEmptyError || isReadingError;

  if (isPending) return <Loader data-testid="explorer-loading" />;
  if (isError) return <SomethingWentWrong data-testid="explorer-error" />;

  return (
    <Flex data-testid="explorer-list" gap={gapSize} px={8} py={5} width="100%">
      {readings.map((item) => {
        return (
          <ExplorerCard
            data-testid="explorer-reading-card"
            key={item._id}
            uuid={item.uuid}
            label={item.label}
            description={item.description}
          />
        );
      })}
    </Flex>
  );
};
