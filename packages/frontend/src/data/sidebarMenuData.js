import { BsFiles, BsSearch } from 'react-icons/bs';
import { ExplorerSidebar } from '@/components/suhuf/leftSidebar/ExplorerSidebar.jsx';
import { SearchSidebar } from '@/components/suhuf/leftSidebar/SearchSidebar.jsx';

export const sidebarMenuData = [
  {
    key: 'explorer',
    label: 'Explorer',
    icon: BsFiles,
    component: ExplorerSidebar,
    description:
      'Browse and manage your readings and resources — add, rename, or delete files and folders.',
  },
  {
    key: 'search',
    label: 'Search',
    icon: BsSearch,
    component: SearchSidebar,
    description:
      'Quickly search through your files, ayahs, or notes to find what you need.',
  },
];
