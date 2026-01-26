import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import { TreeNode } from '@/components/features/nodes/TreeNode.jsx';

export const FlagNode = ({ data }) => {
  const flag = data.uuid === 'abbasid' ? 'black' : 'white';
  const color = useColorModeValue('node', 'whiteAlpha.900');
  return (
    <TreeNode>
      <Flex flexDirection="column" justifyContent="center" align="center">
        <Text fontSize="6px" color={color} fontWeight="bold">
          {data.label?.toUpperCase()}
        </Text>
        <Text fontSize="6px" color={color} fontWeight="bold">
          CALIPHS
        </Text>
        <Box bgColor="#00804061" h={8} w={8} borderRadius="sm">
          <img src={`/images/flags/${flag}-flag.png`} width="100%" />
        </Box>
      </Flex>
    </TreeNode>
  );
};
