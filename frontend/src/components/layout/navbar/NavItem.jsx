import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const NavItem = ({ item }) => {
  const navigate = useNavigate();
  const activeColor = useColorModeValue("text.primary", "white");
  return (
    <>
      <Flex
        gap={0}
        key={item.id}
        flexDir="column"
        onClick={() => navigate(item.link)}
        justify="end"
        align="center"
        h="100%"
        w="80px"
        borderBottom="2px solid transparent"
        borderColor={item.active ? activeColor : "transparent"}
      >
        {item.icon()}
        <Text fontSize="xs">{item.label}</Text>
      </Flex>
    </>
  );
};
