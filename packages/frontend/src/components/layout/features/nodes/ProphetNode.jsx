import { Box, Flex } from '@chakra-ui/react';
import {
  CommonTextNode,
  TreeNode,
} from '@/components/layout/features/nodes/TreeNode.jsx';

export const ProphetNode = ({ data }) => {
  const isBig = data.ulul_azm;
  const lastProphet = data.uuid === 'muhammad';
  return (
    <TreeNode>
      <Flex
        borderRadius="sm"
        bg="node"
        color="white"
        w={lastProphet ? '120px' : isBig ? '90px' : '75px'}
        h={lastProphet ? '60px' : isBig ? '50px' : '40px'}
        position="relative"
        align="center"
      >
        <Flex w="50%" bg="white" h="100%" position="relative">
          <img src={`/images/frames/${data.timeline}.png`} />
          <Box
            w="65%"
            h="70%"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bgImage={`/images/prophets_and_caliphs/pngs/${data.uuid}.png`}
            bgSize="contain"
            bgRepeat="no-repeat"
            bgPosition="center"
            position="absolute"
          />
        </Flex>
        <CommonTextNode data={data} width="50%" color="white" />
      </Flex>
    </TreeNode>
  );
};
