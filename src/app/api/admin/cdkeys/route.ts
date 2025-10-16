// 卡密管理 API

import { NextRequest, NextResponse } from 'next/server';
import { query, execute, getCurrentTimestamp } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';
import { generateId, generateCardCode, calculateExpiredTimestamp } from '@/lib/cdkey';
import type { CDKey, CDKeyListItem, GenerateCDKeyOptions, ApiResponse } from '@/types/database';

// 获取卡密列表
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权，请先登录'
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const status = searchParams.get('status') || '';

    let sql = `
      SELECT 
        c.*,
        COUNT(DISTINCT cr.resource_id) as resource_count,
        GROUP_CONCAT(DISTINCT r.name SEPARATOR ', ') as resource_names
      FROM cdkeys c
      LEFT JOIN cdkey_resources cr ON c.id = cr.cdkey_id
      LEFT JOIN resources r ON cr.resource_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (keyword) {
      sql += ' AND c.code LIKE ?';
      params.push(`%${keyword}%`);
    }

    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    sql += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const cdkeys = await query<CDKeyListItem>(sql, params);

    return NextResponse.json<ApiResponse<CDKeyListItem[]>>({
      success: true,
      data: cdkeys
    });

  } catch (error) {
    console.error('获取卡密列表错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误'
      }
    }, { status: 500 });
  }
}

// 生成卡密
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权，请先登录'
        }
      }, { status: 401 });
    }

    const body: GenerateCDKeyOptions = await request.json();
    const { count, resource_ids, max_uses, expired_days, note } = body;

    if (!count || count < 1 || count > 100) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_COUNT',
          message: '生成数量必须在1-100之间'
        }
      }, { status: 400 });
    }

    if (!resource_ids || resource_ids.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'MISSING_RESOURCES',
          message: '请至少选择一个资源'
        }
      }, { status: 400 });
    }

    const currentTime = getCurrentTimestamp();
    const expiredAt = expired_days ? calculateExpiredTimestamp(expired_days) : null;
    const generatedKeys: CDKey[] = [];

    // 批量生成卡密
    for (let i = 0; i < count; i++) {
      const cdkeyId = generateId();
      const code = generateCardCode();

      await execute(
        `INSERT INTO cdkeys (id, code, status, max_uses, current_uses, expired_at, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cdkeyId, code, 'active', max_uses, 0, expiredAt, note || null, currentTime]
      );

      // 关联资源
      for (const resourceId of resource_ids) {
        await execute(
          'INSERT INTO cdkey_resources (id, cdkey_id, resource_id, created_at) VALUES (?, ?, ?, ?)',
          [generateId(), cdkeyId, resourceId, currentTime]
        );
      }

      generatedKeys.push({
        id: cdkeyId,
        code,
        status: 'active',
        max_uses,
        current_uses: 0,
        expired_at: expiredAt,
        note: note || null,
        created_at: currentTime
      });
    }

    return NextResponse.json<ApiResponse<CDKey[]>>({
      success: true,
      data: generatedKeys
    });

  } catch (error) {
    console.error('生成卡密错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误'
      }
    }, { status: 500 });
  }
}

// 删除卡密
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未授权，请先登录'
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cdkeyId = searchParams.get('id');

    if (!cdkeyId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'MISSING_ID',
          message: '卡密ID不能为空'
        }
      }, { status: 400 });
    }

    await execute('DELETE FROM cdkeys WHERE id = ?', [cdkeyId]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true }
    });

  } catch (error) {
    console.error('删除卡密错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误'
      }
    }, { status: 500 });
  }
}

