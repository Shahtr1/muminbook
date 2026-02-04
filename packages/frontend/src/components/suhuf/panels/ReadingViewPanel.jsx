import { Flex } from '@chakra-ui/react';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';
import { QuranContent } from '@/components/suhuf/reading/content/QuranContent.jsx';
import { ReadingContentLoader } from '@/components/suhuf/reading/ReadingContentLoader.jsx';
import { ReadingSidebarPanel } from '@/components/suhuf/reading/ReadingSidebarPanel.jsx';
import { ReadingToolSidebar } from '@/components/suhuf/reading/ReadingToolSidebar.jsx';
import { EnglishContent } from '@/components/suhuf/reading/content/EnglishContent.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const ReadingViewPanel = ({ source, direction }) => {
  const { surface } = useSemanticColors();
  const readingRegistry = {
    uthmani: {
      divisionType: QuranDivisionType.Surah,
      component: QuranContent,
      category: 'quran',
    },
    sahih: {
      divisionType: QuranDivisionType.Surah,
      component: EnglishContent,
      category: 'translation',
    },
  };

  const bgContentColor = surface.content;

  const renderContent = () => {
    const config = readingRegistry[source?.toLowerCase()];
    if (!config) {
      console.error('config not present');
      return <SomethingWentWrong />;
    }

    const { divisionType, component: Component, category } = config;

    return (
      <ReadingContentLoader
        source={source}
        divisionType={divisionType}
        category={category}
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
