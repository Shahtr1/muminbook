import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Flex,
  FormControl,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link as ChakraLink,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { register } from "../lib/services/api.js";
import { DarkModeToggle } from "@/components/DarkModeToggle.jsx";
import { GoEye, GoEyeClosed } from "react-icons/go";

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    mutate: createAccount,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate("/", {
        replace: true,
      });
    },
  });

  const togglePassword = () => setShowPassword(!showPassword);

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
            rounded="md"
            bg={useColorModeValue("white", "gray.800")}
            boxShadow="md"
            p={3}
            minW={400}
            maxW={400}
            spacing={2}
          >
            {/*{isError && (*/}
            {/*  <Box mb={3} color="red.400">*/}
            {/*    {error?.message || "An error occurred"}*/}
            {/*  </Box>*/}
            {/*)}*/}

            <FormControl id="email">
              <Input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                size={{ base: "sm", md: "md" }}
              />
            </FormControl>
            <FormControl id="password">
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  size={{ base: "sm", md: "md" }}
                />
                {password && (
                  <InputRightElement cursor="pointer" onClick={togglePassword}>
                    {showPassword ? (
                      <GoEyeClosed color="#444648" />
                    ) : (
                      <GoEye color="#444648" />
                    )}
                  </InputRightElement>
                )}
              </InputGroup>
            </FormControl>
            <Button
              my={2}
              isDisabled={!email || password.length < 6}
              isLoading={isPending}
              onClick={() => createAccount({ email, password })}
              size={{ base: "sm", md: "md" }}
            >
              Create Account
            </Button>
            <Text align="center" fontSize="sm" color="text.muted">
              Already have an account?{" "}
              <ChakraLink as={Link} to="/login">
                Sign in
              </ChakraLink>
            </Text>
          </Stack>
        </Stack>
      </Flex>
    </>
  );
};

export default Register;
