import {
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { XBreadCrumb } from "@/components/layout/reading/XBreadCrumb.jsx";
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from "@chakra-ui/icons";
import { XSearch } from "@/components/layout/xcomp/XSearch.jsx";
import { useEffect, useRef, useState } from "react";
import { AddMenu } from "@/components/layout/reading/toolbar/AddMenu.jsx";
import { useCreateResource } from "@/hooks/resource/useCreateResource.js";

export const ReadingToolbar = () => {
  const bgColor = useColorModeValue("bg.light", "bg.dark");
  const boxShadowColor = useColorModeValue(
    "rgba(0, 0, 0, 0.1)",
    "rgba(255, 255, 255, 0.1)",
  );
  const theme = useTheme();
  const headerRef = useRef(null);

  const navbarHeight = parseInt(theme.space["navbar-height"]);

  const [isSticky, setIsSticky] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const offset = headerRef.current.getBoundingClientRect().top;
        setIsSticky(offset <= +navbarHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isMyFilesView = location.pathname.includes("/reading/my-files");
  const isTrashView = location.pathname.includes("/reading/trash");

  const { mutate: createResource } = useCreateResource();

  const addNew = ({ type, name }) => {
    let path = location.pathname;

    if (path.startsWith("/reading")) {
      path = path.replace("/reading/", "");
    }

    if (type === "file") name += ".txt";

    createResource({ name, type, path });
  };

  return (
    <Flex
      ref={headerRef}
      flexDir={{ base: "column", sm: "row" }}
      justify="space-between"
      bg={bgColor}
      position="sticky"
      top="0"
      zIndex="1099"
      py={2}
      boxShadow={isSticky ? `0px 2px 2px -2px ${boxShadowColor}` : "none"}
      gap={2}
      px={{ base: 2, sm: 8 }}
    >
      {/*nav div*/}
      <Flex justify="space-between" flex="1" align="center" overflowX="auto">
        <Box flex="1" overflowX="auto">
          <XBreadCrumb />
        </Box>
        <Flex w="auto">
          {isMyFilesView && (
            <Flex justify="end">
              <AddMenu onCreate={addNew} />
            </Flex>
          )}
          <Icon
            ml={2}
            as={showExtras ? ChevronUpIcon : ChevronDownIcon}
            display={{ base: "flex", sm: "none" }}
            fontSize="18px"
            cursor="pointer"
            onClick={() => setShowExtras(!showExtras)}
            color="brand.500"
          />
        </Flex>
      </Flex>

      {/*tools div*/}
      <Flex
        justify="end"
        align="center"
        gap={3}
        display={{ base: showExtras ? "flex" : "none", sm: "flex" }}
        w="auto"
      >
        {!isMyFilesView && !isTrashView && (
          <Flex
            align="center"
            gap={1}
            border="1px solid"
            borderColor="brand.500"
            borderRadius="25px"
            height="19px"
            px={2}
            cursor="pointer"
          >
            <StarIcon color="brand.500" fontSize="9px" />
            <Text color="brand.500" fontSize="11px">
              Favourites
            </Text>
          </Flex>
        )}

        <XSearch
          bgColor={bgColor}
          size="xs"
          width={120}
          parentWidth="auto"
          expand={false}
        />
      </Flex>
    </Flex>
  );
};
