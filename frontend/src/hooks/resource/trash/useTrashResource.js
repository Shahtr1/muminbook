import { useQuery } from "@tanstack/react-query";
import { getTrash } from "@/lib/services/api.js";

const Trash = "trash";

export const useTrashResource = (folderPath = "trash") => {
  const { data: allTrash = [], ...rest } = useQuery({
    queryKey: [Trash],
    queryFn: getTrash,
  });

  if (allTrash.length === 0)
    return { resources: [], virtualRoot: "trash", ...rest };

  // Step 1: Find the shortest folder path(s) (the anchors)
  const folderAnchors = allTrash
    .filter((item) => item.type === "folder")
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length)
    .map((item) => item.path); // e.g., "my-files/documents/doc1"

  // Step 2: Create a path mapping from original → virtual trash
  const pathMap = {};
  for (const originalPath of folderAnchors) {
    const segments = originalPath.split("/");
    const lastFolder = segments[segments.length - 1];
    pathMap[originalPath] = `trash/${lastFolder}`;
  }

  // ✅ Step 3: Map each trash item to its virtual path (with fallback for orphan files)
  const mappedResources = allTrash.map((res) => {
    let virtualPath;

    // Try mapping using known folder anchors
    for (const [originalPrefix, trashPrefix] of Object.entries(pathMap)) {
      if (res.path.startsWith(originalPrefix)) {
        virtualPath = res.path.replace(originalPrefix, trashPrefix);
        break; // only first match
      }
    }

    // 🔁 Fallback for orphaned items (no match above)
    if (!virtualPath) {
      const fileName = res.path.split("/").pop(); // just get the filename
      virtualPath = `trash/${fileName}`;
    }

    return { ...res, virtualPath };
  });

  // Step 4: Filter based on folderPath
  const resources = mappedResources.filter((res) => {
    const resParentPath = res.virtualPath.split("/").slice(0, -1).join("/");
    return resParentPath === folderPath;
  });

  // Step 5: Derive virtualRoot from first mapped anchor
  const virtualRoot = Object.values(pathMap)[0] || "trash";

  return { resources, virtualRoot, ...rest };
};
