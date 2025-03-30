import {
  Box,
  Collapse,
  Flex,
  Icon,
  Skeleton,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useResources } from "@/hooks/useResources.js";
import { FolderSVG } from "@/components/svgs/FolderSVG.jsx";
import { FileSVG } from "@/components/svgs/FileSVG.jsx";

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
        p={1}
        cursor="pointer"
        onClick={() => onSelect?.(path)}
        borderRadius="sm"
        role="group"
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
            startColor="gray.300"
            endColor="gray.100"
          />
        ) : (
          <Flex align="center" gap="5px" overflow="hidden">
            <FolderSVG dimensions="15px" />
            <Tooltip
              label={decodeURIComponent(name)}
              hasArrow
              placement="auto-end"
            >
              <Text
                whiteSpace="nowrap"
                fontSize="13px"
                _groupHover={{ color: isActive ? "brand.500" : "brand.600" }}
                color={isActive ? "brand.500" : "unset"}
              >
                {decodeURIComponent(name)}
              </Text>
            </Tooltip>
          </Flex>
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
              if (res.empty && res.name === "lost+found") {
                return null;
              }

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
                  p={1}
                  cursor="pointer"
                  gap="5px"
                  onClick={() => {
                    // TODO: handle file click (intentionally left empty)
                  }}
                  borderRadius="sm"
                  role="group"
                >
                  <FileSVG dimensions="15px" activeColor="brand.500" />

                  <Tooltip label={res.name} hasArrow placement="auto-end">
                    <Text
                      fontSize="13px"
                      whiteSpace="nowrap"
                      _groupHover={{ color: "brand.600" }}
                    >
                      {res.name}
                    </Text>
                  </Tooltip>
                </Flex>
              </Box>
            );
          })}
      </Collapse>
    </Box>
  );
};

export const ResourcesTree = ({
  rootPath = "my-files",
  activePath,
  onSelect,
}) => {
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
