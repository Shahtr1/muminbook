import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useTheme,
} from "@chakra-ui/react";
import {
  ChevronRightIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
} from "@chakra-ui/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GoListUnordered } from "react-icons/go";
import { useRef, useEffect, useState } from "react";

const labelMap = {
  reading: { label: "Reading", icon: GoListUnordered },
};

export const XBreadCrumb = ({ segments }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const fullSegments = ["reading", ...segments];
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const forwardRef = useRef([]);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, [location]);

  const handleBack = () => {
    forwardRef.current.push(location.pathname);
    setCanGoForward(true);
    navigate(-1);
  };

  const handleForward = () => {
    const nextPath = forwardRef.current.pop();
    if (nextPath) {
      navigate(nextPath);
    }
    if (forwardRef.current.length === 0) {
      setCanGoForward(false);
    }
  };

  const goUp = () => {
    if (segments.length > 0) {
      const newSegments = segments.slice(0, -1);
      navigate(`/reading/${newSegments.join("/")}`);
    } else {
      navigate("/reading");
    }
  };

  const buildPath = (index) => {
    const pathSegments = fullSegments.slice(0, index + 1);
    return `/${pathSegments.join("/")}`;
  };

  const canGoUp = segments.length > 0;

  return (
    <Flex align="center" gap={3}>
      {/* Navigation Buttons */}
      <Flex gap={1} align="center">
        <Icon
          as={ArrowBackIcon}
          boxSize={4}
          color="brand.500"
          cursor={canGoBack ? "pointer" : "not-allowed"}
          opacity={canGoBack ? 1 : 0.4}
          onClick={canGoBack ? handleBack : undefined}
        />
        <Icon
          as={ArrowForwardIcon}
          boxSize={4}
          color="brand.500"
          cursor={canGoForward ? "pointer" : "not-allowed"}
          opacity={canGoForward ? 1 : 0.4}
          onClick={canGoForward ? handleForward : undefined}
        />
        <Icon
          as={ArrowUpIcon}
          boxSize={4}
          color="brand.500"
          cursor={canGoUp ? "pointer" : "not-allowed"}
          opacity={canGoUp ? 1 : 0.4}
          onClick={canGoUp ? goUp : undefined}
        />
      </Flex>

      {/* Breadcrumb */}
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
                  <Text
                    color="brand.500"
                    maxW="120px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {label}
                  </Text>
                </Flex>
              </BreadcrumbLink>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Flex>
  );
};
