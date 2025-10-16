'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/verify');
  };

  return (
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/75 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-zinc-400 hover:text-white lg:hidden transition-colors"
        onClick={onMenuClick}
        aria-label="打开菜单"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex flex-1 gap-x-4">
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <button
          type="button"
          className="relative -m-2.5 p-2.5 text-zinc-400 hover:text-white transition-colors"
          aria-label="查看通知"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
              <span className="text-sm font-medium text-white">A</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white">管理员</p>
              <p className="text-xs text-zinc-400">Admin</p>
            </div>
            <svg className="hidden sm:block h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-zinc-800 py-1 shadow-lg ring-1 ring-zinc-700 focus:outline-none">
                <div className="px-4 py-3 border-b border-zinc-700">
                  <p className="text-sm font-medium text-white">管理员</p>
                  <p className="text-xs text-zinc-400">admin@kami.com</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/verify');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  返回前台
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors"
                >
                  退出登录
                </button>
              </div>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowUserMenu(false)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

