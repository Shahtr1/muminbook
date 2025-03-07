import { Flex, Text, useColorModeValue, useTheme } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

export const Sidebar = ({
  items = [],
  vertical = true,
  label,
  p = 5,
  closeable = true,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Flex
      position="relative"
      flexDirection={vertical ? "column" : "row"}
      minH={`calc(100vh - ${theme.sizes["navbar-height"]})`}
      w="250px"
      marginLeft={isOpen ? 0 : "-240px"}
      transition="margin 0.3s ease-in-out"
      backgroundColor={useColorModeValue("white", "gray.800")}
      p={p}
      pl={0}
      gap={3}
    >
      {closeable && (
        <Flex
          position="absolute"
          right={-4}
          top="50%"
          transform={`translateY(-50%)`}
          backgroundColor={useColorModeValue("white", "gray.800")}
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
      {label && (
        <Text fontWeight="600" mb={4} fontSize={25} pl={p}>
          {label}
        </Text>
      )}

      {items.map((item, index) => {
        const active = location.pathname === item.link;

        return (
          <Flex
            key={index}
            align="center"
            gap={2}
            py={2}
            cursor="pointer"
            pl={p}
            borderLeft="4px solid"
            borderColor={active ? "brand.500" : "transparent"}
            onClick={() => navigate(item.link)}
          >
            <item.icon
              activeColor={
                active
                  ? "brand.500"
                  : useColorModeValue("text-primary", "whiteAlpha.900")
              }
            />
            <Text color={active && "brand.500"} fontSize={18} fontWeight="600">
              {item.label}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};
