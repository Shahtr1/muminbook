import {
  Flex,
  Grid,
  Text,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { readingItems } from "@/data/readingItems.js";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

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

  const templateColumns = {
    base: "repeat(1, 1fr)",
    sm: "repeat(2, 1fr)",
    md: "repeat(3, 1fr)",
    lg: "repeat(4, 1fr)",
  };

  const navigate = useNavigate();
  const location = useLocation();

  const isFolderOpen = location.pathname.includes("/reading/my-files");

  return (
    <Flex flexDirection="column" p={8} gap={3}>
      <Flex flexDirection="column" gap={2}>
        <Text fontSize="xl">Explore Islamic Knowledge & Wisdom</Text>
        <Flex flexDirection="column">
          <Text fontSize="sm">
            Deepen your understanding of Islam through a vast collection of
            authentic books on Quran, Hadith, Tafsir, and Seerah. Whether you're
            exploring the teachings of Prophet Muhammad ﷺ, studying the meanings
            of the Quran, or learning about Islamic rulings, you'll find trusted
            sources to guide your journey.
          </Text>
          <Text fontSize="sm">
            Select a book to start reading and enrich your knowledge today!
          </Text>
        </Flex>
      </Flex>

      <Flex
        ref={headerRef}
        justify="space-between"
        bg={bgColor}
        position="sticky"
        top="navbar-height"
        zIndex="10"
        p={4}
        boxShadow={isSticky ? `0px 2px 2px -2px ${boxShadowColor}` : "none"}
      >
        <Flex>Hi</Flex>
        <Flex>Bi</Flex>
      </Flex>

      {isFolderOpen ? (
        <Outlet />
      ) : (
        <Flex flexDirection="column" gap={2}>
          <Grid templateColumns={templateColumns} gap={5}>
            <Folder onClick={() => navigate("my-files")} />
            {readingItems().map((item) => (
              <ReadingCard key={item.id} {...item} />
            ))}
          </Grid>
        </Flex>
      )}
    </Flex>
  );
};
