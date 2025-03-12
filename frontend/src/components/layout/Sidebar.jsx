import {
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";

export const Sidebar = ({
  items = [],
  label,
  pOpen = 5,
  pClose = 2,
  closeable = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });
  const isMediumScreen = useBreakpointValue({ base: true, md: false });

  const [isOpen, setIsOpen] = useState(!isMediumScreen);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsOpen(!isMediumScreen);
  }, [isMediumScreen]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("text-primary", "whiteAlpha.900");

  const flexDirection = isSmallScreen ? "row" : "column";
  const height = isSmallScreen
    ? "auto"
    : `calc(100vh - ${theme.sizes["navbar-height"]})`;
  const width = isSmallScreen ? "100%" : isOpen ? "250px" : "auto";
  const padding = isSmallScreen ? 0 : isOpen ? pOpen : pClose;

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

  return (
    <Flex
      position="relative"
      flexDirection={flexDirection}
      h={height}
      w={width}
      backgroundColor={bgColor}
      p={padding}
      pl={0}
      gap={3}
    >
      {label && isOpen && !isSmallScreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: isOpen ? "block" : "none" }}
        >
          <Text fontWeight="600" mb={4} fontSize={25} pl={pOpen}>
            {label}
          </Text>
        </motion.div>
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
      >
        {items.map((item, index) => {
          const active = location.pathname === item.link;

          return (
            <Flex
              key={index}
              ref={active ? activeItemRef : null}
              align="center"
              justify={!isOpen && "center"}
              gap={2}
              py={isSmallScreen ? "10px" : 2}
              cursor="pointer"
              pl={padding}
              px={isSmallScreen && 2}
              borderLeft={!isSmallScreen && "4px solid"}
              borderBottom={isSmallScreen && "2px solid"}
              borderColor={active ? "brand.500" : "transparent"}
              onClick={() => navigate(item.link)}
              direction={!isOpen && "column"}
              border={!isOpen && !isSmallScreen && "none"}
            >
              {!isSmallScreen && (
                <item.icon
                  activeColor={active ? "brand.500" : textColor}
                  smallSize={isOpen}
                />
              )}
              <Text
                color={active && "brand.500"}
                fontSize={isSmallScreen ? 12 : isOpen ? 18 : 11}
                fontWeight={isSmallScreen ? "500" : "600"}
                whiteSpace="nowrap"
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
