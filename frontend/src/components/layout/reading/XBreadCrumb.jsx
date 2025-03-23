import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Text,
  useTheme,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { GoListUnordered } from "react-icons/go";

export const XBreadCrumb = ({ segments }) => {
  const theme = useTheme();
  const fullSegments = ["reading", ...segments];

  const labelMap = {
    reading: { label: "Readings", icon: GoListUnordered },
    "my-files": { label: "My Files" },
  };

  const buildPath = (index) => "/" + fullSegments.slice(0, index + 1).join("/");

  return (
    <Breadcrumb
      spacing="5px"
      separator={<ChevronRightIcon color="brand.500" />}
      fontWeight="medium"
      fontSize={{ base: "12px", sm: "13px" }}
    >
      {fullSegments.map((segment, index) => {
        const fullPath = buildPath(index);
        const isLast = index === fullSegments.length - 1;

        const custom = labelMap[segment];
        const label = custom?.label || decodeURIComponent(segment);
        const Icon = custom?.icon;

        return (
          <BreadcrumbItem key={fullPath} isCurrentPage={isLast}>
            <BreadcrumbLink
              as={Link}
              to={fullPath}
              color="brand.500"
              fontWeight="semibold"
            >
              <Flex align="center" gap={1}>
                {Icon && (
                  <Icon
                    color={theme.colors.brand["500"]}
                    style={{ strokeWidth: 1.5 }}
                  />
                )}
                <Text color="brand.500">{label}</Text>
              </Flex>
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};
