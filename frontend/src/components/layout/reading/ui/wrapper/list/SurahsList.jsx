import { Loader } from "@/components/layout/Loader.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import React from "react";
import { useSurahs } from "@/hooks/surah/useSurahs.js";
import { Flex, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { XSearch } from "@/components/layout/xcomp/XSearch.jsx";
import { MdNumbers } from "react-icons/md";

export const SurahsList = () => {
  const { surahs, isPending, isError, isSuccess } = useSurahs();
  const bgContentColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");

  return (
    <>
      {isPending && <Loader />}

      {isError && <SomethingWentWrong transparent />}

      {isSuccess && (
        <Flex direction="column" py="1px" w="100%" overflowY="auto" gap={1}>
          <XSearch
            bgColor={bgContentColor}
            size="xs"
            width="100%"
            parentWidth="auto"
            expand={false}
            placeholder="Surahs"
          />
          <Flex
            overflowY="auto"
            direction="column"
            css={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {surahs.map((surah) => (
              <Flex
                key={surah._id}
                w="100%"
                borderBottom="1px solid"
                borderColor={borderColor}
                py={1}
              >
                <Flex
                  cursor="pointer"
                  w="100%"
                  _hover={{ bgColor: bgContentColor }}
                  borderRadius="sm"
                  direction="column"
                  p={1}
                >
                  <Flex justify="space-between" align="center">
                    <Text whiteSpace="nowrap" fontSize="11px">
                      {surah.transliteration}
                    </Text>
                    <Text color={iconColor} fontSize="9px">
                      {surah.revelationPlace === "mecca" ? "Meccan" : "Medinan"}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Tooltip
                      variant="inverted"
                      placement="right"
                      label={surah.meaning}
                    >
                      <Text
                        color={iconColor}
                        fontSize="10px"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {surah.meaning}
                      </Text>
                    </Tooltip>
                    <Flex
                      align="center"
                      color={iconColor}
                      fontSize="9px"
                      gap="1px"
                    >
                      <MdNumbers size={10} />
                      <Text color={iconColor}>{surah.totalAyats}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      )}
    </>
  );
};
