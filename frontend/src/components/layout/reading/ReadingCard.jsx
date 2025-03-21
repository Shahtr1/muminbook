import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArabicEnglishSVG } from "@/components/svgs/ArabicEnglishSVG.jsx";
import { CardSVG } from "@/components/svgs/CardSVG.jsx";

export const ReadingCard = ({ label, cardColor, description, uuid, width }) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  const absoluteStyles = {
    top: "-15px",
    left: "50%",
    transform: "translateX(-50%)",
  };
  return (
    <Flex
      h="200px"
      w={width}
      borderRadius="lg"
      shadow="md"
      cursor="pointer"
      onClick={() => navigate(`/reading/${uuid}`)}
      position="relative"
      overflow="hidden"
      flexDir="column"
      bgColor={bgColor}
      justify="end"
    >
      <Flex
        w="100%"
        h="50%"
        bgColor={bgColor}
        borderTop="3px solid"
        borderColor={cardColor}
        opacity={0.9}
        zIndex={999}
        flexDir="column"
        px={2}
      >
        <Text
          whiteSpace="nowrap"
          textAlign="end"
          fontSize="15px"
          fontWeight="bold"
          color={cardColor}
        >
          {label}
        </Text>
        <Text fontSize="12px" overflowY="auto">
          {description}
        </Text>
      </Flex>

      <Box
        border="2px solid"
        borderColor={cardColor}
        borderRadius="md"
        h="fit-content"
        position="absolute"
        bgColor={bgColor}
        zIndex="999"
        top="55px"
        left="10px"
      >
        <ArabicEnglishSVG dimensions="50px" activeColor={cardColor} />
      </Box>
      {!isSmallScreen && (
        <CardSVG
          activeColor={cardColor}
          dimensions="250px"
          absolute={true}
          absoluteStyles={absoluteStyles}
        />
      )}
    </Flex>
  );
};
