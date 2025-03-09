import {
  Alert,
  AlertIcon,
  Flex,
  Image,
  Link as ChakraLink,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { verifyEmail } from "@/lib/services/api.js";
import { useQuery } from "@tanstack/react-query";
import { DarkModeToggle } from "@/components/layout/DarkModeToggle.jsx";

const VerifyEmail = () => {
  const { code } = useParams();
  const { isPending, isSuccess, isError } = useQuery({
    queryKey: ["emailVerification", code],
    queryFn: () => verifyEmail(code),
  });
  const navigate = useNavigate();
  return (
    <>
      <DarkModeToggle position="absolute" inset="10px 20px auto auto" />
      <Flex minH="100vh" align="center" justify="center">
        <Stack spacing={8} align="center">
          <Image
            cursor="pointer"
            w={{ base: 150, md: 200 }}
            src="/images/logos/logo-text.png"
            alt="Muminbook Logo"
            onClick={() => navigate("/")}
          />
          <Alert status={isSuccess ? "success" : "error"} w="fit-content">
            <AlertIcon />
            {isSuccess ? "Email Verified!" : "Invalid link"}
          </Alert>
          <Stack
            rounded="sm"
            bg={useColorModeValue("white", "gray.800")}
            boxShadow="md"
            p={3}
            minW={{ base: 300, sm: 400 }}
            maxW={{ base: 300, sm: 400 }}
            spacing={2}
          >
            {isPending ? (
              <Spinner />
            ) : (
              <VStack align="center" spacing={4}>
                {isError && (
                  <Text>
                    The link is either invalid or expired.{" "}
                    <ChakraLink as={Link} to="/email/reverify" replace>
                      Get a new link
                    </ChakraLink>
                  </Text>
                )}
                <ChakraLink as={Link} to="/" replace>
                  Back to home
                </ChakraLink>
              </VStack>
            )}
          </Stack>
        </Stack>
      </Flex>
    </>
  );
};

export default VerifyEmail;
