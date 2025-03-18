import { Flex, Grid, Text, useColorModeValue } from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { readingItems } from "@/data/readingItems.js";
import { ReadingCard } from "@/components/layout/reading/ReadingCard.jsx";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export const ReadingList = () => {
  const bgColor = useColorModeValue("white", "gray.800");
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
    <Flex flexDirection="column" p={8} gap={8}>
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
        justify="space-between"
        bg={bgColor}
        position="sticky"
        top="navbar-height"
        zIndex="10"
        p={4}
        boxShadow="sm"
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
