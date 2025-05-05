import { Flex, useColorModeValue } from "@chakra-ui/react";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { useReading } from "@/hooks/reading/useReadings.js";
import { Loader } from "@/components/layout/Loader.jsx";

export const ReadingPanel = ({ id }) => {
  const bgColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  if (!id) {
    console.error("No FileID present in reading panel.");
    return <SomethingWentWrong />;
  }

  const { reading, isPending, isError, isSuccess } = useReading(id);

  return (
    <Flex height="100%" overflowY="auto" bgColor={bgColor} flexDir="column">
      {isPending && <Loader />}
      {isError && <SomethingWentWrong />}
      {isSuccess && <Flex>Reading Panel</Flex>}
    </Flex>
  );
};
