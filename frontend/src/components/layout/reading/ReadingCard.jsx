import { Link } from "react-router-dom";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { ArabicEnglishSVG } from "@/components/svgs/ArabicEnglishSVG.jsx";

export const ReadingCard = ({ label, cardColor, description, uuid, width }) => {
  return (
    <Box
      h="200px"
      w={width}
      p={4}
      bg={cardColor}
      borderRadius="lg"
      shadow="sm"
      color="white"
      _hover={{ shadow: "md" }}
      cursor="pointer"
    >
      <HStack spacing={3}>
        <ArabicEnglishSVG dimensions="40px" />
        <VStack align="start" spacing={1}>
          <Link
            to={`/reading/${uuid}`}
            style={{
              fontSize: "lg",
              fontWeight: "bold",
              textDecoration: "none",
              color: "white",
            }}
          >
            {label}
          </Link>
          <Text fontSize="sm" noOfLines={5}>
            {description}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};
