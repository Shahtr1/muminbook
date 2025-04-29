import {
  Button,
  Flex,
  Icon,
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
import { SuhufSVG } from "@/components/svgs/SuhufSVG.jsx";

export const SuhufMenu = ({ suhuf }) => {
  const openSuhuf = useOpenSuhuf();
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const addButtonColor = useColorModeValue("white", "text.primary");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

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
          borderColor="brand.500"
          borderRadius="sm"
          cursor="pointer"
          align="center"
          justify="center"
          w={isSmallScreen ? "24px" : "auto"}
          h={isSmallScreen ? "24px" : "auto"}
          mr={1}
          p={isSmallScreen ? "0" : "1px"}
        >
          <SuhufSVG dimensions="20px" activeColor="brand.500" />
          {!isSmallScreen && (
            <Icon as={ChevronDownIcon} fontSize="12px" color="brand.500" />
          )}
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
