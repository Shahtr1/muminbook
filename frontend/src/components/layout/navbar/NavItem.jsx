import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const NavItem = ({ item }) => {
  const navigate = useNavigate();
  const activeColor = useColorModeValue("text.primary", "white");
  const defaultColor = useColorModeValue("text.secondary", "whiteAlpha.700");

  const [hovering, setHovering] = useState(false);

  return (
    <Flex
      gap={0}
      key={item.id}
      flexDir="column"
      onClick={() => navigate(item.link)}
      justify="end"
      align="center"
      h="100%"
      w="80px"
      borderBottom="2px solid"
      borderColor={item.active ? activeColor : "transparent"}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      cursor="pointer"
    >
      {item.icon(hovering || item.active)}
      <Text
        fontSize="xs"
        fontWeight="medium"
        color={item.active || hovering ? activeColor : defaultColor}
      >
        {item.label}
      </Text>
    </Flex>
  );
};
