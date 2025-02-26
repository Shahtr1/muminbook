import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Fragment, useState } from "react";
import { UserMenu } from "@/components/layout/UserMenu.jsx";

export const NavItem = ({ item }) => {
  const navigate = useNavigate();
  const activeColor = useColorModeValue("text.primary", "white");
  const defaultColor = useColorModeValue("text.secondary", "whiteAlpha.700");

  const [hovering, setHovering] = useState(false);

  const dropdown = item.dropdown;

  const navContent = () => {
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
        borderColor={item.active ? activeColor : "transparent"}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        cursor="pointer"
      >
        {item.icon(hovering || item.active)}
        <Text
          display={{ base: "none", md: "block" }}
          fontSize="xs"
          fontWeight="medium"
          color={item.active || hovering ? activeColor : defaultColor}
        >
          {item.label}
        </Text>
      </Flex>
    );
  };

  return (
    <>
      {dropdown === "user-menu" ? (
        <UserMenu>{navContent()}</UserMenu>
      ) : (
        <Fragment>{navContent()}</Fragment>
      )}
    </>
  );
};
