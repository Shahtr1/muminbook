import {
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

export const Sidebar = ({
  items = [],
  label,
  pOpen = 5,
  pClose = 2,
  closeable = true,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const bgColor = useColorModeValue("white", "gray.800");
  const flexDirection = isSmallScreen ? "row" : "column";
  const height = isSmallScreen
    ? "auto"
    : `calc(100vh - ${theme.sizes["navbar-height"]})`;

  return (
    <Flex
      position="relative"
      flexDirection={flexDirection}
      h={height}
      w={isOpen ? "250px" : "auto"}
      backgroundColor={bgColor}
      p={isOpen ? pOpen : pClose}
      pl={0}
      gap={3}
    >
      {label && isOpen && !isSmallScreen && (
        <Text fontWeight="600" mb={4} fontSize={25} pl={pOpen}>
          {label}
        </Text>
      )}
      {closeable && !isSmallScreen && (
        <Flex
          position="absolute"
          right={-4}
          top="50%"
          transform="translateY(-50%)"
          backgroundColor={bgColor}
          borderLeft="none"
          borderBottomRightRadius="sm"
          borderTopRightRadius="sm"
          align="center"
          cursor="pointer"
          onClick={() => setIsOpen(!isOpen)}
          height={14}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Flex>
      )}

      <Flex
        flexDir={flexDirection}
        gap={3}
        overflowY="auto"
        css={
          !isOpen && {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }
        }
      >
        {items.map((item, index) => {
          const active = location.pathname === item.link;

          return (
            <Flex
              key={index}
              align="center"
              justify={!isOpen && "center"}
              gap={2}
              py={2}
              cursor="pointer"
              pl={isOpen ? pOpen : pClose}
              borderLeft="4px solid"
              borderColor={active ? "brand.500" : "transparent"}
              onClick={() => navigate(item.link)}
              direction={!isOpen && "column"}
              border={!isOpen && "none"}
            >
              <item.icon
                activeColor={
                  active
                    ? "brand.500"
                    : useColorModeValue("text-primary", "whiteAlpha.900")
                }
                smallSize={isOpen}
              />
              <Text
                color={active && "brand.500"}
                fontSize={isOpen ? 18 : 11}
                fontWeight="600"
              >
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
