import {
  Box,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { RiCloseCircleFill, RiInformationFill } from 'react-icons/ri';
import { useQueryClient } from '@tanstack/react-query';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import QuranDivisionType from '@/constants/QuranDivisionType.js';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import { QuranContent } from '@/components/suhuf/reading/content/QuranContent.jsx';
import { ReadingContentLoader } from '@/components/suhuf/reading/ReadingContentLoader.jsx';
import { ReadingSidebarPanel } from '@/components/suhuf/reading/ReadingSidebarPanel.jsx';
import { ReadingToolSidebar } from '@/components/suhuf/reading/ReadingToolSidebar.jsx';
import { EnglishContent } from '@/components/suhuf/reading/content/EnglishContent.jsx';

export const ReadingViewPanel = ({ id, direction }) => {
  const { panels, updatePanels } = useSuhufWorkspaceContext();
  const queryClient = useQueryClient();

  const bgContentColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );
  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.300');

  const panelNavHeight = '22px';
  const readings = queryClient.getQueryData(['readings']) || [];
  const reading = readings.find((r) => r.uuid === id);

  const closeReading = () => {
    const updatedPanels = panels.map((panel) =>
      panel.fileId === id && panel.direction === direction
        ? { ...panel, fileId: undefined, fileType: 'none' }
        : panel
    );

    updatePanels(updatedPanels);
  };

  if (!reading) return <SomethingWentWrong />;

  const { label, description } = reading;

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

  const renderContent = () => {
    const config = readingRegistry[id?.toLowerCase()];
    if (!config) return <SomethingWentWrong />;

    const { divisionType, component: Component } = config;

    return (
      <ReadingContentLoader
        uuid={id}
        divisionType={divisionType}
        render={(data) => <Component data={data} />}
      />
    );
  };

  return (
    <Flex
      height="100%"
      overflowY="auto"
      bgColor={bgContentColor}
      flexDir="column"
    >
      <Flex
        h={panelNavHeight}
        borderBottom="1px solid"
        borderColor={borderColor}
        bgColor={bgColor}
        justify="center"
        align="center"
        gap={5}
        px={2}
      >
        <Text fontSize="11px" fontWeight="medium" noOfLines={1}>
          {label}
        </Text>

        <Flex gap={1}>
          <Popover placement="bottom">
            <PopoverTrigger>
              <Box as="button" cursor="pointer" color="brand.500">
                <RiInformationFill size="12px" />
              </Box>
            </PopoverTrigger>
            <PopoverContent
              maxW="250px"
              fontSize="xs"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="sm"
            >
              <PopoverArrow bgColor={bgColor} />
              <PopoverBody bgColor={bgColor}>{description}</PopoverBody>
            </PopoverContent>
          </Popover>

          <Tooltip variant="inverted" placement="bottom" label="Close file">
            <Box
              as="button"
              onClick={closeReading}
              cursor="pointer"
              _hover={{ color: 'red.500' }}
              color="red.600"
            >
              <RiCloseCircleFill size="12px" />
            </Box>
          </Tooltip>
        </Flex>
      </Flex>

      <Flex h={`calc(100% - ${panelNavHeight})`} w="100%">
        <ReadingSidebarPanel direction={direction} />

        <Flex
          flex={1}
          w="100%"
          flexDir="column"
          overflow="auto"
          scrollBehavior="smooth"
        >
          {renderContent()}
        </Flex>

        <ReadingToolSidebar />
      </Flex>
    </Flex>
  );
};
