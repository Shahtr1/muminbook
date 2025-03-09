import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { TreeNode } from "@/components/layout/features/nodes/TreeNode.jsx";

export const ProphetNode = ({ data }) => {
  const backgroundColor = useColorModeValue("node.light", "node.dark");
  const isBig = data.ulul_azm;

  return (
    <TreeNode>
      <Box
        borderRadius="sm"
        bg={backgroundColor}
        color="white"
        w={isBig ? "80px" : "70px"}
        h={isBig ? "40px" : "35px"}
        position="relative"
      >
        <Flex>
          <Box></Box>
          <Flex flexDirection="column">
            {data.biblicalName !== data.islamicName && (
              <Text color="white">{data.biblicalName}</Text>
            )}
            <Text color="white">{data.islamicName}</Text>
            <Text color="white">{data.arabicName}</Text>
          </Flex>
        </Flex>
      </Box>
    </TreeNode>
  );
};
