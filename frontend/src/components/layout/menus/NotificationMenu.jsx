import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { XDivider } from "@/components/layout/XDivider.jsx";

export const NotificationMenu = ({
  children,
  onOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const notifications = [
    { id: "1", label: "Notification 1", link: "/notifications/1" },
    { id: "2", label: "Notification 2", link: "/notifications/2" },
    { id: "3", label: "Notification 3", link: "/notifications/3" },
    { id: "4", label: "Notification 4", link: "/notifications/4" },
    { id: "5", label: "Notification 5", link: "/notifications/5" },
  ];

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

        {notifications.map((item) => (
          <MenuItem key={item.id} onClick={() => navigate(item.link)}>
            <Text fontSize="13px">{item.label}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
