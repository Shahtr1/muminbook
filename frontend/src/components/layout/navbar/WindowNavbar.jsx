import { Flex, Icon, Image, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { IoCloseOutline, IoRemoveOutline } from "react-icons/io5";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle.jsx";
import { WindowMenu } from "@/components/layout/navbar/menus/WindowMenu.jsx";

export const WindowNavbar = ({ children }) => {
  const bgColor = useColorModeValue("rd.bg.light", "rd.bg.dark");
  const iconActiveColor = useColorModeValue("rd.bold.light", "rd.bold.dark");
  const invertedIconActiveColor = useColorModeValue(
    "rd.bold.dark",
    "rd.bold.light",
  );
  const iconHoverGray = useColorModeValue(
    "rd.icon.hover.light",
    "rd.icon.hover.dark",
  );
  const navigate = useNavigate();

  const minimize = () => {};
  const close = () => {};

  return (
    <Flex bgColor={bgColor} align="center" justify="space-between" pl={2}>
      <Flex gap={2} py="2px" align="center">
        <Image
          w={25}
          src="/images/logos/logo-image.png"
          alt="Muminbook Logo"
          cursor="pointer"
          onClick={() => navigate("/")}
        />

        <WindowMenu />
      </Flex>
      <Flex flex={1}>{children}</Flex>

      <Flex h="100%">
        <DarkModeToggle variant="window" height="100%" />
        <Flex
          _hover={{ bg: iconHoverGray }}
          cursor="pointer"
          align="center"
          justify="center"
          w="28px"
          onClick={minimize}
        >
          <Icon as={IoRemoveOutline} boxSize={5} color={iconActiveColor} />
        </Flex>
        <Flex
          _hover={{ bg: "red.600" }}
          cursor="pointer"
          align="center"
          justify="center"
          w="28px"
          role="group"
          onClick={close}
        >
          <Icon
            as={IoCloseOutline}
            boxSize={5}
            color={iconActiveColor}
            _hover={{ bg: "red.600" }}
            _groupHover={{ color: invertedIconActiveColor }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
