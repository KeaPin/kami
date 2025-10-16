// 认证工具

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { getEnv } from './db';

const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // 7天

export interface JWTPayload {
  adminId: string;
  username: string;
  iat: number;
  exp: number;
}

// 生成 JWT Token
export async function generateToken(adminId: string, username: string): Promise<string> {
  const env = getEnv();
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  
  const token = await new SignJWT({ adminId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRES_IN}s`)
    .sign(secret);
  
  return token;
}

// 验证 JWT Token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const env = getEnv();
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// 从请求头获取并验证 Token
export async function getAdminFromRequest(request: Request): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return await verifyToken(token);
}

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// 检查是否需要初始化管理员
export async function shouldInitializeAdmin(adminExists: boolean): Promise<boolean> {
  return !adminExists;
}

