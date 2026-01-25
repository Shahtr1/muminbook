import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useWindowNavbar } from '@/context/WindowNavbarContext.jsx';
import { useSuhuf } from '@/hooks/suhuf/useSuhuf.js';
import {
  Flex,
  Tooltip,
  useBreakpointValue,
  useColorModeValue,
  useTheme,
  useToken,
} from '@chakra-ui/react';
import { Loader } from '@/components/layout/Loader.jsx';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { SuhufLayout } from '@/components/layout/suhuf/SuhufLayout.jsx';
import { SidebarLeftSVG } from '@/components/svgs/sidebar/SidebarLeftSVG.jsx';
import { SidebarBottomSVG } from '@/components/svgs/sidebar/SidebarBottomSVG.jsx';
import { SuhufMenu } from '@/components/layout/suhuf/SuhufMenu.jsx';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';
import { SplitHorizontalSVG } from '@/components/svgs/sidebar/SplitHorizontalSVG.jsx';
import { SplitVerticalSVG } from '@/components/svgs/sidebar/SplitVerticalSVG.jsx';
import { useReadings } from '@/hooks/reading/useReadings.js';

export const Suhuf = () => {
  const { id: suhufId } = useParams();
  const queryClient = useQueryClient();
  const { setNavbarChildren } = useWindowNavbar();
  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  const iconColorKey = useColorModeValue('wn.bold.light', 'wn.bold.dark');
  const [iconActiveColor] = useToken('colors', [iconColorKey]);
  const theme = useTheme();

  const {
    data: suhuf,
    isPending: isSuhufLoading,
    isError: isSuhufError,
    isSuccess: isSuhufSuccess,
  } = useSuhuf(suhufId);
  const {
    readings,
    isPending: isReadingsLoading,
    isError: isReadingsError,
  } = useReadings();
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhufId);

  const layout = suhuf?.config?.layout || {};
  const leftTabOpen = layout.isLeftTabOpen;
  const bottomTabOpen = layout.isBottomTabOpen;
  const isSplit = layout.isSplit;

  const handleClick = useCallback(
    (op) => {
      if (!suhuf) return;

      const updatedLayout = { ...layout };

      if (op === 'split') {
        const togglingToSplit = !layout.isSplit;
        updatedLayout.isSplit = togglingToSplit;

        if (!togglingToSplit && suhuf.config?.panels?.length) {
          const updatedPanels = suhuf.config.panels.map((panel, index) => ({
            ...panel,
            active: index === 0,
          }));

          updateConfig({ layout: updatedLayout, panels: updatedPanels });
          return;
        }
      } else if (op === 'left')
        updatedLayout.isLeftTabOpen = !layout.isLeftTabOpen;
      else if (op === 'bottom')
        updatedLayout.isBottomTabOpen = !layout.isBottomTabOpen;

      updateConfig({ layout: updatedLayout });
    },
    [updateConfig, suhuf]
  );

  const navbarContent = useMemo(
    () => (
      <Flex width="100%" justify="space-between">
        <SuhufMenu suhuf={suhuf} />
        <Flex gap={1} align="center">
          <Tooltip
            label="Toggle left tab"
            placement="bottom"
            variant="inverted"
          >
            <div onClick={() => handleClick('left')}>
              <SidebarLeftSVG
                activeColor={iconActiveColor}
                active={leftTabOpen}
              />
            </div>
          </Tooltip>
          <Tooltip
            label="Toggle bottom tab"
            placement="bottom"
            variant="inverted"
          >
            <div onClick={() => handleClick('bottom')}>
              <SidebarBottomSVG
                activeColor={iconActiveColor}
                active={bottomTabOpen}
              />
            </div>
          </Tooltip>
          <Tooltip label="Toggle split" placement="bottom" variant="inverted">
            <div onClick={() => handleClick('split')}>
              {isSmallScreen ? (
                <SplitVerticalSVG
                  activeColor={iconActiveColor}
                  active={isSplit}
                />
              ) : (
                <SplitHorizontalSVG
                  activeColor={iconActiveColor}
                  active={isSplit}
                />
              )}
            </div>
          </Tooltip>
        </Flex>
      </Flex>
    ),
    [
      suhuf,
      handleClick,
      leftTabOpen,
      bottomTabOpen,
      isSplit,
      isSmallScreen,
      iconActiveColor,
    ]
  );

  queryClient.setQueryData(['windowMode'], true);

  useEffect(() => {
    queryClient.setQueryData(['windowMode'], true);
    setNavbarChildren(navbarContent);
    return () => {
      queryClient.setQueryData(['windowMode'], false);
      setNavbarChildren(null);
    };
  }, [navbarContent, queryClient, setNavbarChildren]);

  const winNavbarHeight = '30px';

  return (
    <Flex
      h={`calc(100dvh - ${theme.sizes['win-manager-height']} - ${winNavbarHeight})`}
      w="100%"
      overflow="hidden"
    >
      {(isSuhufLoading || isReadingsLoading) && <Loader />}
      {(isSuhufError || isReadingsError) && <SomethingWentWrong />}
      {isSuhufSuccess && <SuhufLayout readings={readings} />}
    </Flex>
  );
};
