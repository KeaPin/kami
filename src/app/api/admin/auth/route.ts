// 管理员登录 API

import { NextRequest, NextResponse } from 'next/server';
import { query, execute, getCurrentTimestamp } from '@/lib/db';
import { generateToken, verifyPassword, hashPassword } from '@/lib/auth';
import { generateId } from '@/lib/cdkey';
import { getEnv } from '@/lib/db';
import type { Admin, ApiResponse } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: '请输入用户名和密码'
        }
      }, { status: 400 });
    }

    // 查询管理员
    const admin = await query<Admin>(
      'SELECT * FROM admins WHERE username = ? LIMIT 1',
      [username]
    );

    // 如果没有管理员，检查是否为默认管理员并初始化
    if (admin.length === 0) {
      const env = getEnv();
      
      // 检查是否为默认管理员凭据
      if (username === env.DEFAULT_ADMIN_USERNAME && password === env.DEFAULT_ADMIN_PASSWORD) {
        // 创建默认管理员
        const adminId = generateId();
        const passwordHash = await hashPassword(password);
        const currentTime = getCurrentTimestamp();

        await execute(
          'INSERT INTO admins (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)',
          [adminId, username, passwordHash, currentTime]
        );

        // 生成 Token
        const token = await generateToken(adminId, username);

        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            token,
            username,
            expiresIn: 7 * 24 * 60 * 60
          }
        });
      }

      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      }, { status: 401 });
    }

    // 验证密码
    const isValid = await verifyPassword(password, admin[0].password_hash);
    if (!isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名或密码错误'
        }
      }, { status: 401 });
    }

    // 生成 Token
    const token = await generateToken(admin[0].id, admin[0].username);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        token,
        username: admin[0].username,
        expiresIn: 7 * 24 * 60 * 60
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: '服务器错误，请稍后重试'
      }
    }, { status: 500 });
  }
}

