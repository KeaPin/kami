'use client';

import { useEffect, useState } from 'react';
import type { Resource } from '@/types/database';
import ThemeToggle from '@/components/ThemeToggle';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('verified_resources');
    if (stored) {
      setResources(JSON.parse(stored));
    } else {
      window.location.href = '/verify';
    }
  }, []);

  if (resources.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">验证成功！</h1>
            <p className="text-gray-600 dark:text-gray-400">您可以访问以下资源</p>
          </div>

          <div className="space-y-4">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.target_url}
                className="block p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition">
                      <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {resource.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{resource.target_url}</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <a href="/verify" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              返回验证页面
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

