import { Flex, useColorModeValue } from '@chakra-ui/react';
import { SomethingWentWrong } from '@/components/layout/SomethingWentWrong.jsx';
import { QuranUI } from '@/components/layout/reading/ui/QuranUI.jsx';

export const ReadingPanel = ({ id, panel }) => {
  const bgColor = useColorModeValue(
    'wn.bg_content.light',
    'wn.bg_content.dark'
  );

  const renderUI = () => {
    switch (id.toLowerCase()) {
      case 'quran':
        return <QuranUI fileId={id} />;
      default:
        console.error(`No UI for reading type ${id}`);
        return <SomethingWentWrong />;
    }
  };

  return (
    <Flex height="100%" overflowY="auto" bgColor={bgColor} flexDir="column">
      {renderUI()}
    </Flex>
  );
};
