'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUsers, getFavorites, addFavorite, removeFavorite as removeFavoriteApi } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string | null;
  role: string;
}

interface FavoriteItem {
  favorite_id: number;
  user_id: number;
  created_at: string;
  news_item: any;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  favorites: FavoriteItem[];
  favoriteNewsIds: Set<number>;
  setCurrentUserId: (id: number) => void;
  toggleFavorite: (newsId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType>({
  currentUser: null,
  users: [],
  favorites: [],
  favoriteNewsIds: new Set(),
  setCurrentUserId: () => {},
  toggleFavorite: async () => {},
  refreshFavorites: async () => {},
  loading: true,
});

export const useApp = () => useContext(AppContext);

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = users.find(u => u.id === currentUserId) || null;
  const favoriteNewsIds = new Set(favorites.map(f => f.news_item.id));

  useEffect(() => {
    getUsers()
      .then(res => {
        setUsers(res.data);
        if (res.data.length > 0 && !res.data.find((u: User) => u.id === currentUserId)) {
          setCurrentUserId(res.data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await getFavorites(currentUserId);
      setFavorites(res.data);
    } catch {}
  }, [currentUserId]);

  useEffect(() => {
    refreshFavorites();
  }, [currentUserId, refreshFavorites]);

  const toggleFavorite = useCallback(async (newsId: number) => {
    const existing = favorites.find(f => f.news_item.id === newsId);
    
    // Optimistic Update
    if (existing) {
      setFavorites(prev => prev.filter(f => f.news_item.id !== newsId));
      try {
        await removeFavoriteApi(existing.favorite_id);
      } catch {
        await refreshFavorites(); // Rollback
        throw new Error('Failed to remove favorite');
      }
    } else {
      // Temporary optimistic object
      const tempFav: FavoriteItem = {
        favorite_id: -1,
        user_id: currentUserId,
        created_at: new Date().toISOString(),
        news_item: { id: newsId }
      };
      setFavorites(prev => [...prev, tempFav]);
      try {
        await addFavorite(currentUserId, newsId);
        await refreshFavorites(); // Fetch real data to get proper ID
      } catch {
        setFavorites(prev => prev.filter(f => f.news_item.id !== newsId)); // Rollback
        throw new Error('Failed to add favorite');
      }
    }
  }, [currentUserId, favorites, refreshFavorites]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        favorites,
        favoriteNewsIds,
        setCurrentUserId,
        toggleFavorite,
        refreshFavorites,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
