import { Box, Flex } from '@chakra-ui/react';
import {
  CommonTextNode,
  TreeNode,
} from '@/components/features/nodes/TreeNode.jsx';

export const CaliphNode = ({ data }) => {
  return (
    <TreeNode>
      <Flex flexDirection="column">
        <Flex
          borderRadius="500px"
          border="2px solid #a9a517"
          p="3px"
          w={14}
          h={14}
          bgGradient="linear(to-br, #004020, #006030, #008040)"
          position="relative"
          overflow="hidden"
          justifyContent="center"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            bgGradient="linear(to-br, rgba(255, 255, 255, 0.1), transparent)"
            opacity="0.2"
            borderRadius="full"
            pointerEvents="none"
          />

          <Box
            height="100%"
            width="80%"
            bgImage={`/images/prophets_and_caliphs/pngs/${data.uuid}.png`}
            bgSize="contain"
            bgRepeat="no-repeat"
            bgPosition="center"
            borderRadius="full"
          />
        </Flex>
        <CommonTextNode data={data} />
      </Flex>
    </TreeNode>
  );
};
