// 卡密生成工具

import { nanoid, customAlphabet } from 'nanoid';

// 生成卡密码（格式：KAMI-XXXX-XXXX-XXXX）
export function generateCardCode(): string {
  // 使用自定义字母表，避免易混淆的字符
  const alphabet = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 去掉 I O
  const generate = customAlphabet(alphabet, 4);
  
  const part1 = generate();
  const part2 = generate();
  const part3 = generate();
  
  return `KAMI-${part1}-${part2}-${part3}`;
}

// 生成唯一ID
export function generateId(): string {
  return nanoid(32);
}

// 格式化卡密（添加分隔符）
export function formatCardCode(code: string): string {
  // 移除所有非字母数字字符
  const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // 如果是KAMI开头，格式化为 KAMI-XXXX-XXXX-XXXX
  if (cleaned.startsWith('KAMI') && cleaned.length >= 16) {
    const kami = cleaned.substring(0, 4);
    const part1 = cleaned.substring(4, 8);
    const part2 = cleaned.substring(8, 12);
    const part3 = cleaned.substring(12, 16);
    return `${kami}-${part1}-${part2}-${part3}`;
  }
  
  return cleaned;
}

// 验证卡密格式
export function validateCardCodeFormat(code: string): boolean {
  const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  // 必须是KAMI开头，总共16个字符
  return cleaned.startsWith('KAMI') && cleaned.length === 16;
}

// 计算过期时间戳
export function calculateExpiredTimestamp(days: number): number {
  return Math.floor(Date.now() / 1000) + (days * 24 * 60 * 60);
}

