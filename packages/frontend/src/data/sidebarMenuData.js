import { BsFiles, BsSearch } from 'react-icons/bs';
import { ExplorerPanel } from '@/components/layout/suhuf/suhufLeftSidebar/panels/ExplorerPanel.jsx';
import { SearchPanel } from '@/components/layout/suhuf/suhufLeftSidebar/panels/SearchPanel.jsx';

export const sidebarMenuData = [
  {
    key: 'explorer',
    label: 'Explorer',
    icon: BsFiles,
    component: ExplorerPanel,
    description:
      'Browse and manage your readings and resources — add, rename, or delete files and folders.',
  },
  {
    key: 'search',
    label: 'Search',
    icon: BsSearch,
    component: SearchPanel,
    description:
      'Quickly search through your files, ayahs, or notes to find what you need.',
  },
];
