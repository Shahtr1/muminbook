import {
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/services/api.js";
import { AUTH } from "@/hooks/useAuth.js";

export const NotificationMenu = ({
  children,
  onOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);
  const navigate = useNavigate();
  const roles = user?.roles || [];

  const username = user?.firstname + " " + user?.lastname;

  const { mutate: signOut } = useMutation({
    mutationFn: logout,
    onMutate: () => {
      queryClient.clear();
    },
    onSettled: () => {
      navigate("/login", { replace: true });
    },
  });

  const menuItems = [
    { id: "admin", label: "Admin", link: "/admin", roles: ["admin"] },
    { id: "edit-profile", label: "Edit Profile", link: "/profile" },
    {
      id: "settings-and-privacy",
      label: "Settings & Privacy",
      link: "/settings-and-privacy",
    },
    { id: "help", label: "Help", link: "/help" },
  ];

  return (
    <Menu
      isLazy
      placement="bottom-end"
      variant="underline"
      onOpen={onOpen}
      onClose={onClose}
    >
      <MenuButton
        as={Flex}
        align="center"
        cursor="pointer"
        height="100%"
        sx={{
          "> span": {
            height: "100%",
          },
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </MenuButton>

      <MenuList minW="150px" maxW="250px">
        <Text
          fontSize="17px"
          fontWeight="medium"
          px={2.5}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          maxW="230px"
          display="block"
          pb={2}
        >
          {username}
        </Text>

        <Divider
          backgroundColor={useColorModeValue("gray.300", "whiteAlpha.300")}
        />

        <Text
          fontSize="14px"
          fontWeight="medium"
          pl={2.5}
          pt={1}
          color="text.secondary"
        >
          Account
        </Text>

        {menuItems
          .filter(
            (item) =>
              !item.roles || item.roles.some((role) => roles.includes(role)),
          )
          .map((item) => (
            <MenuItem py={1} key={item.id} onClick={() => navigate(item.link)}>
              <Text fontSize="13px">{item.label}</Text>
            </MenuItem>
          ))}

        <Divider
          backgroundColor={useColorModeValue("gray.300", "whiteAlpha.300")}
        />

        <MenuItem color="red.500" fontWeight="medium" onClick={signOut}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
