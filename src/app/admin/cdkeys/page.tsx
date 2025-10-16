'use client';

import { useEffect, useState } from 'react';
import type { CDKeyListItem, Resource, ApiResponse } from '@/types/database';

export default function CdkeysPage() {
  const [cdkeys, setCdkeys] = useState<CDKeyListItem[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    count: 1,
    resource_ids: [] as string[],
    max_uses: 1,
    expired_days: 30,
    note: ''
  });

  useEffect(() => {
    loadData();
  }, [searchKeyword, filterStatus]);

  const loadData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const [cdkeysRes, resourcesRes] = await Promise.all([
        fetch(`/api/admin/cdkeys?keyword=${searchKeyword}&status=${filterStatus}`, {
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
    }
  };

  const handleGenerateCdkeys = async () => {
    if (generateForm.resource_ids.length === 0) {
      alert('请至少选择一个资源');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      const response = await fetch('/api/admin/cdkeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(generateForm),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        alert(`成功生成 ${generateForm.count} 个卡密`);
        setShowGenerateModal(false);
        setGenerateForm({
          count: 1,
          resource_ids: [],
          max_uses: 1,
          expired_days: 30,
          note: ''
        });
        loadData();
      } else {
        alert(data.error?.message || '生成失败');
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCdkey = async (id: string) => {
    if (!confirm('确定要删除这个卡密吗？')) return;

    const token = localStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/admin/cdkeys?id=${id}`, {
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
      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="搜索卡密..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          >
            <option value="">所有状态</option>
            <option value="active">激活</option>
            <option value="used">已用</option>
            <option value="disabled">禁用</option>
          </select>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
          >
            刷新
          </button>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-indigo-400 transition shadow-lg shadow-indigo-500/30"
        >
          + 生成卡密
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-xl shadow-lg ring-1 ring-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">卡密</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">使用次数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">资源</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {cdkeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-sm text-zinc-400 text-center">
                    暂无数据
                  </td>
                </tr>
              ) : (
                cdkeys.map((cdkey) => (
                  <tr key={cdkey.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-white">{cdkey.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(cdkey.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {cdkey.current_uses} / {cdkey.max_uses === -1 ? '∞' : cdkey.max_uses}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      <div className="max-w-xs truncate">{cdkey.resource_count} 个资源</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      {formatTimestamp(cdkey.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteCdkey(cdkey.id)}
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

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-md w-full ring-1 ring-zinc-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">生成卡密</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">生成数量</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateForm.count}
                  onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">选择资源</label>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-lg p-3">
                  {resources.map((resource) => (
                    <label key={resource.id} className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 p-2 rounded transition">
                      <input
                        type="checkbox"
                        checked={generateForm.resource_ids.includes(resource.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGenerateForm({ ...generateForm, resource_ids: [...generateForm.resource_ids, resource.id] });
                          } else {
                            setGenerateForm({ ...generateForm, resource_ids: generateForm.resource_ids.filter(id => id !== resource.id) });
                          }
                        }}
                        className="rounded border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-white">{resource.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">最大使用次数</label>
                <input
                  type="number"
                  min="-1"
                  value={generateForm.max_uses}
                  onChange={(e) => setGenerateForm({ ...generateForm, max_uses: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
                <p className="text-xs text-zinc-500 mt-1">-1 表示无限次</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">有效期（天）</label>
                <input
                  type="number"
                  min="1"
                  value={generateForm.expired_days}
                  onChange={(e) => setGenerateForm({ ...generateForm, expired_days: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">备注</label>
                <textarea
                  value={generateForm.note}
                  onChange={(e) => setGenerateForm({ ...generateForm, note: e.target.value })}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                取消
              </button>
              <button
                onClick={handleGenerateCdkeys}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-500/30"
              >
                {loading ? '生成中...' : '生成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


