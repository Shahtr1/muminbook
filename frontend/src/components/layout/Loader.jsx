import { Flex, Image, Spinner } from "@chakra-ui/react";

export const Loader = ({ height = "100%", width = "100%" }) => {
  return (
    <Flex
      w={width}
      h={height}
      justify="center"
      align="center"
      position="relative"
    >
      <Spinner
        size="xl"
        w="65px"
        h="65px"
        thickness="1px"
        speed="0.6s"
        color="brand.500"
      />

      <Image
        src="/images/logos/logo-image.png"
        alt="Logo"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        boxSize="40px"
      />
    </Flex>
  );
};
