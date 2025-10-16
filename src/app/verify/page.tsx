'use client';

import { useState, FormEvent } from 'react';
import type { ApiResponse, VerifyResult } from '@/types/database';
import ThemeToggle from '@/components/ThemeToggle';

export default function VerifyPage() {
  const [cardKey, setCardKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatInput = (value: string) => {
    // 移除所有非字母数字字符
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // 自动添加分隔符
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setCardKey(formatted);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!cardKey) {
      setError('请输入卡密');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardKey }),
      });

      const data: ApiResponse<VerifyResult> = await response.json();

      if (data.success && data.data) {
        // 验证成功，跳转到资源页面
        if (data.data.resources.length === 1) {
          // 单个资源直接跳转
          window.location.href = data.data.resources[0].target_url;
        } else {
          // 多个资源显示选择页面
          localStorage.setItem('verified_resources', JSON.stringify(data.data.resources));
          window.location.href = '/resources';
        }
      } else {
        setError(data.error?.message || '验证失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">卡密验证系统</h1>
            <p className="text-gray-600 dark:text-gray-400">请输入您的卡密进行验证</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="cardKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                卡密
              </label>
                <input
                id="cardKey"
                type="text"
                value={cardKey}
                onChange={handleInputChange}
                placeholder="KAMI-XXXX-XXXX-XXXX"
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-center text-lg font-mono tracking-wider bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                格式：KAMI-XXXX-XXXX-XXXX
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-800 dark:text-red-300">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !cardKey}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  验证中...
                </span>
              ) : (
                '验证并跳转'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <a href="/admin" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
              管理后台登录
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

