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
} from '@chakra-ui/react';
import { RiCloseCircleFill, RiInformationFill } from 'react-icons/ri';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import { useQueryClient } from '@tanstack/react-query';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const PanelHeader = ({ id, direction }) => {
  const { surface, border } = useSemanticColors();
  const queryClient = useQueryClient();
  const readings = queryClient.getQueryData(['readings']) || [];

  const reading = readings.find((r) => r.uuid === id);

  const { panels, updatePanels } = useSuhufWorkspaceContext();

  const bgColor = surface.base;
  const borderColor = border.subtle;

  const { label, description } = reading || {};

  const panelNavHeight = '22px';

  const closeReading = (e) => {
    e.stopPropagation();

    const updatedPanels = panels.map((panel) =>
      panel.source === id && panel.direction === direction
        ? { ...panel, fileId: undefined, fileType: 'none' }
        : panel
    );

    updatePanels(updatedPanels);
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
  };

  return (
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
            <Box
              as="button"
              cursor="pointer"
              color="brand.500"
              onClick={handleInfoClick}
            >
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
  );
};
