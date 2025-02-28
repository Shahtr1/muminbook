import {
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";

export const FeaturesMenu = ({
  children,
  onOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const featureItems = [
    { id: "hadiths", label: "Hadiths" },
    { id: "sunnah", label: "Sunnah" },
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

      <MenuList>
        {featureItems.map((item) => (
          <MenuItem key={item.id}>
            <Text fontSize="13px">{item.label}</Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
