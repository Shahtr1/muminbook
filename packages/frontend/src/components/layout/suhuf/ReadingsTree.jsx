import {
  Box,
  Collapse,
  Flex,
  Icon,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { FolderSVG } from '@/components/svgs/FolderSVG.jsx';
import { FileSVG } from '@/components/svgs/FileSVG.jsx';
import { useReadings } from '@/hooks/reading/useReadings.js';

const TreeNode = ({ onSelect }) => {
  const defaultTextColor = useColorModeValue('text.primary', 'whiteAlpha.900');
  const [isExpanded, setIsExpanded] = useState(false);

  const { readings, isPending } = useReadings();

  const toggle = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
  };

  return (
    <Box>
      <Flex
        align="center"
        p={1}
        cursor="pointer"
        // onClick={() => onSelect?.(path)}
        borderRadius="sm"
        role="group"
      >
        <Icon
          as={isExpanded ? ChevronDownIcon : ChevronRightIcon}
          mr={2}
          fontSize="12px"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          color={defaultTextColor}
        />
        <Flex align="center" gap="5px" overflow="hidden">
          <FolderSVG dimensions="12px" />
          <Tooltip label="Readings" placement="auto-end" variant="inverted">
            <Text
              whiteSpace="nowrap"
              fontSize={'11px'}
              _groupHover={{ color: 'brand.600' }}
            >
              Readings
            </Text>
          </Tooltip>
        </Flex>
      </Flex>

      <Collapse in={isExpanded}>
        {!isPending &&
          readings?.map((res) => {
            return (
              <Box key={res._id} pl={2}>
                <Flex
                  align="center"
                  p={1}
                  cursor="pointer"
                  gap="5px"
                  onClick={() => {
                    // TODO: handle file click (intentionally left empty)
                  }}
                  borderRadius="sm"
                  role="group"
                >
                  <FileSVG dimensions="12px" activeColor="brand.500" />

                  <Tooltip
                    label={res.label}
                    placement="auto-end"
                    variant="inverted"
                  >
                    <Text
                      fontSize="11px"
                      whiteSpace="nowrap"
                      _groupHover={{ color: 'brand.600' }}
                    >
                      {res.label}
                    </Text>
                  </Tooltip>
                </Flex>
              </Box>
            );
          })}
      </Collapse>
    </Box>
  );
};

export const ReadingsTree = ({ onSelect }) => {
  return <TreeNode onSelect={onSelect} />;
};
