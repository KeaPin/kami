// 资源管理 API

import { NextRequest, NextResponse } from 'next/server';
import { query, execute, getCurrentTimestamp } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';
import { generateId } from '@/lib/cdkey';
import type { Resource, ApiResponse } from '@/types/database';

// 获取资源列表
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

    const resources = await query<Resource>(
      'SELECT * FROM resources ORDER BY created_at DESC'
    );

    return NextResponse.json<ApiResponse<Resource[]>>({
      success: true,
      data: resources
    });

  } catch (error) {
    console.error('获取资源列表错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误'
      }
    }, { status: 500 });
  }
}

// 创建资源
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

    const body = await request.json() as { name?: string; target_url?: string };
    const { name, target_url } = body;

    if (!name || !target_url) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: '资源名称和目标地址不能为空'
        }
      }, { status: 400 });
    }

    const resourceId = generateId();
    const currentTime = getCurrentTimestamp();

    await execute(
      'INSERT INTO resources (id, name, target_url, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [resourceId, name, target_url, 'active', currentTime]
    );

    const resource: Resource = {
      id: resourceId,
      name,
      target_url,
      status: 'active',
      created_at: currentTime
    };

    return NextResponse.json<ApiResponse<Resource>>({
      success: true,
      data: resource
    });

  } catch (error) {
    console.error('创建资源错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误'
      }
    }, { status: 500 });
  }
}

// 删除资源
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
    const resourceId = searchParams.get('id');

    if (!resourceId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'MISSING_ID',
          message: '资源ID不能为空'
        }
      }, { status: 400 });
    }

    await execute('DELETE FROM resources WHERE id = ?', [resourceId]);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { deleted: true }
    });

  } catch (error) {
    console.error('删除资源错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误'
      }
    }, { status: 500 });
  }
}

