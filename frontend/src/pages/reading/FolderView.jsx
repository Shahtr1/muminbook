import { Flex, Grid, Text } from "@chakra-ui/react";
import { Folder } from "@/components/layout/reading/Folder.jsx";
import { readingItems } from "@/data/readingItems.js";
import { useNavigate, useParams } from "react-router-dom";

export const FolderView = () => {
  const navigate = useNavigate();
  const { folderId } = useParams();

  return (
    <Flex flexDirection="column" gap={2}>
      <Text fontSize="xl">{folderId ? `Folder: ${folderId}` : "My Files"}</Text>
      <Grid templateColumns="repeat(3, 1fr)" gap={5}>
        <Folder onClick={() => navigate(`/reading/my-files/folder1`)} />
        <Folder onClick={() => navigate(`/reading/my-files/folder2`)} />

        {readingItems().map((item) => (
          <Text
            key={item.id}
            onClick={() => navigate(`/reading/my-files/${folderId}/${item.id}`)}
          >
            {item.title}
          </Text>
        ))}
      </Grid>
    </Flex>
  );
};
