import api from './api';

export const getEpisodeById = async (id) => {
  const response = await api.get(`/episodes/${id}`);
  return response.data;
};

export const updateWatchProgress = async (episodeId, progress) => {
  const response = await api.post('/watch/progress', { episodeId, progress });
  return response.data;
};