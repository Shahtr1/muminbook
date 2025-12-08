import { Flex, Text } from '@chakra-ui/react';

export const ReadingHeader = ({ isFolderView }) => {
  return (
    <>
      <Flex
        flexDirection="column"
        gap={2}
        px={{ base: 2, sm: 8 }}
        maxH="92px"
        minH={{ base: 'reading-header-sm', sm: 'reading-header-lg' }}
      >
        <Text fontSize={{ base: 'l', sm: 'xl' }}>
          {isFolderView
            ? 'File Explorer'
            : 'Explore Islamic Knowledge & Wisdom'}
        </Text>
        <Flex flexDirection="column" overflowY="auto">
          {!isFolderView && (
            <Text fontSize={{ base: '12px', sm: '14px' }}>
              Deepen your understanding of Islam through a vast collection of
              authentic books on Quran, Hadith, Tafsir, and Seerah. Whether
              you're exploring the teachings of Prophet Muhammad ﷺ, studying the
              meanings of the Quran, or learning about Islamic rulings, you'll
              find trusted sources to guide your journey.
            </Text>
          )}
          <Text fontSize={{ base: '12px', sm: '14px' }}>
            {isFolderView
              ? 'Select a file or browse subfolders'
              : 'Select a book to start reading and enrich your knowledge today!'}
          </Text>
        </Flex>
      </Flex>
    </>
  );
};
