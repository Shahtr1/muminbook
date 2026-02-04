import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link as ChakraLink,
  RadioGroup,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { DarkModeToggle } from '@/components/layout/DarkModeToggle.jsx';
import { XDate } from '@/components/form/XDate.jsx';
import { XRadio } from '@/components/form/XRadio.jsx';
import { XEyeIcon } from '@/components/form/XEyeIcon.jsx';
import { XAlert } from '@/components/layout/x/XAlert.jsx';
import { register } from '@/services/index.js';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

const Register = () => {
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const { surface } = useSemanticColors();

  const { mutate: createAccount, isPending } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/', { replace: true });
    },
    onError: ({ errors, message }) => {
      if (errors && errors.length > 0) {
        const errorMap = {};
        errors.forEach((err) => {
          errorMap[err.path] = err.message;
        });
        setErrors(errorMap);
      } else if (message) {
        setErrorMessage(message);
      }
    },
  });

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleCPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const processAndRegister = () => {
    setErrors({});
    setErrorMessage('');

    createAccount({
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
    });
  };

  const handleDateChange = (timestamp) => {
    if (timestamp) {
      setDateOfBirth(timestamp);
      removeError('dateOfBirth');
    }
  };

  const removeError = (field) => {
    if (field) {
      setErrors((error) => {
        if (!error[field]) return error;
        delete error[field];
        return error;
      });
    }
  };

  const isDisabled =
    !firstname ||
    !lastname ||
    !dateOfBirth ||
    !email ||
    !gender ||
    gender === 'custom' ||
    password.length < 6 ||
    password !== confirmPassword;

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

          <Stack
            rounded="sm"
            bg={surface.elevated}
            boxShadow="md"
            p={3}
            minW={{ base: 300, sm: 400 }}
            maxW={{ base: 300, sm: 400 }}
            spacing={2}
          >
            {errorMessage && (
              <XAlert status="error" message={errorMessage}></XAlert>
            )}
            <Flex gap={1}>
              <FormControl id="firstname" isInvalid={!!errors?.firstname}>
                <Input
                  autoFocus
                  value={firstname}
                  onChange={(e) => {
                    setFirstname(e.target.value);
                    removeError('firstname');
                  }}
                  placeholder="Firstname"
                  size={{ base: 'sm', md: 'md' }}
                />
                <FormErrorMessage>{errors?.firstname}</FormErrorMessage>
              </FormControl>
              <FormControl id="lastname" isInvalid={!!errors?.lastname}>
                <Input
                  value={lastname}
                  onChange={(e) => {
                    setLastname(e.target.value);
                    removeError('lastname');
                  }}
                  placeholder="Lastname"
                  size={{ base: 'sm', md: 'md' }}
                />
                <FormErrorMessage>{errors?.lastname}</FormErrorMessage>
              </FormControl>
            </Flex>

            <XDate
              onDateChange={handleDateChange}
              errorMessage={errors?.dateOfBirth}
              label="Date of birth"
            />

            <FormControl id="gender" isInvalid={!!errors?.gender}>
              <FormLabel fontSize={{ base: 'xs', md: 'sm' }}>Gender</FormLabel>
              <RadioGroup
                onChange={(value) => {
                  setGender(value);
                  if (value !== 'custom') removeError('gender');
                }}
                w="100%"
              >
                <HStack spacing="1" justifyContent="space-between">
                  <XRadio hasError={errors?.gender} value="male" label="Male" />
                  <XRadio
                    hasError={errors?.gender}
                    value="female"
                    label="Female"
                  />
                  <XRadio
                    hasError={errors?.gender}
                    value="custom"
                    label="Custom"
                  />
                </HStack>
              </RadioGroup>
              <FormErrorMessage>{errors?.gender}</FormErrorMessage>
            </FormControl>
            {gender === 'custom' && (
              <Box fontSize={{ base: '0.6rem', md: '0.8rem' }}>
                <Text>Allah clearly mentions two genders in the Qur’an:</Text>
                <Text fontStyle="italic" fontWeight="medium">
                  “And that He creates the two mates – the male and female.”
                </Text>
                <Text fontStyle="italic" fontWeight="medium">
                  “Do not change the creation of Allah.”
                </Text>
                <Text>(Qur’an 53:45) and (Qur’an 4:119)</Text>
              </Box>
            )}

            <FormControl id="email" isInvalid={!!errors?.email}>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  removeError('email');
                }}
                placeholder="Email address"
                size={{ base: 'sm', md: 'md' }}
              />
              <FormErrorMessage>{errors?.email}</FormErrorMessage>
            </FormControl>

            <FormControl id="password" isInvalid={!!errors?.password}>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    removeError('password');
                  }}
                  placeholder="New password"
                  size={{ base: 'sm', md: 'md' }}
                />
                {password && (
                  <InputRightElement
                    cursor="pointer"
                    onClick={togglePassword}
                    height="100%"
                  >
                    <XEyeIcon show={showPassword} />
                  </InputRightElement>
                )}
              </InputGroup>
              <FormErrorMessage>{errors?.password}</FormErrorMessage>
            </FormControl>

            <FormControl
              id="confirmPassword"
              isInvalid={!!errors?.confirmPassword}
            >
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    removeError('confirmPassword');
                  }}
                  placeholder="Confirm password"
                  size={{ base: 'sm', md: 'md' }}
                  onKeyDown={(e) => e.key === 'Enter' && processAndRegister()}
                />
                {confirmPassword && (
                  <InputRightElement
                    height="100%"
                    cursor="pointer"
                    onClick={toggleCPassword}
                  >
                    <XEyeIcon show={showConfirmPassword} />
                  </InputRightElement>
                )}
              </InputGroup>
              <FormErrorMessage>{errors?.confirmPassword}</FormErrorMessage>
            </FormControl>
            <Text fontSize="0.6rem" mx="auto">
              By clicking Sign Up, you agree to our{' '}
              <ChakraLink as={Link} to="/terms" fontWeight="semibold">
                Terms
              </ChakraLink>
              ,{' '}
              <ChakraLink as={Link} to="/privacy-policy" fontWeight="semibold">
                Privacy Policy
              </ChakraLink>
              , and{' '}
              <ChakraLink as={Link} to="/cookies" fontWeight="semibold">
                Cookies Policy
              </ChakraLink>
              .
            </Text>

            <Button
              my={2}
              isDisabled={isDisabled}
              isLoading={isPending}
              onClick={processAndRegister}
              size={{ base: 'sm', md: 'md' }}
              width={150}
              mx="auto"
            >
              Sign Up
            </Button>

            <Text align="center" fontSize="sm">
              Already have an account?{' '}
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
