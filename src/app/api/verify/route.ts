// 卡密验证 API

import { NextRequest, NextResponse } from 'next/server';
import { query, execute, getCurrentTimestamp } from '@/lib/db';
import { generateId, formatCardCode, validateCardCodeFormat } from '@/lib/cdkey';
import type { CDKey, Resource, ApiResponse, VerifyResult } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cardKey?: string };
    const { cardKey } = body;

    if (!cardKey) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'MISSING_CARD_KEY',
          message: '请输入卡密'
        }
      }, { status: 400 });
    }

    // 格式化和验证卡密
    const formattedKey = formatCardCode(cardKey);
    if (!validateCardCodeFormat(formattedKey)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: '卡密格式不正确'
        }
      }, { status: 400 });
    }

    const currentTime = getCurrentTimestamp();

    // 查询卡密及其关联的资源
    const results = await query<CDKey & { resource_id: string; resource_name: string; target_url: string; resource_status: string }>(
      `SELECT 
        c.id, c.code, c.status, c.max_uses, c.current_uses, c.expired_at,
        r.id as resource_id, r.name as resource_name, r.target_url, r.status as resource_status
      FROM cdkeys c
      INNER JOIN cdkey_resources cr ON c.id = cr.cdkey_id
      INNER JOIN resources r ON cr.resource_id = r.id
      WHERE c.code = ?
        AND c.status = 'active'
        AND r.status = 'active'
        AND (c.expired_at IS NULL OR c.expired_at > ?)`,
      [formattedKey, currentTime]
    );

    if (results.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CARD',
          message: '卡密无效、已过期或已被使用'
        }
      }, { status: 404 });
    }

    const cdkey = results[0];

    // 检查使用次数
    if (cdkey.max_uses !== -1 && cdkey.current_uses >= cdkey.max_uses) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'USED_UP',
          message: '卡密使用次数已达上限'
        }
      }, { status: 403 });
    }

    // 获取客户端IP
    const ip = request.headers.get('cf-connecting-ip') || 
               request.headers.get('x-forwarded-for') || 
               'unknown';

    // 更新使用次数和记录日志
    const newUses = cdkey.current_uses + 1;
    const newStatus = cdkey.max_uses !== -1 && newUses >= cdkey.max_uses ? 'used' : 'active';

    await execute(
      `UPDATE cdkeys 
       SET current_uses = ?, status = ?
       WHERE id = ?`,
      [newUses, newStatus, cdkey.id]
    );

    // 记录使用日志
    for (const result of results) {
      await execute(
        `INSERT INTO usage_logs (id, cdkey_id, resource_id, success, ip_address, used_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [generateId(), cdkey.id, result.resource_id, true, ip, currentTime]
      );
    }

    // 构建资源列表
    const resources: Resource[] = results.map(r => ({
      id: r.resource_id,
      name: r.resource_name,
      target_url: r.target_url,
      status: r.resource_status as 'active' | 'disabled',
      created_at: 0
    }));

    const verifyResult: VerifyResult = {
      cdkey: {
        id: cdkey.id,
        code: cdkey.code,
        status: newStatus as 'active' | 'used' | 'disabled',
        max_uses: cdkey.max_uses,
        current_uses: newUses,
        expired_at: cdkey.expired_at,
        note: null,
        created_at: 0
      },
      resources
    };

    return NextResponse.json<ApiResponse<VerifyResult>>({
      success: true,
      data: verifyResult
    });

  } catch (error) {
    console.error('卡密验证错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误，请稍后重试'
      }
    }, { status: 500 });
  }
}

