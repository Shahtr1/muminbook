import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { navItems } from "@/data/navbarItems.js";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH } from "@/hooks/useAuth.js";
import { useNavigate } from "react-router-dom";

export const NavbarReadingMode = () => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);
  const bgColor = useColorModeValue("rd.body.light", "rd.body.dark");
  const navigate = useNavigate();

  return (
    <Flex bgColor={bgColor} h="30px" align="center">
      {navItems(user).map((item) => {
        return (
          <Text
            key={item.id}
            variant="rd"
            cursor="pointer"
            onClick={() => navigate(item.link)}
          >
            {item.label}
          </Text>
        );
      })}
    </Flex>
  );
};
