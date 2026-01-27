# useTrashResource Hook

## Overview

The `useTrashResource` hook manages the trash/recycle bin functionality for the file management system. It transforms deleted files from their original paths into a clean, navigable virtual trash structure.

## Purpose

When users delete files/folders from various locations in the file system, they all end up in trash. This hook:

1. **Fetches** all trashed items from the backend
2. **Transforms** their original paths into virtual trash paths
3. **Filters** items based on the current navigation view
4. **Organizes** trash into a hierarchical folder structure

## The Problem It Solves

### Before Deletion (Original Paths)

```
my-files/
  documents/
    project-alpha/
      report.pdf
      data.csv
    work/
      notes.txt
  photos/
    vacation/
      beach.jpg
```

### After Deletion (Database Storage)

All items retain their original paths:

- `my-files/documents/project-alpha` (folder)
- `my-files/documents/project-alpha/report.pdf` (file)
- `my-files/documents/project-alpha/data.csv` (file)
- `my-files/documents/work/notes.txt` (file)
- `my-files/photos/vacation/beach.jpg` (file)

### Problem:

- Users shouldn't see the entire original path in trash
- Need a clean, browsable structure
- Must preserve folder hierarchies
- Handle files deleted individually (orphans)

### Solution (Virtual Trash Structure)

```
trash/
  project-alpha/          ← Folder anchor (top-level deleted folder)
    report.pdf
    data.csv
  notes.txt              ← Orphaned file (deleted individually)
  beach.jpg              ← Orphaned file
```

## How It Works

### Step 1: Identify Folder Anchors

**Folder anchors** are the top-level folders that were deleted. These become the root folders in trash.

```javascript
const folderAnchors = allTrash
  .filter((item) => item.type === 'folder')
  .sort((a, b) => a.path.split('/').length - b.path.split('/').length)
  .map((item) => item.path);
```

**Example Result:**

```javascript
[
  'my-files/documents/project-alpha',
  'my-files/documents/work',
  'my-files/photos/vacation',
];
```

### Step 2: Create Path Mapping

Maps original paths to virtual trash paths:

```javascript
const pathMap = {
  'my-files/documents/project-alpha': 'trash/project-alpha',
  'my-files/documents/work': 'trash/work',
  'my-files/photos/vacation': 'trash/vacation',
};
```

### Step 3: Transform All Items

Each item gets a virtual path:

**Files Under Folder Anchors:**

- `my-files/documents/project-alpha/report.pdf` → `trash/project-alpha/report.pdf`
- `my-files/documents/project-alpha/data.csv` → `trash/project-alpha/data.csv`

**Orphaned Files (No Folder Anchor):**

- `my-files/documents/work/notes.txt` → `trash/notes.txt`
- `my-files/photos/vacation/beach.jpg` → `trash/beach.jpg`

### Step 4: Filter by Current View

Only shows items whose parent path matches the current navigation path.

**Example:** If viewing `trash/project-alpha`, only show:

- `trash/project-alpha/report.pdf` ✅
- `trash/project-alpha/data.csv` ✅
- NOT `trash/project-alpha/subfolder/deep.txt` ❌ (different parent)

## API

### Parameters

```javascript
useTrashResource((virtualPath = 'trash'), (originalPath = ''));
```

| Parameter      | Type     | Default   | Description                                                       |
| -------------- | -------- | --------- | ----------------------------------------------------------------- |
| `virtualPath`  | `string` | `'trash'` | Current virtual path being viewed (e.g., `'trash/project-alpha'`) |
| `originalPath` | `string` | `''`      | Additional filter by original path (optional)                     |

### Returns

```javascript
{
  resources: Array,      // Filtered items for current view
  virtualRoot: string,   // Default root folder for trash
  originalPathMatch: null,
  isSuccess: boolean,    // Query success state
  isLoading: boolean,    // Query loading state
  isError: boolean,      // Query error state
  error: Error | null,   // Query error object
  // ...other React Query states
}
```

## Usage Examples

### Example 1: View Trash Root

```javascript
const { resources, virtualRoot, isLoading } = useTrashResource('trash');

// Returns:
// resources: [
//   { virtualPath: 'trash/notes.txt', name: 'notes.txt', ... },
//   { virtualPath: 'trash/beach.jpg', name: 'beach.jpg', ... }
// ]
// virtualRoot: 'trash'
```

Shows only orphaned files at trash root level.

### Example 2: Navigate Into Folder

```javascript
const { resources } = useTrashResource('trash/project-alpha');

// Returns:
// resources: [
//   { virtualPath: 'trash/project-alpha/report.pdf', ... },
//   { virtualPath: 'trash/project-alpha/data.csv', ... },
//   { virtualPath: 'trash/project-alpha/subfolder', type: 'folder', ... }
// ]
```

Shows direct children of the folder (not nested items).

### Example 3: Navigate Deeper

```javascript
const { resources } = useTrashResource('trash/project-alpha/subfolder');

// Returns only items directly inside 'subfolder'
// resources: [
//   { virtualPath: 'trash/project-alpha/subfolder/deep.txt', ... }
// ]
```

### Example 4: Filter by Original Path

```javascript
const { resources } = useTrashResource('trash', 'documents');

// Returns items whose original path contains 'documents'
```

## Key Concepts

### Folder Anchors

The top-level folders that were deleted become "anchors" - they establish the root structure of trash.

**Why sorted by path depth?**
To ensure parent folders are processed before their children, maintaining hierarchy.

### Virtual Paths

- **Original Path:** `my-files/projects/2024/reports/annual.pdf`
- **Virtual Path:** `trash/annual.pdf` (if parent folder was not deleted)
- **Virtual Path:** `trash/reports/annual.pdf` (if `reports` folder was deleted)

### Orphaned Files

Files deleted individually without their parent folder. These appear at the trash root with just their filename.

### Virtual Root

The default folder to navigate to when viewing trash. It's the first folder anchor, or `'trash'` if no folders exist.

## Testing

See `useTrashResource.test.jsx` for comprehensive test cases covering:

1. **Folder anchor mapping** - Tests virtual path transformations
2. **Nested folder navigation** - Tests deep folder structures
3. **Orphaned file handling** - Tests files without folder anchors
4. **Virtual root calculation** - Tests default navigation
5. **Fallback behavior** - Tests unmapped files

### Running Tests

```bash
npm test -- useTrashResource.test.jsx
```

## Edge Cases Handled

### 1. Empty Trash

Returns empty resources array with default virtualRoot.

### 2. Only Orphaned Files

All files appear at trash root with no folder structure.

### 3. Deep Folder Hierarchies

Only the top-most deleted folder becomes an anchor, preserving the structure below it.

### 4. Duplicate Filenames

Files keep their full virtual path, so duplicates are distinguished by their parent folders.

### 5. Special Characters in Paths

Virtual paths are URI decoded to handle encoded characters.

## Performance Considerations

- **Query Caching:** Uses React Query with `queryKey: ['trash']` for efficient caching
- **No Refetch:** Configured with `refetchOnReconnect: false` and `refetchOnWindowFocus: false`
- **Single Fetch:** All trash items fetched once, then filtered client-side
- **Efficient Filtering:** Uses string operations for path matching

## Related Files

- **Hook:** `useTrashResource.js`
- **Tests:** `useTrashResource.test.jsx`
- **API Service:** `@/services/index.js` (getTrash function)
- **Component Usage:** Check components that import this hook for UI implementation

## Future Improvements

1. **Pagination:** Handle large trash collections with pagination
2. **Search:** Add search/filter within trash
3. **Sorting:** Add sorting options (name, date, size)
4. **Bulk Operations:** Support for bulk restore/delete
5. **Trash Size:** Calculate and display total trash size
6. **Auto-cleanup:** Implement auto-deletion after X days

## Troubleshooting

### Resources Array is Empty

- Check if `getTrash()` API is returning data
- Verify mock data in tests matches expected structure
- Check if virtual path matches any parent paths

### Virtual Root is 'trash'

This is expected when viewing trash root or when no folder anchors exist.

### Items Not Showing

- Verify the `virtualPath` parameter matches the parent path of items
- Check if `originalPath` filter is excluding items
- Ensure items have correct `path` and `type` properties

## Architecture Decision

**Why Virtual Paths?**

- **User Experience:** Clean, simple paths in UI
- **Flexibility:** Original paths preserved for restore functionality
- **Organization:** Automatic folder structure based on deletion context
- **Scalability:** Works with any file system depth

**Why Client-Side Filtering?**

- **Performance:** Single API call instead of multiple filtered requests
- **Reactivity:** Instant navigation without loading states
- **Caching:** React Query caches all trash data efficiently
- **Simplicity:** Easier to test and maintain
