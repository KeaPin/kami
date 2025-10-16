// 数据库连接工具

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createConnection } from 'mysql2/promise';
import type { Connection } from 'mysql2/promise';

export interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
  DEFAULT_ADMIN_USERNAME: string;
  DEFAULT_ADMIN_PASSWORD: string;
}

/**
 * 创建数据库连接（按照官方 Hyperdrive 示例）
 * 每次请求创建新连接，而非使用连接池
 */
export async function getDB(): Promise<Connection> {
  try {
    const context = getCloudflareContext();
    const env = context.env as any;
    
    console.log('=== 开始创建数据库连接 ===');
    console.log('环境信息:', {
      hasHyperdrive: !!env.HYPERDRIVE,
      hyperdriveHost: env.HYPERDRIVE?.host,
      hyperdrivePort: env.HYPERDRIVE?.port,
      hyperdriveDatabase: env.HYPERDRIVE?.database,
    });
    
    // 使用 Hyperdrive 连接
    if (env.HYPERDRIVE) {
      console.log('使用 Hyperdrive 连接配置');
      
      const connectionConfig = {
        host: env.HYPERDRIVE.host,
        user: env.HYPERDRIVE.user,
        password: env.HYPERDRIVE.password,
        database: env.HYPERDRIVE.database,
        port: env.HYPERDRIVE.port,
        disableEval: true,
      };
      
      console.log('连接配置（隐藏密码）:', {
        host: connectionConfig.host,
        user: connectionConfig.user,
        database: connectionConfig.database,
        port: connectionConfig.port,
        disableEval: connectionConfig.disableEval,
      });
      
      const connection = await createConnection(connectionConfig);
      console.log('✓ Hyperdrive 数据库连接已建立');
      return connection;
    } else {
      // 直接连接（备用方案）
      console.log('⚠ Hyperdrive 不可用，使用直接连接');
      
      const connectionConfig = {
        host: '1.12.227.13',
        port: 3306,
        user: 'kami',
        password: 'zmnRHsNwzXpZkGH4',
        database: 'kami',
        disableEval: true,
      };
      
      const connection = await createConnection(connectionConfig);
      console.log('✓ 直连数据库连接已建立');
      return connection;
    }
  } catch (error: any) {
    console.error('✗ 数据库连接失败');
    console.error('错误类型:', error?.constructor?.name);
    console.error('错误消息:', error?.message);
    console.error('错误堆栈:', error?.stack);
    console.error('错误对象:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
}

export function getEnv(): Env {
  const context = getCloudflareContext();
  const env = context.env as any;
  
  return {
    HYPERDRIVE: env.HYPERDRIVE,
    JWT_SECRET: env.JWT_SECRET || 'your-secret-key-please-change-in-production',
    DEFAULT_ADMIN_USERNAME: env.DEFAULT_ADMIN_USERNAME || 'admin',
    DEFAULT_ADMIN_PASSWORD: env.DEFAULT_ADMIN_PASSWORD || 'admin123',
  };
}

// 执行查询（自动管理连接）
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const connection = await getDB();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    // 确保连接被关闭
    await connection.end();
  }
}

// 执行单个查询
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

// 执行更新/插入（返回结果信息）
export async function execute(sql: string, params: any[] = []): Promise<any> {
  const connection = await getDB();
  try {
    const [result] = await connection.execute(sql, params);
    return result;
  } finally {
    // 确保连接被关闭
    await connection.end();
  }
}

// 执行事务
export async function transaction(operations: ((conn: Connection) => Promise<void>)[]): Promise<void> {
  const connection = await getDB();
  
  try {
    await connection.beginTransaction();
    
    for (const operation of operations) {
      await operation(connection);
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    // 确保连接被关闭
    await connection.end();
  }
}

// 获取当前时间戳（秒）
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
