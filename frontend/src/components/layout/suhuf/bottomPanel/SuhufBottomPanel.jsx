import { Flex, useColorModeValue } from "@chakra-ui/react";
import { useReadings } from "@/hooks/reading/useReadings.js";
import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { SuhufBottomPanelHeader } from "@/components/layout/suhuf/bottomPanel/SuhufBottomPanelHeader.jsx";

export const SuhufBottomPanel = () => {
  const bgColor = useColorModeValue("wn.bg.light", "wn.bg.dark");

  const { readings, isPending, isError, isSuccess } = useReadings();

  return (
    <Flex h="100%" w="100%" bg={bgColor} flexDir="column">
      {isPending && <Loader />}
      {isError && <SomethingWentWrong transparent />}
      {isSuccess && (
        <>
          <SuhufBottomPanelHeader data={readings} />
          <Flex flex={1} overflowY="auto" w="100%" direction="column">
            {Array(20)
              .fill(null)
              .map((_, i) => (
                <Flex key={i}>Line {i + 1}</Flex>
              ))}
          </Flex>
        </>
      )}
    </Flex>
  );
};
