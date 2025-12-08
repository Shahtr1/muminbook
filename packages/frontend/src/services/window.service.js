import API from '@/config/apiClient.js';

export const getWindows = () => API.get('/windows');
export const deleteWindow = (id) => API.delete(`/windows/${id}`);
