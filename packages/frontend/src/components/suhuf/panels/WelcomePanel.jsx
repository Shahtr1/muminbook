import {
  Box,
  Flex,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { SuhufSVG } from '@/components/svgs/SuhufSVG.jsx';
import { sidebarMenuData } from '@/data/sidebarMenuData.js';
import { useUpdateSuhufConfig } from '@/hooks/suhuf/useUpdateSuhufConfig.js';

export const WelcomePanel = ({ suhuf }) => {
  const { mutate: updateConfig } = useUpdateSuhufConfig(suhuf._id);

  const secondaryColor = useColorModeValue('wn.gutter.light', 'wn.gutter.dark');
  const suhufLogoSize = useBreakpointValue({ base: '90px', sm: '130px' });
  const primaryColor = useColorModeValue('wn.icon.light', 'wn.icon.dark');
  const bgColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );

  const layout = suhuf?.config?.layout || {};
  const activeTab = layout.leftTab;
  const isOpen = layout.isLeftTabOpen;

  const toggleTab = (tabKey) => {
    const isSame = activeTab === tabKey;

    updateConfig({
      layout: {
        ...layout,
        leftTab: tabKey,
        isLeftTabOpen: isSame ? !isOpen : true,
      },
    });
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
