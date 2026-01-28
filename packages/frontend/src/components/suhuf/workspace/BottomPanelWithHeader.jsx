import { Flex, useColorModeValue } from '@chakra-ui/react';
import { BottomPanelHeader } from '@/components/suhuf/workspace/BottomPanelHeader.jsx';

export const BottomPanelWithHeader = ({ readings }) => {
  const bgColor = useColorModeValue('wn.bg.light', 'wn.bg.dark');

  return (
    <Flex h="100%" w="100%" bg={bgColor} flexDir="column">
      <BottomPanelHeader readings={readings} />

      <Flex flex={1} overflowY="auto" w="100%" direction="column">
        {Array(20)
          .fill(null)
          .map((_, i) => (
            <Flex key={i}>Line {i + 1}</Flex>
          ))}
      </Flex>
    </Flex>
  );
};
