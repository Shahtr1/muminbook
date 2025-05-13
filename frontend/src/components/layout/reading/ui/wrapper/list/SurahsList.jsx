import React from "react";
import { useSurahs } from "@/hooks/quran/useSurahs.js";
import { useJuz } from "@/hooks/quran/useJuz.js";
import { Flex, Text, Tooltip, useColorModeValue } from "@chakra-ui/react";
import { MdNumbers } from "react-icons/md";
import { XSearch } from "@/components/layout/xcomp/XSearch.jsx";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useParams } from "react-router-dom";
import { useSuhuf } from "@/hooks/suhuf/useSuhuf.js";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { useQueryClient } from "@tanstack/react-query";
import { getReadingBySurah } from "@/services/index.js";
import { useXToast } from "@/hooks/useXToast.js";

export const SurahsList = () => {
  const { surahs } = useSurahs();
  const { juz } = useJuz();
  const { id: suhufId } = useParams();
  const { data: suhuf } = useSuhuf(suhufId);
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);
  const queryClient = useQueryClient();
  const toast = useXToast();

  const bgContentColor = useColorModeValue(
    "wn.bg_content.light",
    "wn.bg_content.dark",
  );
  const borderColor = useColorModeValue("gray.300", "whiteAlpha.500");
  const iconColor = useColorModeValue("wn.icon.light", "wn.icon.dark");
  const iconHoverGray = useColorModeValue(
    "wn.icon.hover.light",
    "wn.icon.hover.dark",
  );

  const panels = suhuf?.config?.panels || [];
  const activePanelIndex = panels.findIndex((p) => p.active);
  const selectedSurahId = panels[activePanelIndex]?.selectedSurah?.id;

  const handleSurahClick = async (surah) => {
    try {
      const result = await getReadingBySurah("quran", surah.uuid);
      const { startingPage, data, ...rest } = result;

      queryClient.setQueryData(["reading", "quran"], (old) => {
        if (!old) {
          return {
            pages: [{ page: startingPage, data, ...rest }],
            pageParams: [startingPage],
          };
        }

        const alreadyExists = old.pages.some((p) => p.page === startingPage);
        if (alreadyExists) return old;

        return {
          ...old,
          pages: [...old.pages, { page: startingPage, data, ...rest }],
          pageParams: [...old.pageParams, startingPage],
        };
      });

      const updatedPanels = panels.map((panel, index) =>
        index === activePanelIndex
          ? {
              ...panel,
              selectedSurah: {
                id: surah.uuid,
                startingPage,
              },
            }
          : panel,
      );

      updateConfig({ panels: updatedPanels });
    } catch (err) {
      console.error("Failed to load surah:", err);
      toast.error(err);
    }
  };

  const Row = ({ index, style }) => {
    const surah = surahs[index];
    const isSelected = surah.uuid === selectedSurahId;

    return (
      <div style={style}>
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
            _hover={{ bgColor: iconHoverGray }}
            bgColor={isSelected ? iconHoverGray : undefined}
            borderRadius="sm"
            direction="column"
            p={1}
            onClick={() => handleSurahClick(surah)}
          >
            <Flex justify="space-between" align="center">
              <Text whiteSpace="nowrap" fontSize="10px">
                {surah.uuid}. {surah.transliteration}
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
                  fontSize="9px"
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {surah.meaning}
                </Text>
              </Tooltip>
              <Tooltip
                variant="inverted"
                placement="right"
                label={`Total ayats: ${surah.totalAyats}`}
              >
                <Flex align="center" color={iconColor} fontSize="9px" gap="1px">
                  <MdNumbers size={10} />
                  <Text color={iconColor}>{surah.totalAyats}</Text>
                </Flex>
              </Tooltip>
            </Flex>
          </Flex>
        </Flex>
      </div>
    );
  };

  return (
    <Flex
      direction="column"
      py="1px"
      w="100%"
      h="100%"
      overflowY="auto"
      gap={1}
      position="relative"
    >
      <Flex direction="column" gap={1}>
        <XSearch
          bgColor={bgContentColor}
          size="xs"
          expand={false}
          placeholder="Surahs"
        />
      </Flex>

      <Flex flex={1}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              width={width}
              itemCount={surahs.length}
              itemSize={50}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </Flex>
    </Flex>
  );
};
