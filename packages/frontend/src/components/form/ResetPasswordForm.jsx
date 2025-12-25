import { useState } from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  Input,
  InputGroup,
  InputRightElement,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { XEyeIcon } from '@/components/form/XEyeIcon.jsx';
import { XAlert } from '@/components/layout/xcomp/XAlert.jsx';
import { resetPassword } from '@/services/index.js';

export const ResetPasswordForm = ({ code }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    mutate: resetUserPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationFn: resetPassword,
  });

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <>
      {isError && (
        <XAlert
          status="error"
          message={error?.message || 'An error occurred'}
        ></XAlert>
      )}
      {isSuccess ? (
        <Flex w="100%" align="center" flexDirection="column">
          <Alert status="success" mb={3}>
            <AlertIcon />
            Password updated successfully!
          </Alert>
          <ChakraLink as={Link} to="/login" replace>
            Sign in
          </ChakraLink>
        </Flex>
      ) : (
        <>
          <FormControl id="password">
            <InputGroup>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  resetUserPassword({ password, verificationCode: code })
                }
                autoFocus
                placeholder="New Password"
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
            my={2}
            isLoading={isPending}
            isDisabled={password.length < 6}
            onClick={() =>
              resetUserPassword({ password, verificationCode: code })
            }
            size={{ base: 'sm', md: 'md' }}
          >
            Reset Password
          </Button>
        </>
      )}
    </>
  );
};
