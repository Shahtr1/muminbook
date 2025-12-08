/**
 * @fileoverview Trash Resource Management Hook
 *
 * Manages the virtual trash/recycle bin structure by transforming deleted files
 * from their original paths into a clean, navigable virtual trash hierarchy.
 *
 * @see README.md in this directory for comprehensive documentation
 * @see useTrashResource.test.jsx for usage examples and test cases
 *
 * @example
 * // View trash root (shows orphaned files)
 * const { resources, virtualRoot } = useTrashResource('trash');
 *
 * @example
 * // Navigate into a deleted folder
 * const { resources } = useTrashResource('trash/my-folder');
 */

import { useQuery } from '@tanstack/react-query';
import { getTrash } from '@/services/index.js';

const TRASH_QUERY_KEY = 'trash';

/**
 * Hook to fetch and transform trash items into a virtual folder structure
 *
 * @param {string} virtualPath - Current virtual path being viewed (e.g., 'trash/folder')
 * @param {string} originalPath - Optional filter by original file path
 * @returns {Object} Trash resources and metadata
 * @returns {Array} returns.resources - Filtered items for current view
 * @returns {string} returns.virtualRoot - Default root folder for trash
 * @returns {boolean} returns.isSuccess - React Query success state
 * @returns {boolean} returns.isLoading - React Query loading state
 */
export const useTrashResource = (virtualPath = 'trash', originalPath = '') => {
  virtualPath = decodeURIComponent(virtualPath);

  const { data: allTrashItems = [], ...queryState } = useQuery({
    queryKey: [TRASH_QUERY_KEY],
    queryFn: getTrash,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Early return if trash is empty
  if (allTrashItems.length === 0) {
    return {
      resources: [],
      virtualRoot: 'trash',
      originalPathMatch: null,
      ...queryState,
    };
  }

  // Step 1: Identify Folder Anchors
  // Folder anchors are top-level deleted folders that become root folders in trash
  // Sort by path depth (shallowest first) to process parents before children
  const folderAnchorPaths = allTrashItems
    .filter((item) => item.type === 'folder')
    .sort((a, b) => a.path.split('/').length - b.path.split('/').length)
    .map((item) => item.path);

  // Step 2: Create Original → Virtual Path Mapping
  // Maps original paths to clean virtual trash paths
  // Example: 'my-files/documents/project' → 'trash/project'
  const originalToVirtualPathMap = {};
  for (const originalFolderPath of folderAnchorPaths) {
    const pathSegments = originalFolderPath.split('/');
    const folderName = pathSegments[pathSegments.length - 1];
    originalToVirtualPathMap[originalFolderPath] = `trash/${folderName}`;
  }

  // Step 3: Transform All Items to Virtual Paths
  // Each item gets a virtualPath property based on:
  // - If under a folder anchor: transform using the mapping
  // - If orphaned (no anchor): place at trash root with just filename
  const itemsWithVirtualPaths = allTrashItems.map((item) => {
    let itemVirtualPath;

    // Check if item is under any folder anchor
    for (const [originalPrefix, virtualPrefix] of Object.entries(
      originalToVirtualPathMap
    )) {
      if (item.path.startsWith(originalPrefix)) {
        itemVirtualPath = item.path.replace(originalPrefix, virtualPrefix);
        break;
      }
    }

    // Orphaned file: no folder anchor found, use filename only
    if (!itemVirtualPath) {
      const fileName = item.path.split('/').pop();
      itemVirtualPath = `trash/${fileName}`;
    }

    return { ...item, virtualPath: itemVirtualPath };
  });

  // Step 4: Filter by Current Virtual Path
  // Only show items whose parent path matches the current navigation path
  // Example: viewing 'trash/project' only shows direct children, not nested items
  let filteredResources = itemsWithVirtualPaths.filter((item) => {
    const parentPath = item.virtualPath.split('/').slice(0, -1).join('/');
    return parentPath === virtualPath;
  });

  // Optional: Additional filter by original path
  if (originalPath) {
    filteredResources = filteredResources.filter((item) =>
      item.path.includes(originalPath)
    );
  }

  // Step 5: Determine Virtual Root
  // The first folder anchor becomes the default root, or 'trash' if none exist
  const defaultVirtualRoot =
    Object.values(originalToVirtualPathMap)[0] || 'trash';

  return {
    resources: filteredResources,
    virtualRoot: defaultVirtualRoot,
    ...queryState,
  };
};
