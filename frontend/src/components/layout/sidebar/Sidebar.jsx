import {
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { SidebarItem } from "@/components/layout/sidebar/SidebarItem.jsx";
import { useQuery } from "@tanstack/react-query";

export const Sidebar = ({ items = [], label, closeable = true }) => {
  const location = useLocation();
  const theme = useTheme();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const isMediumScreen = useBreakpointValue({ base: true, md: false });

  const [isOpen, setIsOpen] = useState(!isMediumScreen);
  const [isReady, setIsReady] = useState(false);

  const { data: windows = [] } = useQuery({
    queryKey: ["windows"],
  });

  useEffect(() => {
    setIsOpen(!isMediumScreen);
  }, [isMediumScreen]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const bgColor = useColorModeValue("white", "gray.800");

  const flexDirection = isSmallScreen ? "row" : "column";
  const height = isSmallScreen
    ? "auto"
    : `calc(100dvh - ${theme.sizes["navbar-height"]} - ${windows.length > 0 ? theme.sizes["win-manager-height"] : "0px"})`;
  const width = isSmallScreen ? "100%" : isOpen ? "250px" : "auto";

  const activeItemRef = useRef(null);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [location.pathname]);

  if (!isReady) {
    return null;
  }

  const toggle = () => {
    return (
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
    );
  };

  return (
    <Flex
      position="relative"
      flexDirection={flexDirection}
      h={height}
      w={width}
      backgroundColor={bgColor}
    >
      {label && isOpen && !isSmallScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: isOpen ? "block" : "none" }}
        >
          <Text fontWeight="600" fontSize={25} p="20px">
            {label}
          </Text>
        </motion.div>
      )}
      {closeable && !isSmallScreen && toggle()}

      <Flex
        flexDir={flexDirection}
        gap={isSmallScreen ? 5 : 3}
        overflowY="auto"
        css={
          (!isOpen || isSmallScreen) && {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }
        }
        marginTop={isSmallScreen ? 0 : 2}
      >
        {items.map((item, index) => {
          const active = location.pathname.includes(item.link);
          return (
            <SidebarItem
              key={index}
              ref={active ? activeItemRef : null}
              item={item}
              isOpen={isOpen}
              active={active}
            ></SidebarItem>
          );
        })}
      </Flex>
    </Flex>
  );
};
