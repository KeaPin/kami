'use client';

import { useEffect, useState } from 'react';
import type { Resource, ApiResponse } from '@/types/database';

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    name: '',
    target_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/resources', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data: ApiResponse<Resource[]> = await response.json();

      if (data.success && data.data) {
        setResources(data.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const handleCreateResource = async () => {
    if (!resourceForm.name || !resourceForm.target_url) {
      alert('请填写资源名称和目标地址');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceForm),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        alert('资源创建成功');
        setShowCreateModal(false);
        setResourceForm({ name: '', target_url: '' });
        loadData();
      } else {
        alert(data.error?.message || '创建失败');
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm('确定要删除这个资源吗？')) return;

    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/admin/resources?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        loadData();
      } else {
        alert(data.error?.message || '删除失败');
      }
    } catch {
      alert('网络错误，请稍后重试');
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts * 1000).toLocaleString('zh-CN');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 ring-green-500/30',
      used: 'bg-zinc-500/20 text-zinc-400 ring-zinc-500/30',
      disabled: 'bg-red-500/20 text-red-400 ring-red-500/30'
    };
    const labels = {
      active: '激活',
      used: '已用',
      disabled: '禁用'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${styles[status as keyof typeof styles] || ''}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Actions */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
          >
            刷新
          </button>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-indigo-400 transition shadow-lg shadow-indigo-500/30"
        >
          + 创建资源
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-xl shadow-lg ring-1 ring-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">目标地址</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-sm text-zinc-400 text-center">
                    暂无数据
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{resource.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={resource.target_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 hover:underline truncate block max-w-md transition-colors"
                      >
                        {resource.target_url}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(resource.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {formatTimestamp(resource.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full ring-1 ring-zinc-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">创建资源</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">资源名称</label>
                <input
                  type="text"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="输入资源名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">目标地址</label>
                <input
                  type="url"
                  value={resourceForm.target_url}
                  onChange={(e) => setResourceForm({ ...resourceForm, target_url: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setResourceForm({ name: '', target_url: '' });
                }}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                取消
              </button>
              <button
                onClick={handleCreateResource}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/30"
              >
                {loading ? '创建中...' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


