import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  Text,
} from "@chakra-ui/react";
import React from "react";

export const SomethingWentWrong = ({ height = "100%" }) => {
  return (
    <Flex width="100%" height={height} justify="center" align="center">
      <Alert
        status="error"
        w="fit-content"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        p={4}
        borderRadius="md"
        boxShadow="md"
      >
        <AlertIcon boxSize="24px" />
        <AlertTitle>
          <Text>Oops! Something went wrong.</Text>
        </AlertTitle>
        <AlertDescription>
          <Text>Please try refreshing the page or check back later.</Text>
        </AlertDescription>
      </Alert>
    </Flex>
  );
};
