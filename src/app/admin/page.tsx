'use client';

import { useEffect, useState } from 'react';
import type { CDKeyListItem, Resource, ApiResponse } from '@/types/database';

export default function AdminDashboard() {
  const [cdkeys, setCdkeys] = useState<CDKeyListItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const [cdkeysRes, resourcesRes] = await Promise.all([
        fetch('/api/admin/cdkeys', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/resources', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const cdkeysData: ApiResponse<CDKeyListItem[]> = await cdkeysRes.json();
      const resourcesData: ApiResponse<Resource[]> = await resourcesRes.json();

      if (cdkeysData.success && cdkeysData.data) {
        setCdkeys(cdkeysData.data);
      }
      if (resourcesData.success && resourcesData.data) {
        setResources(resourcesData.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts * 1000).toLocaleString('zh-CN');
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">管理面板</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  刷新中...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  刷新数据
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-lg ring-1 ring-zinc-700/50 transition-all duration-200 hover:ring-indigo-500/50 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">总卡密数</p>
              <p className="mt-2 text-3xl font-bold text-white">{loading ? '--' : cdkeys.length}</p>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-400 font-medium">+{cdkeys.filter(k => k.status === 'active').length}</span>
                <span className="text-zinc-500 ml-1">激活中</span>
              </div>
            </div>
            <div className="rounded-lg bg-indigo-500/20 p-3 ring-1 ring-indigo-500/30">
              <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <a href="/admin/cdkeys" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center group-hover:text-indigo-300 transition-colors">
              查看全部
              <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-lg ring-1 ring-zinc-700/50 transition-all duration-200 hover:ring-emerald-500/50 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">总资源数</p>
              <p className="mt-2 text-3xl font-bold text-white">{loading ? '--' : resources.length}</p>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-400 font-medium">+{resources.filter(r => r.status === 'active').length}</span>
                <span className="text-zinc-500 ml-1">可用</span>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-500/20 p-3 ring-1 ring-emerald-500/30">
              <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <a href="/admin/resources" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 flex items-center group-hover:text-emerald-300 transition-colors">
              查看全部
              <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-lg ring-1 ring-zinc-700/50 transition-all duration-200 hover:ring-cyan-500/50 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">激活卡密</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? '--' : cdkeys.filter(k => k.status === 'active').length}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-zinc-500">可正常使用</span>
              </div>
            </div>
            <div className="rounded-lg bg-cyan-500/20 p-3 ring-1 ring-cyan-500/30">
              <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-lg ring-1 ring-zinc-700/50 transition-all duration-200 hover:ring-amber-500/50 hover:shadow-xl hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">已用卡密</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {loading ? '--' : cdkeys.filter(k => k.status === 'used').length}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-zinc-500">已被使用</span>
              </div>
            </div>
            <div className="rounded-lg bg-amber-500/20 p-3 ring-1 ring-amber-500/30">
              <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-zinc-900 shadow-lg rounded-xl ring-1 ring-zinc-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-800">
          <h3 className="text-base font-semibold leading-6 text-white">最近的卡密</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">卡密</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">使用次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">资源数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-zinc-400 text-center">
                    加载中...
                  </td>
                </tr>
              ) : cdkeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-zinc-400 text-center">
                    暂无数据
                  </td>
                </tr>
              ) : (
                cdkeys.slice(0, 10).map((cdkey) => (
                  <tr key={cdkey.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-white">
                      {cdkey.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${
                        cdkey.status === 'active' ? 'bg-green-500/20 text-green-400 ring-green-500/30' :
                        cdkey.status === 'used' ? 'bg-zinc-500/20 text-zinc-400 ring-zinc-500/30' :
                        'bg-red-500/20 text-red-400 ring-red-500/30'
                      }`}>
                        {cdkey.status === 'active' ? '激活' : cdkey.status === 'used' ? '已用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {cdkey.current_uses} / {cdkey.max_uses === -1 ? '∞' : cdkey.max_uses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {cdkey.resource_count} 个
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {formatTimestamp(cdkey.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
