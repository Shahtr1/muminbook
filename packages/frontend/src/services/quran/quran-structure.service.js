import API from '@/config/apiClient.js';

export const getQuranStructure = () => API.get(`/readings/quran-structure`);
