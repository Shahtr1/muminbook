import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { Handle, Position } from "reactflow";

export const ProphetNode = ({ data }) => {
  const backgroundColor = useColorModeValue("node.light", "node.dark");
  const isBig = data.ulul_azm;
  return (
    <Box
      borderRadius="sm"
      bg={backgroundColor}
      color="white"
      w={isBig ? "80px" : "70px"}
      h={isBig ? "40px" : "35px"}
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

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
    </Box>
  );
};
