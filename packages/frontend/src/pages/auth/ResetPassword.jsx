import {
  Alert,
  AlertIcon,
  Flex,
  Image,
  Link as ChakraLink,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '../../components/form/ResetPasswordForm.jsx';
import { DarkModeToggle } from '@/components/layout/DarkModeToggle.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const ResetPassword = () => {
  const { surface } = useSemanticColors();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const exp = Number(searchParams.get('exp'));
  const now = Date.now();
  const linkIsValid = code && exp && exp > now;

  const navigate = useNavigate();

  return (
    <>
      <DarkModeToggle position="absolute" inset="10px 20px auto auto" />

      <Flex minH="100dvh" align="center" justify="center">
        <Stack spacing={8} align="center">
          <Image
            cursor="pointer"
            w={{ base: 150, md: 200 }}
            src="/images/logos/logo-text.png"
            alt="Muminbook Logo"
            onClick={() => navigate('/')}
          />
          <Alert status="error" w="fit-content">
            <AlertIcon />
            Invalid Link
          </Alert>
          <Stack
            rounded="sm"
            bg={surface.elevated}
            boxShadow="md"
            p={3}
            minW={{ base: 300, sm: 400 }}
            maxW={{ base: 300, sm: 400 }}
            spacing={2}
          >
            {linkIsValid ? (
              <ResetPasswordForm code={code} />
            ) : (
              <VStack align="center" spacing={4}>
                <Text>The link is either invalid or expired.</Text>
                <ChakraLink as={Link} to="/password/forgot" replace>
                  Request a new password reset link
                </ChakraLink>
              </VStack>
            )}
          </Stack>
        </Stack>
      </Flex>
    </>
  );
};
