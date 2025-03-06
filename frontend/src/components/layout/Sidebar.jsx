import { Flex, Text, useColorModeValue, useTheme } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ items = [], vertical = true, label, p = 5 }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Flex
      flexDirection={vertical ? "column" : "row"}
      minH={`calc(100vh - ${theme.sizes["navbar-height"]})`}
      w="25%"
      backgroundColor={useColorModeValue("white", "gray.800")}
      p={p}
      pl={0}
      borderRight="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      gap={3}
    >
      {label && (
        <Text fontWeight="bold" mb={4} fontSize={25} pl={p}>
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
            borderLeft="2px solid"
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
            <Text color={active && "brand.500"} fontSize={18} fontWeight="700">
              {item.label}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};
