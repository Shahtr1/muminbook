import { BsFiles, BsSearch } from 'react-icons/bs';
import { ExplorerSidebarContent } from '@/components/suhuf/sidebar/ExplorerSidebarContent.jsx';
import { SearchSidebarContent } from '@/components/suhuf/sidebar/SearchSidebarContent.jsx';

export const sidebarMenuData = [
  {
    key: 'explorer',
    label: 'Explorer',
    icon: BsFiles,
    component: ExplorerSidebarContent,
    description:
      'Browse and manage your readings and resources — add, rename, or delete files and folders.',
  },
  {
    key: 'search',
    label: 'Search',
    icon: BsSearch,
    component: SearchSidebarContent,
    description:
      'Quickly search through your files, ayahs, or notes to find what you need.',
  },
];
