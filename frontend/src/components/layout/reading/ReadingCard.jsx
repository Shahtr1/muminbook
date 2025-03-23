import { useEffect, useState } from "react";
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
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || isSmallScreen === null) return null;

  const absoluteStyles = {
    top: "-15px",
    left: "50%",
    transform: "translateX(-50%)",
  };

  return (
    <Flex
      h={isSmallScreen ? "90px" : "200px"}
      w={width}
      borderRadius="lg"
      shadow="md"
      cursor="pointer"
      onClick={() => navigate(`/reading/${uuid}`)}
      position="relative"
      overflow="hidden"
      flexDir={isSmallScreen ? "row-reverse" : "column"}
      bgColor={bgColor}
      justify={isSmallScreen ? "normal" : "end"}
      align={isSmallScreen ? "center" : "normal"}
      px={isSmallScreen ? "10px" : 0}
    >
      <Flex
        w="100%"
        h={isSmallScreen ? "100%" : "50%"}
        bgColor={bgColor}
        borderTop={isSmallScreen ? "none" : "3px solid"}
        borderColor={cardColor}
        opacity={isSmallScreen ? 0.8 : 0.9}
        zIndex={999}
        flexDir="column"
        px={2}
        py={isSmallScreen ? "5px" : 0}
      >
        <Text
          whiteSpace="nowrap"
          textAlign={isSmallScreen ? "start" : "center"}
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

      <Flex
        bgColor={bgColor}
        height="full"
        align="center"
        w="auto"
        zIndex="99999"
        display={isSmallScreen ? "flex" : "contents"}
      >
        <Box
          border="2px solid"
          borderBottom="3px solid"
          borderColor={cardColor}
          borderRadius="md"
          h="fit-content"
          position={isSmallScreen ? "relative" : "absolute"}
          bgColor={bgColor}
          zIndex="999"
          top={isSmallScreen ? "unset" : "52px"}
          left={isSmallScreen ? "unset" : "10px"}
        >
          <ArabicEnglishSVG
            dimensions={isSmallScreen ? "55px" : "50px"}
            activeColor={cardColor}
          />
        </Box>
      </Flex>

      <CardSVG
        activeColor={cardColor}
        dimensions="250px"
        absolute={true}
        absoluteStyles={absoluteStyles}
      />
    </Flex>
  );
};
