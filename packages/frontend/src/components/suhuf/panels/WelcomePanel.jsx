import { Box, Flex, Text, useBreakpointValue } from '@chakra-ui/react';
import { SuhufSVG } from '@/components/svgs/SuhufSVG.jsx';
import { sidebarMenuData } from '@/data/sidebarMenuData.js';
import { useSuhufWorkspaceContext } from '@/context/SuhufWorkspaceContext.jsx';
import { useSemanticColors } from '@/theme/hooks/useSemanticColors.js';

export const WelcomePanel = () => {
  const { icon, surface } = useSemanticColors();
  const { layout, updateLayout } = useSuhufWorkspaceContext();

  const secondaryColor = surface.gutter;
  const suhufLogoSize = useBreakpointValue({ base: '90px', sm: '130px' });
  const primaryColor = icon.default;
  const bgColor = surface.content;

  const activeTab = layout.leftTab;
  const isOpen = layout.isLeftTabOpen;

  const toggleTab = (tabKey) => {
    const isSame = activeTab === tabKey;
    updateLayout({ leftTab: tabKey, isLeftTabOpen: isSame ? !isOpen : true });
  };

  return (
    <Flex height="100%" overflowY="auto" bgColor={bgColor} flexDir="column">
      <Box
        flex="1"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDir="column"
        px={4}
        py={6}
      >
        <SuhufSVG dimensions={suhufLogoSize} activeColor={secondaryColor} />
        <Text
          fontSize={{ base: '17px', sm: '22px' }}
          fontWeight="semibold"
          color={secondaryColor}
          overflow="hidden"
          mb={2}
          align="center"
        >
          Welcome to Suhuf
        </Text>

        <Flex w="80%" flexDir="column" gap={2}>
          <Flex flexDir="column">
            <Text fontSize={{ base: '15px', sm: '18px' }} color={primaryColor}>
              Built for seekers.
            </Text>
            <Text fontSize={{ base: '15px', sm: '18px' }} color={primaryColor}>
              Start
            </Text>
          </Flex>

          {sidebarMenuData.map(({ key, label, icon: Icon, description }) => (
            <Flex
              key={key}
              align="center"
              mb={2}
              cursor="pointer"
              onClick={() => toggleTab(key)}
              color="brand.500"
              gap={2}
              role="group"
            >
              <Flex>
                <Icon size="20px" />
              </Flex>
              <Flex flexDir="column">
                <Text
                  fontSize={{ base: '14px', sm: '17px' }}
                  color="brand.500"
                  _groupHover={{ textDecoration: 'underline' }}
                >
                  {label}
                </Text>
                <Text fontSize="12px" color={primaryColor}>
                  {description}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
};
