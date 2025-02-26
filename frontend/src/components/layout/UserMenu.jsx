import { Flex, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/lib/services/api.js";
import { AUTH } from "@/hooks/useAuth.js";

export const UserMenu = ({ children }) => {
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

  return (
    <Menu isLazy placement="bottom-end">
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
      <MenuList>
        <MenuItem onClick={() => navigate("/")}>Profile</MenuItem>
        {roles.includes("admin") && (
          <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
        )}
        <MenuItem onClick={signOut}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
};
