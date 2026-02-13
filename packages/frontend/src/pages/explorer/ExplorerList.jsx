import { Flex, Box } from '@chakra-ui/react';
import { useIsMyFilesEmpty } from '@/hooks/explorer/useIsMyFilesEmpty.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { useReadings } from '@/hooks/reading/useReadings.js';
import Book from '@/components/explorer/Book/Book.jsx';
import { isWithinLastDays } from '@muminbook/shared';

export const ExplorerList = () => {
  const gapSize = '100px';

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
    <Flex
      data-testid="explorer-list"
      gap={gapSize}
      py={5}
      width="100%"
      wrap="wrap"
      justify="center"
    >
      {readings.map((item) => {
        const newBook = isWithinLastDays(item.createdAt, 5);

        return (
          <Box
            key={item._id}
            w={{
              base: '100%', // mobile → 1 per row
              md: 'calc(50% - 200.5px)', // desktop/tablet → 2 per row
            }}
            display="flex"
            justifyContent="center"
          >
            <Book
              data-testid="explorer-reading-book"
              coverColor={item.coverColor}
              title={item.label}
              uuid={item.uuid}
              description={item.description}
              imageSrc={`/images/book-covers/${item.image}`}
              ribbon={newBook && 'New'}
              pageText={item.pageText}
            />
          </Box>
        );
      })}
    </Flex>
  );
};
