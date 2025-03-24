import { Flex, Text } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { myFiles } from "@/data/myFiles.js";

export const FolderView = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isFolderView = location.pathname.includes("/reading/my-files");
  const pathNames = location.pathname.split("/").filter(Boolean);
  const myFilesIndex = pathNames.indexOf("my-files");
  const folderPath =
    myFilesIndex !== -1 ? pathNames.slice(myFilesIndex + 1) : [];

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

  const items = Object.entries(currentFolder);

  return (
    <Flex
      flexWrap="wrap"
      overflowY="auto"
      gap={12}
      height="fit-content"
      p="10px 25px"
    >
      {items.map(([name, value]) => {
        if (value === "file") {
          return (
            <Text
              key={name}
              p={4}
              border="1px solid"
              borderColor="gray.300"
              borderRadius="md"
              h="fit-content"
            >
              {name}
            </Text>
          );
        }
        if (typeof value === "object") {
          const isEmpty = Object.keys(value).length === 0;
          return (
            <Folder
              key={name}
              label={name}
              onClick={() =>
                navigate(
                  `/reading/my-files/${[...folderPath, encodeURIComponent(name)].join("/")}`,
                )
              }
              empty={isEmpty}
              isFolderView={isFolderView}
              width="100px"
            />
          );
        }

        return null;
      })}
    </Flex>
  );
};
