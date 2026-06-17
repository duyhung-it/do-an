export type NormalizedRole = 'ADMIN' | 'CUSTOMER' | 'SUPPLIER' | '';

const ADMIN_ROLES = new Set([
  'ADMIN',
  'QUAN_TRI_VIEN',
  'QUAN TRỊ VIÊN',
  'QUẢN TRỊ VIÊN',
  'QUáº£N TRá»‹ VIÃªN',
  'QUẢN TRỊ VIÊN',
]);

const CUSTOMER_ROLES = new Set([
  'CUSTOMER',
  'BUYER',
  'NGUOI_MUA',
  'KHACH_HANG',
  'KHÁCH HÀNG',
  'KHÃ¡CH HÃ NG',
]);

const SUPPLIER_ROLES = new Set([
  'SUPPLIER',
  'SELLER',
  'NHA_CUNG_CAP',
  'NHÀ CUNG CẤP',
  'NHÃ  CUNG Cáº¥P',
]);

export function normalizeRole(role?: string | null): NormalizedRole {
  const value = String(role ?? '').trim();
  if (!value) return '';

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, '_')
    .toUpperCase();
  const upper = value.toUpperCase();

  if (ADMIN_ROLES.has(upper) || ADMIN_ROLES.has(normalized)) return 'ADMIN';
  if (CUSTOMER_ROLES.has(upper) || CUSTOMER_ROLES.has(normalized)) return 'CUSTOMER';
  if (SUPPLIER_ROLES.has(upper) || SUPPLIER_ROLES.has(normalized)) return 'SUPPLIER';

  return '';
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === 'ADMIN';
}

