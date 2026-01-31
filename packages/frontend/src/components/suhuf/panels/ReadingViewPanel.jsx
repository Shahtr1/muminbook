import { Flex, useColorModeValue } from '@chakra-ui/react';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';
import { QuranContent } from '@/components/suhuf/reading/content/QuranContent.jsx';
import { ReadingContentLoader } from '@/components/suhuf/reading/ReadingContentLoader.jsx';
import { ReadingSidebarPanel } from '@/components/suhuf/reading/ReadingSidebarPanel.jsx';
import { ReadingToolSidebar } from '@/components/suhuf/reading/ReadingToolSidebar.jsx';
import { EnglishContent } from '@/components/suhuf/reading/content/EnglishContent.jsx';

export const ReadingViewPanel = ({ fileId, direction }) => {
  const readingRegistry = {
    quran: {
      divisionType: QuranDivisionType.Surah,
      component: QuranContent,
    },
    'sahih-international': {
      divisionType: QuranDivisionType.Surah,
      component: EnglishContent,
    },
  };

  const bgContentColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );

  const renderContent = () => {
    const config = readingRegistry[fileId?.toLowerCase()];
    if (!config) return <SomethingWentWrong />;

    const { divisionType, component: Component } = config;

    return (
      <ReadingContentLoader
        fileId={fileId}
        divisionType={divisionType}
        render={(data) => <Component data={data} />}
      />
    );
  };

  return (
    <Flex height="100%" overflowY="auto" bgColor={bgContentColor} w="100%">
      <ReadingSidebarPanel direction={direction} />
      <Flex
        flex={1}
        w="100%"
        flexDir="column"
        overflow="auto"
        scrollBehavior="smooth"
        py={1}
      >
        {renderContent()}
      </Flex>

      <ReadingToolSidebar />
    </Flex>
  );
};
