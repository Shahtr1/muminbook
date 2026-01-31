import API from '@/config/apiClient.js';

export const getReadings = () => API.get(`/readings`);
export const getReading = (fileId, params) =>
  API.get(`/readings/${fileId}`, { params });
