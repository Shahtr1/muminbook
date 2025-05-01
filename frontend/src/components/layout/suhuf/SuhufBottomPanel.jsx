import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { useReading } from "@/hooks/useReading.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useParams } from "react-router-dom";

export const SuhufBottomPanel = () => {
  const { id: suhufId } = useParams();
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");
  const { readings, isPending, isError, isSuccess } = useReading();

  return (
    <Box h="100%" w="100%" bg={bgColor}>
      {isPending && <Loader />}
      {isError && <SomethingWentWrong transparent />}
      {isSuccess && <Flex>...</Flex>}
    </Box>
  );
};
