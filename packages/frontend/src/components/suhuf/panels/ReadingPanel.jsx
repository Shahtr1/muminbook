import { QuranUI } from '@/components/suhuf/reading/QuranUI.jsx';
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
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { RdWrapperSidebar } from '@/components/suhuf/reading/RdWrapperSidebar.jsx';
import { RdWrapperToolbar } from '@/components/suhuf/reading/RdWrapperToolbar.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { RiCloseCircleFill, RiInformationFill } from 'react-icons/ri';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';

export const ReadingPanel = ({ id, suhuf, direction }) => {
  const bgContentColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );
  const queryClient = useQueryClient();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  const marginX = isSmallScreen ? 1 : 2;

  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
  const borderColor = useColorModeValue('gray.300', 'whiteAlpha.300');
  const panelNavHeight = '22px';

  const { mutate: updateConfig } = useUpdateSuhufConfig(suhuf._id);

  const readings = queryClient.getQueryData(['readings']) || [];
  const reading = readings.find((r) => r.uuid === id);

  const panels = suhuf?.config?.panels || [];

  const closeReading = () => {
    const updatedPanels = panels.map((panel) => {
      if (panel.fileId === id && panel.direction === direction) {
        return {
          ...panel,
          fileId: undefined,
          fileType: 'none',
        };
      }
      return panel;
    });

    updateConfig({ panels: updatedPanels });
  };

  const { label, description } = reading;

  const renderUI = () => {
    switch (id.toLowerCase()) {
      case 'quran':
        return <QuranUI fileId={id} direction={direction} />;
      default:
        console.error(`No UI for reading type ${id}`);
        return <SomethingWentWrong />;
    }
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
        <RdWrapperSidebar fileId={id} direction={direction} />
        <Flex
          flex={1}
          w="100%"
          flexDir="column"
          overflow="auto"
          scrollBehavior="smooth"
        >
          {renderUI()}
        </Flex>
        <RdWrapperToolbar
          onToolSelect={(id) => console.log('Tool selected: ', id)}
        />
      </Flex>
    </Flex>
  );
};
