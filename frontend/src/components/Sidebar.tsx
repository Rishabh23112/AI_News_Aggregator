'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiNewspaper,
  HiStar,
  HiChatBubbleLeftEllipsis,
  HiCog6Tooth,
  HiSparkles
} from 'react-icons/hi2';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'News Feed', href: '/', icon: <HiNewspaper /> },
    { name: 'Favorites', href: '/favorites', icon: <HiStar /> },
    { name: 'AI Assistant', href: '/assistant', icon: <HiChatBubbleLeftEllipsis /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img 
          src="https://img.icons8.com/comic/100/news.png" 
          alt="Logo" 
          className="logo-icon"
        />
      </div>

      <nav className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div className="user-selector">
          <label>Profile</label>
        </div>
      </div>
    </aside>
  );
}
