import {
  Button,
  Divider,
  Flex,
  FormControl,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link as ChakraLink,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/services/api.js";
import { GoEye, GoEyeClosed } from "react-icons/go";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const redirectUrl = location.state?.redirectUrl || "/";

  const {
    mutate: signIn,
    isPending,
    isError,
  } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate(redirectUrl, {
        replace: true,
      });
    },
  });

  const togglePassword = () => setShow(!show);

  return (
    <Flex
      minH="100vh"
      maxW="1000"
      align="center"
      justify={{ base: "center", md: "space-between" }}
      flexDir={{ base: "column", md: "row" }}
      mx="auto"
      px={20}
      gap={{ base: 2, sm: 5, md: 20, lg: 40 }}
    >
      <Stack spacing={2} alignItems={{ base: "center", md: "unset" }}>
        <Image
          w={{ base: 150, md: 200 }}
          src="/images/logo-with-image.png"
          alt="Muminbook Logo"
        />
        <Text
          fontSize={{ base: "xs", sm: "sm", md: "lg" }}
          maxW={400}
          textAlign={{ base: "center", md: "unset" }}
        >
          Muminbook helps you connect, learn and grow in faith.
        </Text>
      </Stack>
      <Stack
        rounded="md"
        bg="white"
        boxShadow="md"
        p={3}
        minW={280}
        maxW={280}
        spacing={3}
      >
        <Stack spacing={2}>
          <FormControl id="email">
            <Input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </FormControl>
          <FormControl id="password">
            <InputGroup>
              <Input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && signIn({ email, password })
                }
                placeholder="Password"
              />
              {password && (
                <InputRightElement cursor="pointer" onClick={togglePassword}>
                  {show ? (
                    <GoEyeClosed color="#444648" />
                  ) : (
                    <GoEye color="#444648" />
                  )}
                </InputRightElement>
              )}
            </InputGroup>
          </FormControl>
          {isError && (
            <Text color="red.400" textAlign="center" fontSize="xs">
              Invalid email or password
            </Text>
          )}
          <Button
            isDisabled={!email || password.length < 6}
            isLoading={isPending}
            onClick={() =>
              signIn({
                email,
                password,
              })
            }
          >
            Sign in
          </Button>
        </Stack>

        <ChakraLink
          as={Link}
          to="/password/forgot"
          fontSize="xs"
          textAlign="center"
        >
          Forgot password?
        </ChakraLink>
        <Divider />
        <Button
          onClick={() => navigate("/register")}
          variant="secondary"
          w="fit-content"
          mx="auto"
        >
          Create new account
        </Button>
      </Stack>
    </Flex>
  );
};

export default Login;
