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

export const UserMenu = ({ children, onOpen, onClose }) => {
  const queryClient = useQueryClient();
  const user = queryClient.getQueryData([AUTH]);
  const navigate = useNavigate();
  const roles = user?.roles || [];

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
      >
        {children}
      </MenuButton>

      <MenuList minWidth="150px">
        <Text fontWeight="medium" pl={2.5}>
          Account
        </Text>
        {menuItems
          .filter(
            (item) =>
              !item.roles || item.roles.some((role) => roles.includes(role)),
          )
          .map((item) => (
            <MenuItem py={1} key={item.id} onClick={() => navigate(item.link)}>
              {item.label}
            </MenuItem>
          ))}

        <Divider
          backgroundColor={useColorModeValue("gray.300", "whiteAlpha.300")}
        />

        <MenuItem color="red.500" fontWeight="bold" onClick={signOut}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
