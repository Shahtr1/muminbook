import { Box, Collapse, Flex, Icon, Skeleton, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useResources } from "@/hooks/useResources.js";

const TreeNode = ({ path, name, level = 0, activePath, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(path === "my-files");

  const isActive = activePath === path;
  const isInActivePath =
    activePath === path || activePath?.startsWith(`${path}/`);

  useEffect(() => {
    if (isInActivePath) {
      setIsExpanded(true);
      setShouldFetch(true);
    }
  }, [activePath]);

  const { resources, isPending } = useResources(shouldFetch ? path : null);

  const toggle = () => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    if (nextExpanded) {
      setShouldFetch(true);
    }
  };

  const showLoadingLabel = shouldFetch && isPending;

  return (
    <Box pl={level * 2}>
      <Flex
        align="center"
        py={1}
        cursor="pointer"
        bg={isActive ? "whiteAlpha.300" : "transparent"}
        _hover={{ bg: "whiteAlpha.200" }}
        onClick={() => onSelect?.(path)}
      >
        <Icon
          as={isExpanded ? ChevronDownIcon : ChevronRightIcon}
          mr={2}
          fontSize="12px"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
        />
        {showLoadingLabel ? (
          <Skeleton
            height="16px"
            width="100%"
            startColor="gray.600"
            endColor="gray.400"
          />
        ) : (
          <Text noOfLines={1}>{decodeURIComponent(name)}</Text>
        )}
      </Flex>

      <Collapse in={isExpanded}>
        {!isPending &&
          resources?.map((res) => {
            const resPath = `${path}/${encodeURIComponent(res.name)}`.replace(
              /\/+/g,
              "/",
            );

            if (res.type === "folder") {
              return (
                <TreeNode
                  key={res.name}
                  path={resPath}
                  name={res.name}
                  level={level + 1}
                  activePath={activePath}
                  onSelect={onSelect}
                />
              );
            }

            // Render files
            return (
              <Box key={res.name} pl={(level + 1) * 2}>
                <Flex
                  align="center"
                  py={1}
                  cursor="pointer"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => {
                    // TODO: handle file click (intentionally left empty)
                  }}
                >
                  <Text noOfLines={1}>{res.name}</Text>
                </Flex>
              </Box>
            );
          })}
      </Collapse>
    </Box>
  );
};

export const FolderTree = ({ rootPath = "my-files", activePath, onSelect }) => {
  return (
    <TreeNode
      path={rootPath}
      name="My Files"
      level={0}
      activePath={activePath}
      onSelect={onSelect}
    />
  );
};
