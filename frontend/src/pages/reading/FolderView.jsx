import { Flex, useBreakpointValue } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { Folder } from "@/components/layout/reading/resources/Folder.jsx";
import { File } from "@/components/layout/reading/resources/File.jsx";
import { SomethingWentWrong } from "@/components/layout/SomethingWentWrong.jsx";
import { Loader } from "@/components/layout/Loader.jsx";
import { useResources } from "@/hooks/resource/useResources.js";
import { useTrash } from "@/hooks/trash/useTrash.js";

export const FolderView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const itemWidth = useBreakpointValue({ base: "70px", sm: "100px" });

  const pathSegments = location.pathname.split("/").filter(Boolean);

  const isTrashView = location.pathname.includes("/reading/trash");
  const baseSegment = isTrashView ? "trash" : "my-files";
  const folderPathIndex = pathSegments.indexOf(baseSegment);
  const folderPath = pathSegments.slice(folderPathIndex).join("/");

  const { resources, isPending, isError } = isTrashView
    ? useTrash(folderPath)
    : useResources(folderPath);

  if (isPending) return <Loader />;
  if (isError) return <SomethingWentWrong />;

  return (
    <Flex
      flexWrap="wrap"
      overflowY="auto"
      gap={{ base: 5, sm: 12 }}
      height="fit-content"
      p="10px 25px"
      overflow="visible"
    >
      {resources.map((res) => {
        if (res.type === "folder" && res.name === "lost+found" && res.empty) {
          return null;
        }

        if (res.type === "folder") {
          return (
            <Folder
              key={res._id}
              id={res._id}
              label={res.name}
              onClick={() => {
                navigate(
                  `/reading/${baseSegment}/${[
                    ...pathSegments.slice(folderPathIndex + 1),
                    encodeURIComponent(res.name),
                  ].join("/")}`,
                );
              }}
              empty={res.empty}
              width={itemWidth}
              showItemToolbar={res.name !== "lost+found"}
            />
          );
        }

        return (
          <File
            key={res._id}
            id={res._id}
            label={res.name}
            onClick={() => {
              // TODO: handle file open here
            }}
            width={itemWidth}
          />
        );
      })}
    </Flex>
  );
};
