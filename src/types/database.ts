// 数据库表类型定义

export interface Resource {
  id: string;
  name: string;
  target_url: string;
  status: 'active' | 'disabled';
  created_at: number;
}

export interface CDKey {
  id: string;
  code: string;
  status: 'active' | 'used' | 'disabled';
  max_uses: number;
  current_uses: number;
  expired_at: number | null;
  note: string | null;
  created_at: number;
}

export interface CDKeyResource {
  id: string;
  cdkey_id: string;
  resource_id: string;
  created_at: number;
}

export interface UsageLog {
  id: string;
  cdkey_id: string;
  resource_id: string | null;
  success: boolean;
  ip_address: string | null;
  used_at: number;
}

export interface Admin {
  id: string;
  username: string;
  password_hash: string;
  created_at: number;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 卡密验证结果
export interface VerifyResult {
  cdkey: CDKey;
  resources: Resource[];
}

// 卡密列表项（包含资源统计）
export interface CDKeyListItem extends CDKey {
  resource_count: number;
  resource_names: string | null;
}

// 生成卡密选项
export interface GenerateCDKeyOptions {
  count: number;
  resource_ids: string[];
  max_uses: number;
  expired_days?: number;
  note?: string;
}

