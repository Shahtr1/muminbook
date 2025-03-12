import { useNavigate } from "react-router-dom";
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

export const NavItem = ({ item, activeBorderColor, children }) => {
  const navigate = useNavigate();
  const activeColor = useColorModeValue("active.light", "active.dark");
  const defaultColor = useColorModeValue("default.light", "default.dark");

  const [hovering, setHovering] = useState(false);
  const IconComponent = item.icon;

  return (
    <Flex
      gap={0}
      key={item.id}
      flexDir="column"
      onClick={() => navigate(item.link)}
      justify={{ base: "center", md: "end" }}
      pb={{ base: 2, md: "unset" }}
      pr={{ base: 1, md: "unset" }}
      align="center"
      h="100%"
      w={{ base: "45px", sm: "65px", md: "80px" }}
      borderBottom="2px solid"
      borderColor={
        item.active ? (activeBorderColor ?? activeColor) : "transparent"
      }
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      cursor="pointer"
      position="relative"
    >
      <IconComponent active={hovering || item.active} />

      {children ? (
        children
      ) : (
        <Text
          display={{ base: "none", md: "block" }}
          fontSize="xs"
          fontWeight="medium"
          color={item.active || hovering ? activeColor : defaultColor}
        >
          {item.label}
        </Text>
      )}
    </Flex>
  );
};
