import { Link } from "react-router-dom";
import * as Icons from "react-icons/go";
import { Box, HStack, Icon, Text, VStack } from "@chakra-ui/react";

export const ReadingCard = ({ label, cardColor, description, icon, uuid }) => {
  const IconComponent = Icons[icon] || Icons.GoBook;

  return (
    <Box
      height="200px"
      p={4}
      bg={cardColor}
      borderRadius="lg"
      shadow="sm"
      color="white"
      _hover={{ shadow: "md" }}
      cursor="pointer"
    >
      <HStack spacing={3}>
        <Icon as={IconComponent} boxSize={6} />
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
