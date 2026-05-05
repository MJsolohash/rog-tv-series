import api from './api';

export const getSeries = async () => {
  const response = await api.get('/series');
  return response.data;
};

export const getSeriesById = async (id) => {
  const response = await api.get(`/series/${id}`);
  return response.data;
};

export const getEpisodesBySeries = async (seriesId) => {
  const response = await api.get(`/episodes/series/${seriesId}`);
  return response.data;
};