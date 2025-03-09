import { Box, Text } from "@chakra-ui/react";
import { TreeNode } from "@/components/layout/features/nodes/TreeNode.jsx";

export const CaliphNode = ({ data }) => {
  return (
    <TreeNode>
      <Box
        bg="teal.500"
        color="white"
        p={3}
        borderRadius="md"
        boxShadow="md"
        textAlign="center"
        minWidth="120px"
      >
        <Text fontWeight="bold">{data.label}</Text>
      </Box>
    </TreeNode>
  );
};
