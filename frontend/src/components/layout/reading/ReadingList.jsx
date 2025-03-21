import {
  Flex,
  Icon,
  Text,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { readingItems } from "@/data/readingItems.js";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { XBreadCrumb } from "@/components/layout/reading/XBreadCrumb.jsx";
import { XSearch } from "@/components/layout/XSearch.jsx";
import { ChevronDownIcon, ChevronUpIcon, StarIcon } from "@chakra-ui/icons";

export const ReadingList = () => {
  const theme = useTheme();
  const bgColor = useColorModeValue("bg.light", "bg.dark");
  const boxShadowColor = useColorModeValue(
    "rgba(0, 0, 0, 0.1)",
    "rgba(255, 255, 255, 0.1)",
  );
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);

  const navbarHeight = parseInt(theme.space["navbar-height"]);

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

  const gapSize = "25px";

  const itemWidth = useBreakpointValue({
    base: `100%`,
    sm: `calc(50% - ${gapSize})`,
    md: `calc(33.33% - ${gapSize})`,
    lg: `calc(25% - ${gapSize})`,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const isFolderOpen = location.pathname.includes("/reading/my-files");

  return (
    <Flex flexDirection="column" p={8} gap={3}>
      <Flex flexDirection="column" gap={2}>
        <Text fontSize="xl">Explore Islamic Knowledge & Wisdom</Text>
        <Flex flexDirection="column">
          <Text fontSize={{ base: "12px", sm: "14px" }}>
            Deepen your understanding of Islam through a vast collection of
            authentic books on Quran, Hadith, Tafsir, and Seerah. Whether you're
            exploring the teachings of Prophet Muhammad ﷺ, studying the meanings
            of the Quran, or learning about Islamic rulings, you'll find trusted
            sources to guide your journey.
          </Text>
          <Text fontSize={{ base: "12px", sm: "14px" }}>
            Select a book to start reading and enrich your knowledge today!
          </Text>
        </Flex>
      </Flex>

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
      >
        <Flex justify="space-between">
          <XBreadCrumb />
          <Icon
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

      {isFolderOpen ? (
        <Outlet />
      ) : (
        <Flex gap={gapSize} flexWrap="wrap">
          <Folder onClick={() => navigate("my-files")} width={itemWidth} />
          {readingItems().map((item) => (
            <ReadingCard key={item.id} {...item} width={itemWidth} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
