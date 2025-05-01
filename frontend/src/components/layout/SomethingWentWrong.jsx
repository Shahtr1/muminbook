import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  IconButton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import React from "react";

export const SomethingWentWrong = ({
  height = "100%",
  width = "100%",
  transparent = false,
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const iconColor = useColorModeValue("text.primary", "whiteAlpha.900");

  return (
    <Flex width={width} height={height} justify="center" align="center">
      <Alert
        status="error"
        w="fit-content"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        p={6}
        bg={transparent ? "transparent" : undefined}
      >
        <AlertIcon boxSize="24px" />
        <AlertTitle>
          <Text fontSize="lg" fontWeight="bold">
            Oops! Something went wrong.
          </Text>
        </AlertTitle>
        <AlertDescription mb={4}>
          <Text>Please try refreshing the page or check back later.</Text>
        </AlertDescription>

        <IconButton
          icon={<RepeatIcon />}
          aria-label="Refresh Page"
          size="sm"
          variant="outline"
          color={iconColor}
          borderColor={iconColor}
          onClick={handleRefresh}
          _hover={{
            bg: "transparent",
            color: iconColor,
            borderColor: iconColor,
          }}
          _focus={{
            bg: "transparent",
            color: iconColor,
            borderColor: iconColor,
          }}
          _active={{
            bg: "transparent",
            color: iconColor,
            borderColor: iconColor,
          }}
        />
      </Alert>
    </Flex>
  );
};
