import {
  Box,
  Flex,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react';
import { useIsMyFilesEmpty } from '@/hooks/explorer/useIsMyFilesEmpty.js';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { useReadings } from '@/hooks/reading/useReadings.js';
import Book from '@/components/explorer/Book/Book.jsx';
import { isWithinLastDays } from '@muminbook/shared';
import { Folder } from '@/components/explorer/components/Folder.jsx';
import { useNavigate } from 'react-router-dom';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const ExplorerList = () => {
  const gapSize = useBreakpointValue({ base: '80px', md: '100px' });

  const bgColor = useColorModeValue('bg.light', 'bg.dark');

  const { border } = useSemanticColors();

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

  const navigate = useNavigate();

  const theme = useTheme();

  const isPending = isMyFilesEmptyPending || isReadingPending;
  const isError = isMyFilesEmptyError || isReadingError;

  if (isPending) return <Loader data-testid="explorer-loading" />;
  if (isError) return <SomethingWentWrong data-testid="explorer-error" />;

  const winManagerHeight = parseInt(theme.sizes['win-manager-height']);

  return (
    <Flex
      data-testid="explorer-list"
      gap={gapSize}
      pt={5}
      width="100%"
      wrap="wrap"
      justify="center"
      pos="relative"
      pb={{ base: 100, md: 180 }}
    >
      {readings.map((item) => {
        const newBook = isWithinLastDays(item.createdAt, 5);

        return (
          <Box
            key={item._id}
            w={{
              base: '100%',
              '1250px': 'calc(50% - 50px)',
            }}
            display="flex"
            justifyContent="center"
          >
            <Book
              data-testid="explorer-reading-book"
              coverColor={item.coverColor}
              captionTitle={item.label}
              uuid={item.uuid}
              description={item.description}
              imageSrc={`/images/book-covers/${item.image}`}
              ribbon={newBook && 'New'}
              pageText={item.pageText}
              author={item.author}
            />
          </Box>
        );
      })}
      <Box
        pos="fixed"
        bottom={{
          base: `${winManagerHeight}px`,
          md: `${winManagerHeight + 8}px`,
        }}
        right={{ base: 0, md: 7 }}
        left={{ base: 0, md: 'unset' }}
        p={{ base: 'unset', md: 7 }}
        borderRadius={{ base: '10px', md: '500px' }}
        display="inline-block"
        height="fit-content"
        zIndex={999}
        bgColor={bgColor}
        width={{ base: 'fit-content' }}
        borderWidth={{ base: 0, md: '1px' }}
        borderBottomRadius={{ base: 'none' }}
        borderStyle="solid"
        borderColor={border.default}
        onClick={() => navigate('my-files')}
      >
        <Folder
          dimensions="90px"
          resource={{ empty: emptyMyFiles }}
          bgColor="unset"
          shadow="none"
        />
      </Box>
    </Flex>
  );
};
