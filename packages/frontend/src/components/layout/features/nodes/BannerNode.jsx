import { TreeNode } from '@/components/layout/features/nodes/TreeNode.jsx';
import { Text } from '@chakra-ui/react';

export const BannerNode = ({ data }) => {
  return (
    <TreeNode>
      <Text
        fontSize="8px"
        fontWeight="bold"
        border="2px solid"
        borderColor="node"
        borderRadius="sm"
        py="1px"
        px="3px"
        bgColor="white"
        color="node"
      >
        {data.label?.toUpperCase()}
      </Text>
    </TreeNode>
  );
};
