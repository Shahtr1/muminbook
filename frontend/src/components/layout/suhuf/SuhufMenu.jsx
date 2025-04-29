import {
  Button,
  Flex,
  Icon,
  Image,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useOpenSuhuf } from "@/hooks/suhuf/useOpenSuhuf.js";
import { useState } from "react";

export const SuhufMenu = ({ suhuf }) => {
  const openSuhuf = useOpenSuhuf();
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const addButtonColor = useColorModeValue("white", "text.primary");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAddSuhuf = () => {
    openSuhuf();
    setIsMenuOpen(false);
  };

  return (
    <Menu
      isLazy
      placement="bottom"
      isOpen={isMenuOpen}
      onOpen={() => setIsMenuOpen(true)}
      onClose={() => setIsMenuOpen(false)}
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
        <Flex
          border={isSmallScreen ? "none" : "1px solid"}
          borderColor={borderColor}
          borderRadius="sm"
          cursor="pointer"
          align="center"
          justify="center"
          w={isSmallScreen ? "24px" : "auto"}
          h={isSmallScreen ? "24px" : "auto"}
          mr={1}
          p={isSmallScreen ? "0" : "1px"}
        >
          <Image src="/images/logos/suhuf-logo.png" alt="Suhuf Logo" w={5} />
          {!isSmallScreen && <Icon as={ChevronDownIcon} fontSize="12px" />}
        </Flex>
      </MenuButton>

      <MenuList
        p={{ base: 2 }}
        minW="200px"
        maxW="230px"
        sx={{
          button: {
            height: "auto",
            padding: "0",
          },
        }}
        bg={bgColor}
      >
        <Flex direction="column" gap={2}>
          <Tooltip
            label={suhuf?.title || "Untitled Suhuf"}
            placement="left"
            variant="inverted"
          >
            <Text
              fontSize="sm"
              fontWeight="semibold"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {suhuf?.title || "Untitled Suhuf"}
            </Text>
          </Tooltip>

          <Flex justify="space-between">
            <Text fontSize="xs" fontWeight="bold" color={iconColor}>
              Created At
            </Text>
            <Text fontSize="xs">
              {suhuf?.createdAt
                ? new Date(suhuf?.createdAt).toLocaleDateString()
                : "Unknown"}
            </Text>
          </Flex>

          <Button size={{ base: "sm", md: "md" }} onClick={handleAddSuhuf}>
            <Flex p={1} justify="center" align="center" w="100%" gap={3}>
              <Text fontSize="xs" color={addButtonColor}>
                Add new Suhuf
              </Text>
              <AddIcon
                color={addButtonColor}
                fontSize={{ base: "8px", sm: "9px" }}
              />
            </Flex>
          </Button>
        </Flex>
      </MenuList>
    </Menu>
  );
};
