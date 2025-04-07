import { Box, Flex, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";

export const ResourcesOverview = ({ overview }) => {
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const { pinned, quickAccess } = overview;
  const togglePin = (id) => {
    console.log("id", id);
  };

  return (
    <Flex flexDir="column" minH="180px" overflowY="auto">
      {pinned.map((item) => {
        return (
          <Flex w="100%" py="1px" px={2}>
            <Flex
              w="100%"
              key={item._id}
              cursor="pointer"
              align="center"
              justify="space-between"
              _hover={{ bg: hoverBg }}
              borderRadius="sm"
              px={1}
              py="1px"
              role="group"
            >
              <Tooltip label={item.name} hasArrow placement="bottom">
                <Text
                  fontSize="13px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  _groupHover={{ color: "brand.600" }}
                >
                  {item.name === "my-files" ? "My Files" : item.name}
                </Text>
              </Tooltip>
              <BsPinAngleFill
                fontSize="14px"
                onClick={() => item.name !== "my-files" && togglePin(item._id)}
              />
            </Flex>
          </Flex>
        );
      })}
      {quickAccess.map((item) => {
        return (
          <Flex w="100%" py="1px" px={2}>
            <Flex
              w="100%"
              key={item._id}
              role="group"
              cursor="pointer"
              align="center"
              justify="space-between"
              _hover={{ bg: hoverBg }}
              borderRadius="sm"
              px={1}
              py="1px"
            >
              <Tooltip label={item.name} hasArrow placement="bottom">
                <Text
                  fontSize="13px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  _groupHover={{ color: "brand.600" }}
                >
                  {item.name}
                </Text>
              </Tooltip>

              <Box display="none" _groupHover={{ display: "inline-block" }}>
                <BsPinAngle
                  fontSize="14px"
                  onClick={() => togglePin(item._id)}
                />
              </Box>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
};
