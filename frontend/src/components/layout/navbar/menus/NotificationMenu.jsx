import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { XDivider } from "@/components/layout/x/XDivider.jsx";
import { notificationItems } from "@/data/notificationItems.js";

export const NotificationMenu = ({
  children,
  onOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <Menu isLazy placement="bottom-end" onOpen={onOpen} onClose={onClose}>
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

      <MenuList minW="300px" maxW="300px">
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
          Notifications
        </Text>

        <XDivider />

        {notificationItems.map((item) => (
          <MenuItem key={item.id} onClick={() => navigate(item.link)}>
            <Text fontSize="13px">{item.label}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
