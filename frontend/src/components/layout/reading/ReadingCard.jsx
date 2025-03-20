import { useNavigate } from "react-router-dom";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { ArabicEnglishSVG } from "@/components/svgs/ArabicEnglishSVG.jsx";
import { CardSVG } from "@/components/svgs/CardSVG.jsx";

export const ReadingCard = ({ label, cardColor, description, uuid, width }) => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");

  const absoluteStyles = {
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
  };
  return (
    <Flex
      h="200px"
      w={width}
      p={4}
      borderRadius="lg"
      shadow="md"
      cursor="pointer"
      onClick={() => navigate(`/reading/${uuid}`)}
      position="relative"
      overflow="hidden"
      flexDir="column"
      bgColor={bgColor}
    >
      <Flex></Flex>

      <Box
        border="2px solid"
        borderColor={cardColor}
        borderRadius="md"
        h="fit-content"
        position="absolute"
        bgColor={bgColor}
        zIndex="999"
      >
        <ArabicEnglishSVG dimensions="50px" activeColor={cardColor} />
      </Box>
      <CardSVG
        activeColor={cardColor}
        dimensions="250px"
        absolute={true}
        absoluteStyles={absoluteStyles}
      />
    </Flex>
  );
};
