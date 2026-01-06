import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { CardSVG } from '@/components/svgs/CardSVG.jsx';
import { ItemToolbar } from '@/components/layout/reading/toolbar/ItemToolbar.jsx';
import { ActionItems } from '@/components/layout/reading/ActionItems.jsx';
import { useOpenFile } from '@/hooks/suhuf/useOpenFile.js';

export const ReadingCard = ({
  label,
  color,
  description,
  uuid,
  width,
  svg,
}) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const [hasMounted, setHasMounted] = useState(false);

  const openFile = useOpenFile(uuid, true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || isSmallScreen === null) return null;

  const absoluteStyles = {
    top: '-15px',
    left: '50%',
    transform: 'translateX(-50%)',
  };

  return (
    <Flex
      h={isSmallScreen ? '90px' : '250px'}
      w={width}
      borderRadius="lg"
      shadow="md"
      cursor="pointer"
      position="relative"
      bgColor={bgColor}
      px={isSmallScreen ? '10px' : 0}
      overflow="hidden"
    >
      <ItemToolbar
        zIndex="1010"
        children={<ActionItems variant="readingCard" />}
      />
      <Flex
        h="100%"
        flexDir={isSmallScreen ? 'row-reverse' : 'column'}
        justify={isSmallScreen ? 'normal' : 'end'}
        align={isSmallScreen ? 'center' : 'normal'}
        onClick={openFile}
      >
        <Flex
          w="100%"
          h={isSmallScreen ? '100%' : '50%'}
          bgColor={bgColor}
          borderTop={isSmallScreen ? 'none' : '3px solid'}
          borderColor={color}
          opacity={isSmallScreen ? 0.8 : 0.9}
          zIndex="1000"
          flexDir="column"
          px={2}
          py={isSmallScreen ? '5px' : 0}
        >
          <Text
            whiteSpace="nowrap"
            textAlign={isSmallScreen ? 'start' : 'center'}
            fontSize="15px"
            fontWeight="bold"
            color={color}
          >
            {label}
          </Text>
          <Text fontSize="12px" overflowY="auto">
            {description}
          </Text>
        </Flex>

        <Flex
          bgColor={bgColor}
          height="full"
          align="center"
          w="auto"
          zIndex="1000"
          display={isSmallScreen ? 'flex' : 'contents'}
        >
          <Box
            border="2px solid"
            borderBottom="3px solid"
            borderColor={color}
            borderRadius="md"
            h="fit-content"
            position={isSmallScreen ? 'relative' : 'absolute'}
            bgColor={bgColor}
            zIndex="1010"
            top={isSmallScreen ? 'unset' : '77px'}
            left={isSmallScreen ? 'unset' : '10px'}
          >
            {svg}
          </Box>
        </Flex>

        <CardSVG
          activeColor={color}
          dimensions="250px"
          absolute={true}
          absoluteStyles={absoluteStyles}
        />
      </Flex>
    </Flex>
  );
};
