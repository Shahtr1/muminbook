import { useParams } from "react-router-dom";

export const FileView = () => {
  const { fileId } = useParams();

  return <>File -> {fileId}</>;
};
