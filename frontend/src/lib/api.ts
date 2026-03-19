import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/* ── News ── */
export const getNews = (params?: { keyword?: string; source_id?: number }) =>
  api.get('/news/', { params });

export const getNewsById = (id: number) =>
  api.get(`/news/${id}`);

export const refreshNews = () =>
  api.post('/news/refresh');

/* ── Sources ── */
export const getSources = () =>
  api.get('/sources/');

/* ── Favorites ── */
export const getFavorites = (userId: number) =>
  api.get('/favorites/', { params: { user_id: userId } });

export const addFavorite = (userId: number, newsId: number) =>
  api.post('/favorites/', { user_id: userId, news_id: newsId });

export const removeFavorite = (favoriteId: number) =>
  api.delete(`/favorites/${favoriteId}`);

/* ── Broadcast ── */
export const broadcast = (favoriteId: number, platform: string) =>
  api.post('/broadcast/', { favorite_id: favoriteId, platform });

/* ── Users ── */
export const getUsers = () =>
  api.get('/users/');

/* ── Agent ── */
export const askAgent = (query: string) =>
  api.get('/agent/ask', { params: { query } });

export default api;
