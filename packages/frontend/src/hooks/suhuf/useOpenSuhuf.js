import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateSuhuf } from '@/hooks/suhuf/useCreateSuhuf.js';

/**
 * Generate a unique title from a base title by appending a counter in parentheses
 * if the baseTitle already exists in openTitles.
 */
const generateUniqueTitle = (baseTitle, openTitles) => {
  if (!openTitles || openTitles.length === 0) return baseTitle;

  // Use a Set for faster lookup
  const titlesSet = new Set(openTitles);
  if (!titlesSet.has(baseTitle)) return baseTitle;

  let counter = 1;
  let candidate = `(${counter}) ${baseTitle}`;
  while (titlesSet.has(candidate)) {
    counter += 1;
    candidate = `(${counter}) ${baseTitle}`;
  }

  return candidate;
};

/**
 * Hook: useOpenSuhuf
 * - Returns a function that creates a new "Suhuf" window + entity.
 * - Ensures the new Suhuf title doesn't collide with currently open Suhuf titles.
 * - Navigates to the created suhuf and calls onSuccess(suhufId) if provided.
 */
export const useOpenSuhuf = (onSuccess) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createSuhuf } = useCreateSuhuf();

  return () => {
    // Read currently open windows from the cache (synchronous)
    const windows = queryClient.getQueryData(['windows']) || [];
    const baseTitle = 'Untitled Suhuf';

    // Collect titles of open Suhuf windows that have a title
    const openTitles = windows
      .filter((win) => win.type === 'Suhuf' && win.typeId?.title)
      .map((win) => win.typeId.title);

    // Compute a non-colliding title
    const newTitle = generateUniqueTitle(baseTitle, openTitles);

    // Create the Suhuf and on success navigate + call callback
    createSuhuf(
      { title: newTitle },
      {
        onSuccess: ({ suhufId }) => {
          navigate(`/suhuf/${suhufId}`);
          if (typeof onSuccess === 'function') onSuccess(suhufId);
        },
      }
    );
  };
};
