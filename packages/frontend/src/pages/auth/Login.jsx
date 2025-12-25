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
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { DarkModeToggle } from '@/components/layout/DarkModeToggle.jsx';
import { XEyeIcon } from '@/components/form/XEyeIcon.jsx';
import { XAlert } from '@/components/layout/xcomp/XAlert.jsx';
import { XDivider } from '@/components/layout/xcomp/XDivider.jsx';
import { login } from '@/services/index.js';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = location.state?.redirectUrl || '/';

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

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <>
      <DarkModeToggle position="absolute" inset="10px 20px auto auto" />
      <Flex
        minH="100dvh"
        maxW="x-max-width"
        align="center"
        justify={{ base: 'center', md: 'space-between' }}
        flexDir={{ base: 'column', md: 'row' }}
        mx="auto"
        px={20}
        gap={{ base: 2, sm: 5, md: 20, lg: 40 }}
      >
        <Stack spacing={2} alignItems={{ base: 'center', md: 'unset' }}>
          <Image
            w={{ base: 150, md: 200 }}
            src="/images/logos/logo-with-image.png"
            alt="Muminbook Logo"
            onClick={() => navigate('/')}
            cursor="pointer"
          />
          <Text
            fontSize={{ base: 'xs', sm: 'sm', md: 'lg' }}
            maxW={400}
            textAlign={{ base: 'center', md: 'unset' }}
          >
            Muminbook helps you connect, learn and grow in faith.
          </Text>
        </Stack>
        <Stack
          rounded="sm"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="md"
          p={3}
          minW={280}
          maxW={280}
          spacing={3}
        >
          <Stack spacing={2}>
            {isError && (
              <XAlert
                status="error"
                message="Invalid email or password"
              ></XAlert>
            )}
            <FormControl id="email">
              <Input
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                size={{ base: 'sm', md: 'md' }}
              />
            </FormControl>
            <FormControl id="password">
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && signIn({ email, password })
                  }
                  placeholder="Password"
                  size={{ base: 'sm', md: 'md' }}
                />
                {password && (
                  <InputRightElement
                    height="100%"
                    cursor="pointer"
                    onClick={togglePassword}
                  >
                    <XEyeIcon show={showPassword} />
                  </InputRightElement>
                )}
              </InputGroup>
            </FormControl>

            <Button
              isDisabled={!email || password.length < 6}
              isLoading={isPending}
              size={{ base: 'sm', md: 'md' }}
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
          <XDivider />
          <Button
            onClick={() => navigate('/register')}
            variant="secondary"
            w="fit-content"
            mx="auto"
            size={{ base: 'sm', md: 'md' }}
          >
            Create new account
          </Button>
        </Stack>
      </Flex>
    </>
  );
};

export default Login;
