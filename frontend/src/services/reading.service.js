import API from "@/config/apiClient.js";

export const getReadings = () => API.get(`/readings`);
export const getReading = (id, page = 1) =>
  API.get(`/readings/${id}`, {
    params: { page },
  });
export const getReadingBySurah = (readingId, surahId) =>
  API.get(`/readings/${readingId}/surah/${surahId}`);
