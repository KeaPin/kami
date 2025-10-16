'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token');
    if (!storedToken && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setToken(storedToken);
    }
    setLoading(false);
  }, [pathname, router]);

  // 登录页面不需要布局
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 加载中
  if (loading) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-t-transparent border-indigo-500"></div>
      </div>
    );
  }

  // 未登录
  if (!token) {
    return null;
  }

  const titles: Record<string, string> = {
    '/admin': '概览',
    '/admin/cdkeys': '卡密管理',
    '/admin/resources': '资源管理'
  };

  return (
    <div className="fixed inset-0 bg-zinc-950">
      <div className="flex h-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            title={titles[pathname] || '管理后台'}
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


