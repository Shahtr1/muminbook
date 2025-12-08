import { useQuery } from "@tanstack/react-query";
import { getTrash } from "@/services/index.js";

const Trash = "trash";

export const useTrashResource = (virtualPath = "trash", originalPath = "") => {
  virtualPath = decodeURIComponent(virtualPath);
  const { data: allTrash = [], ...rest } = useQuery({
    queryKey: [Trash],
    queryFn: getTrash,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  if (allTrash.length === 0)
    return {
      resources: [],
      virtualRoot: "trash",
      originalPathMatch: null,
      ...rest,
    };

  // Step 1: Find folder anchors
  const folderAnchors = allTrash
    .filter((item) => item.type === "folder")
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length)
    .map((item) => item.path);

  // Step 2: Create path mapping
  const pathMap = {};
  for (const originalPath of folderAnchors) {
    const segments = originalPath.split("/");
    const lastFolder = segments[segments.length - 1];
    pathMap[originalPath] = `trash/${lastFolder}`;
  }

  // Step 3: Map to virtual paths
  const mappedResources = allTrash.map((res) => {
    let virtualPath;

    for (const [originalPrefix, trashPrefix] of Object.entries(pathMap)) {
      if (res.path.startsWith(originalPrefix)) {
        virtualPath = res.path.replace(originalPrefix, trashPrefix);
        break;
      }
    }

    if (!virtualPath) {
      const fileName = res.path.split("/").pop();
      virtualPath = `trash/${fileName}`;
    }

    return { ...res, virtualPath };
  });

  // Step 4: Filter by virtual path
  let resources = mappedResources.filter((res) => {
    const resParentPath = res.virtualPath.split("/").slice(0, -1).join("/");
    return resParentPath === virtualPath;
  });

  if (originalPath) {
    resources = resources.filter((r) => r.path.includes(originalPath));
  }

  // Step 6: Virtual root
  const virtualRoot = Object.values(pathMap)[0] || "trash";

  return { resources, virtualRoot, ...rest };
};
