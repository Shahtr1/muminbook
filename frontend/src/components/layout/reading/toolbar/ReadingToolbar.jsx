import {
  Flex,
  Icon,
  Text,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { XBreadCrumb } from "@/components/layout/reading/XBreadCrumb.jsx";
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from "@chakra-ui/icons";
import { XSearch } from "@/components/layout/XSearch.jsx";
import { useEffect, useRef, useState } from "react";
import { AddMenu } from "@/components/layout/reading/toolbar/AddMenu.jsx";

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

  const isFolderView = location.pathname.includes("/reading/my-files");

  const extractFolderSegments = () => {
    const pathNames = location.pathname.split("/").filter(Boolean);
    const myFilesIndex = pathNames.indexOf("my-files");
    if (myFilesIndex === -1) return [];

    return pathNames.slice(myFilesIndex);
  };

  const folderSegments = extractFolderSegments();

  const addNew = ({ type, name }) => {
    console.log("type", type);
    console.log("name", name);
  };

  return (
    <Flex
      ref={headerRef}
      flexDir={{ base: "column", sm: "row" }}
      justify="space-between"
      bg={bgColor}
      position="sticky"
      top="navbar-height"
      zIndex="999999"
      py={2}
      boxShadow={isSticky ? `0px 2px 2px -2px ${boxShadowColor}` : "none"}
      gap={2}
      px={8}
    >
      <Flex justify="space-between" w="100%" align="center">
        <XBreadCrumb segments={folderSegments} />
        {isFolderView && (
          <Flex w="100%" justify="end">
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

      <Flex
        justify={{ base: "space-between", sm: "end" }}
        align="center"
        gap={3}
        display={{ base: showExtras ? "flex" : "none", sm: "flex" }}
      >
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

        <XSearch bgColor={bgColor} size="xs" width={120} parentWidth="auto" />
      </Flex>
    </Flex>
  );
};
