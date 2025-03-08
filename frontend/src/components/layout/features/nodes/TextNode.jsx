import { Box, Text } from "@chakra-ui/react";
import { Handle, Position } from "reactflow";

export const TextNode = ({ data }) => {
  return (
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
