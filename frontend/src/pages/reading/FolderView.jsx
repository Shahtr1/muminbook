import { Flex, Text } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { myFiles } from "@/data/myFiles.js";

export const FolderView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split("/").filter(Boolean);
  const myFilesIndex = pathnames.indexOf("my-files");
  const folderPath =
    myFilesIndex !== -1 ? pathnames.slice(myFilesIndex + 1) : [];

  let currentFolder = myFiles["my-files"];
  folderPath.forEach((segment) => {
    const decoded = decodeURIComponent(segment);
    if (
      currentFolder &&
      typeof currentFolder === "object" &&
      decoded in currentFolder
    ) {
      currentFolder = currentFolder[decoded];
    } else {
      currentFolder = null;
    }
  });

  if (!currentFolder) {
    return (
      <Flex p={8}>
        <Text>No folder data found.</Text>
      </Flex>
    );
  }

  const items = Object.entries(currentFolder);

  return (
    <Flex flexDirection="column" p={8} gap={4}>
      <Flex flexWrap="wrap" gap="20px">
        {items.map(([name, value]) => {
          if (value === "file") {
            return (
              <Text
                key={name}
                p={4}
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
              >
                {name}
              </Text>
            );
          }
          if (typeof value === "object") {
            return (
              <Folder
                key={name}
                label={name}
                onClick={() =>
                  navigate(
                    `/reading/my-files/${[...folderPath, encodeURIComponent(name)].join("/")}`,
                  )
                }
                width="200px"
                empty={false}
              />
            );
          }
          return null;
        })}
      </Flex>
    </Flex>
  );
};
