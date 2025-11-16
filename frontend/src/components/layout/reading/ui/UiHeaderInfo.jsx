import { Flex, Spinner, Text, useColorModeValue } from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const UiHeaderInfo = () => {
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");
  const textColor = useColorModeValue("#000", "whiteAlpha.900");
  const queryClient = useQueryClient();

  const { data: currentSurahId } = useQuery({
    queryKey: ["currentSurahId"],
    staleTime: Infinity,
  });

  const { data: currentJuzId } = useQuery({
    queryKey: ["currentJuzId"],
    staleTime: Infinity,
  });

  const surahs = queryClient.getQueryData(["surahs"]) || [];
  const juzList = queryClient.getQueryData(["juzList"]) || [];

  const currentSurah = surahs.find((s) => s._id === currentSurahId);
  const currentJuz = juzList.find((j) => j._id === currentJuzId);

  const isPending = !currentSurah || !currentJuz;

  return (
    <Flex
      w="100%"
      borderBottom="1px solid"
      borderColor={borderColor}
      h="25px"
      fontFamily="Nunito Sans, sans-serif"
      mb={1}
      align="center"
      justify="center"
    >
      {isPending ? (
        <Spinner size="sm" color={textColor} />
      ) : (
        <Flex
          w="100%"
          align="center"
          justify="space-between"
          fontSize="12px"
          fontWeight="medium"
        >
          <Text>
            Surah {currentSurah.uuid}. {currentSurah.transliteration}
          </Text>
          <Text>
            Juz {currentJuz.uuid}. {currentJuz.transliteration}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
