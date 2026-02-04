import { useQueryClient } from '@tanstack/react-query';
import { useWindowNavbar } from '@/context/WindowNavbarContext.jsx';
import {
  Flex,
  Tooltip,
  useBreakpointValue,
  useTheme,
  useToken,
} from '@chakra-ui/react';
import { WorkspaceMenu } from '@/components/suhuf/workspace/WorkspaceMenu.jsx';
import { SidebarLeftSVG } from '@/components/svgs/sidebar/SidebarLeftSVG.jsx';
import { SidebarBottomSVG } from '@/components/svgs/sidebar/SidebarBottomSVG.jsx';
import { SplitVerticalSVG } from '@/components/svgs/sidebar/SplitVerticalSVG.jsx';
import { SplitHorizontalSVG } from '@/components/svgs/sidebar/SplitHorizontalSVG.jsx';
import { useEffect, useMemo } from 'react';
import { WorkspaceLayout } from '@/components/suhuf/workspace/WorkspaceLayout.jsx';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const SuhufContent = ({ readings }) => {
  const queryClient = useQueryClient();
  const { setNavbarChildren } = useWindowNavbar();
  const theme = useTheme();

  const { icon } = useSemanticColors();

  const { layout, toggleSplit, toggleLeftSidebar, toggleBottomPanel, suhuf } =
    useSuhufWorkspaceContext();

  const isSmallScreen = useBreakpointValue({ base: true, sm: false });

  const iconColorKey = icon.active;

  const [iconActiveColor] = useToken('colors', [iconColorKey]);

  const winNavbarHeight = '30px';

  const navbarContent = useMemo(
    () => (
      <Flex width="100%" justify="space-between">
        <WorkspaceMenu suhuf={suhuf} />

        <Flex gap={1} align="center">
          <Tooltip
            label="Toggle left tab"
            placement="bottom"
            variant="inverted"
          >
            <div onClick={toggleLeftSidebar}>
              <SidebarLeftSVG
                activeColor={iconActiveColor}
                active={layout.isLeftTabOpen}
              />
            </div>
          </Tooltip>

          <Tooltip
            label="Toggle bottom tab"
            placement="bottom"
            variant="inverted"
          >
            <div onClick={toggleBottomPanel}>
              <SidebarBottomSVG
                activeColor={iconActiveColor}
                active={layout.isBottomTabOpen}
              />
            </div>
          </Tooltip>

          <Tooltip label="Toggle split" placement="bottom" variant="inverted">
            <div onClick={toggleSplit}>
              {isSmallScreen ? (
                <SplitVerticalSVG
                  activeColor={iconActiveColor}
                  active={layout.isSplit}
                />
              ) : (
                <SplitHorizontalSVG
                  activeColor={iconActiveColor}
                  active={layout.isSplit}
                />
              )}
            </div>
          </Tooltip>
        </Flex>
      </Flex>
    ),
    [
      suhuf,
      layout.isLeftTabOpen,
      layout.isBottomTabOpen,
      layout.isSplit,
      isSmallScreen,
      iconActiveColor,
    ]
  );

  useEffect(() => {
    queryClient.setQueryData(['windowMode'], true);

    return () => {
      queryClient.setQueryData(['windowMode'], false);
    };
  }, [queryClient]);

  useEffect(() => {
    setNavbarChildren(navbarContent);

    return () => {
      setNavbarChildren(null);
    };
  }, [navbarContent, setNavbarChildren]);

  return (
    <Flex
      h={`calc(100dvh - ${theme.sizes['win-manager-height']} - ${winNavbarHeight})`}
      w="100%"
      overflow="hidden"
    >
      <WorkspaceLayout readings={readings} />
    </Flex>
  );
};
