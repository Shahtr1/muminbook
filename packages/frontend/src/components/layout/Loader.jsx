import { Flex, Image, Spinner } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

export const Loader = ({ height = '100%', width = '100%', ...rest }) => {
  const location = useLocation();
  const isSuhuf = location.pathname.startsWith('/suhuf');
  let logoImg = 'logo-image.png';
  if (isSuhuf) {
    logoImg = 'suhuf-logo.png';
  }
  return (
    <Flex
      w={width}
      h={height}
      justify="center"
      align="center"
      position="relative"
      {...rest}
    >
      <Spinner
        size="xl"
        w="50px"
        h="50px"
        thickness="1px"
        speed="0.6s"
        color="brand.500"
      />

      <Image
        src={`/images/logos/${logoImg}`}
        alt="Logo"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        boxSize="30px"
        w="30px"
        h="30px"
      />
    </Flex>
  );
};
