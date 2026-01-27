import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
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
} from '@chakra-ui/react';
import { DarkModeToggle } from '@/components/layout/DarkModeToggle.jsx';
import { XAlert } from '@/components/layout/x/XAlert.jsx';
import { sendPasswordResetEmail } from '@/services/index.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [unknownError, setUnknownError] = useState(false);
  const {
    mutate: sendPasswordReset,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: sendPasswordResetEmail,
    onError: ({ errors }) => {
      let hasError = false;
      if (errors && errors.length > 0) {
        errors.forEach((err) => {
          if (err?.message?.includes('email')) {
            hasError = true;
            setErrorMessage(err.message);
          }
        });
      }
      setUnknownError(!hasError);
    },
  });

  const processAndSend = (email) => {
    setErrorMessage('');
    sendPasswordReset(email);
  };

  const navigate = useNavigate();

  return (
    <>
      <DarkModeToggle position="absolute" inset="10px 20px auto auto" />
      <Flex minH="100dvh" align="center" justify="center">
        <Stack spacing={8} align="center">
          <Image
            w={{ base: 150, md: 200 }}
            src="/images/logos/logo-text.png"
            alt="Muminbook Logo"
            onClick={() => navigate('/')}
            cursor="pointer"
          />
          <Stack
            rounded="sm"
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow="md"
            p={3}
            minW={{ base: 300, sm: 400 }}
            maxW={{ base: 300, sm: 400 }}
            spacing={2}
          >
            {unknownError && (
              <XAlert status="error" message="Something went wrong!"></XAlert>
            )}
            {isSuccess ? (
              <Alert status="success" borderRadius="sm">
                <AlertIcon />
                Email sent! Check your inbox for further instructions.
              </Alert>
            ) : (
              <>
                <FormControl id="email" isInvalid={!!errorMessage}>
                  <Input
                    autoFocus
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Email address"
                    size={{ base: 'sm', md: 'md' }}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && processAndSend(email)
                    }
                  />
                  <FormErrorMessage>{errorMessage}</FormErrorMessage>
                </FormControl>

                <Button
                  my={2}
                  size={{ base: 'sm', md: 'md' }}
                  isLoading={isPending}
                  isDisabled={!email}
                  onClick={() => processAndSend(email)}
                >
                  Reset password
                </Button>
              </>
            )}

            <Text align="center" fontSize="sm">
              Go back to{' '}
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

export default ForgotPassword;
