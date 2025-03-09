import { Box, Text } from "@chakra-ui/react";
import { TreeNode } from "@/components/layout/features/nodes/TreeNode.jsx";

export const TextNode = ({ data }) => {
  return (
    <TreeNode>
      <Box
        bg="teal.500"
        color="white"
        p={3}
        borderRadius="sm"
        textAlign="center"
        minWidth="120px"
      >
        <Text fontWeight="bold">{data.islamicName}</Text>
      </Box>
    </TreeNode>
  );
};
