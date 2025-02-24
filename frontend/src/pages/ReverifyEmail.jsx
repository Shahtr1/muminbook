import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Image,
  Input,
  Link as ChakraLink,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { reverifyEmail } from "../lib/services/api.js";
import { DarkModeToggle } from "@/components/DarkModeToggle.jsx";

const ReverifyEmail = () => {
  const [email, setEmail] = useState("");
  const {
    mutate: sendEmailReverify,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: reverifyEmail,
  });

  return (
    <>
      <DarkModeToggle position="absolute" inset="10px 20px auto auto" />
      <Flex minH="100vh" align="center" justify="center">
        <Stack spacing={8} align="center">
          <Image
            w={{ base: 150, md: 200 }}
            src="/images/logo-text.png"
            alt="Muminbook Logo"
          />
          <Stack
            rounded="sm"
            bg={useColorModeValue("white", "gray.800")}
            boxShadow="md"
            p={3}
            minW={{ base: 300, sm: 400 }}
            maxW={{ base: 300, sm: 400 }}
            spacing={2}
          >
            {isSuccess || isError ? (
              <Alert status="success">
                <AlertIcon />
                If this email exists, please check your inbox for further
                instructions.
              </Alert>
            ) : (
              <>
                <FormControl id="email">
                  <Input
                    autoFocus
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address to reverify"
                    size={{ base: "sm", md: "md" }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && sendEmailReverify(email)
                    }
                  />
                </FormControl>

                <Button
                  my={2}
                  size={{ base: "sm", md: "md" }}
                  isLoading={isPending}
                  isDisabled={!email}
                  onClick={() => sendEmailReverify(email)}
                >
                  Reverify Email
                </Button>
              </>
            )}

            <Text align="center" fontSize="sm">
              Go back to{" "}
              <ChakraLink as={Link} to="/login" replace>
                Sign in
              </ChakraLink>
              &nbsp;or&nbsp;
              <ChakraLink as={Link} to="/register" replace>
                Sign up
              </ChakraLink>
            </Text>
          </Stack>
        </Stack>
      </Flex>
    </>
  );
};

export default ReverifyEmail;
