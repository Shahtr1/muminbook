import API from '@/config/apiClient.js';

export const getReadings = () => API.get(`/readings`);
export const getReading = (uuid, params) =>
  API.get(`/readings/${uuid}`, { params });
