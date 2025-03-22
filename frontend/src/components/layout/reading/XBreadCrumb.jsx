import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Text,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";
import { GoListUnordered } from "react-icons/go";

export const XBreadCrumb = () => {
  const location = useLocation();

  const breadcrumbs = [
    {
      id: "reading",
      label: "Readings",
      link: "/reading",
      icon: GoListUnordered,
    },
  ];

  return (
    <Breadcrumb
      spacing="5px"
      separator={<ChevronRightIcon color="gray.500" />}
      fontWeight="medium"
      fontSize={{ base: "12px", sm: "13px" }}
    >
      {breadcrumbs.map((crumb) => {
        const isCurrentPage = location.pathname === crumb.link;

        return (
          <BreadcrumbItem key={crumb.id} isCurrentPage={isCurrentPage}>
            <BreadcrumbLink as={Link} to={crumb.link}>
              <Flex align="center" gap={1}>
                {crumb.icon && <crumb.icon />}
                <Text>{crumb.label}</Text>
              </Flex>
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};
