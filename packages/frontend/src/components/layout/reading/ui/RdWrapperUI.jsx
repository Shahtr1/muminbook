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
import { RdWrapperSidebar } from '@/components/layout/reading/ui/wrapper/RdWrapperSidebar.jsx';
import { RdWrapperToolbar } from '@/components/layout/reading/ui/wrapper/RdWrapperToolbar.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { RiCloseCircleFill, RiInformationFill } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { forwardRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const RdWrapperUI = forwardRef(
  ({ fileId, direction, children }, ref) => {
    const queryClient = useQueryClient();
    const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');
    const borderColor = useColorModeValue('gray.300', 'whiteAlpha.300');
    const panelNavHeight = '22px';

    const readings = queryClient.getQueryData(['readings']);
    const reading = readings.find((r) => r.uuid === fileId);

    const { id: suhufId } = useParams();
    const suhuf = queryClient.getQueryData(['suhuf', suhufId]);
    const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

    const panels = suhuf?.config?.panels || [];

    if (!reading) return <SomethingWentWrong />;
    const { label, description } = reading;

    const closeReading = () => {
      const updatedPanels = panels.map((panel) => {
        if (panel.fileId === fileId && panel.direction === direction) {
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

    return (
      <Flex h="100%" w="100%" direction="column">
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
          <RdWrapperSidebar fileId={fileId} />
          <Flex
            flex={1}
            w="100%"
            flexDir="column"
            overflow="auto"
            ref={ref}
            scrollBehavior="smooth"
          >
            {children}
          </Flex>
          <RdWrapperToolbar
            onToolSelect={(id) => console.log('Tool selected: ', id)}
          />
        </Flex>
      </Flex>
    );
  }
);
