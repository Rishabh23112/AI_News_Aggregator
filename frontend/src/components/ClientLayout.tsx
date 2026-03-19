'use client';

import React from 'react';
import AppProvider from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '13px',
          },
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </AppProvider>
  );
}
