import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Icon,
  Text,
  useTheme,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { GoListUnordered } from "react-icons/go";
import { useEffect, useRef, useState } from "react";

const labelMap = {
  reading: { label: "Reading", icon: GoListUnordered },
  "my-files": { label: "My Files" },
  trash: { label: "Trash" },
};

export const XBreadCrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const originalPath = location.state?.originalPath;

  const isTrashView = location.pathname.includes("/reading/trash");

  const isFolderView =
    location.pathname.includes("/reading/my-files") || isTrashView;

  const segments = location.pathname.split("/").filter(Boolean);
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
    if (segments.length > 1) {
      const newSegments = segments.slice(0, -1);
      navigate(`/${newSegments.join("/")}`);
    } else {
      navigate("/reading");
    }
  };

  const canGoUp = segments.length > 1;

  // Create breadcrumb items
  const breadcrumbItems = segments.map((segment, index) => {
    const pathSegments = segments.slice(0, index + 1);
    const basePath = `/${pathSegments.join("/")}`;

    let partialOriginalPath;
    if (isTrashView && originalPath && index > 1) {
      const originalPathSegments = originalPath.split("/");
      const depthAfterTrash = index - 1;
      partialOriginalPath = originalPathSegments
        .slice(0, depthAfterTrash + 1)
        .join("/");
    }

    const label = labelMap[segment]?.label || decodeURIComponent(segment);
    const Icon = labelMap[segment]?.icon;
    const isLast = index === segments.length - 1;

    return {
      label,
      Icon,
      path: basePath,
      state: partialOriginalPath
        ? { originalPath: partialOriginalPath }
        : undefined,
      isLast,
    };
  });

  return (
    <Flex align="center" gap={3}>
      {/* Navigation Buttons */}
      {isFolderView && (
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
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        as={Flex}
        spacing="5px"
        separator={<ChevronRightIcon color="brand.500" />}
        fontWeight="medium"
        fontSize={{ base: "12px", sm: "13px" }}
        overflowX="auto"
        pr={2}
        css={{
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {breadcrumbItems.map(({ path, state, label, Icon, isLast }) => (
          <BreadcrumbItem key={path} isCurrentPage={isLast}>
            <BreadcrumbLink
              onClick={() => navigate(path, { state })}
              color="brand.500"
              fontWeight="semibold"
              cursor="pointer"
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
        ))}
      </Breadcrumb>
    </Flex>
  );
};
