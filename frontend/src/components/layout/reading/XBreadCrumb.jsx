import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export const XBreadCrumb = () => {
  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={<ChevronRightIcon color="gray.500" />}
        fontWeight="medium"
        fontSize={{ base: "12px", sm: "14px" }}
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="#">
            <Text>Home</Text>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="#">
            <Text>About</Text>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink as={Link} to="#">
            <Text>Contact</Text>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    </>
  );
};
