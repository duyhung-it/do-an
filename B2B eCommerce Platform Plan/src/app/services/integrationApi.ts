// ============================================================
// Service API — Trung tâm tích hợp / Integration Hub (Nhóm 43)
// ============================================================

import type {
  Integration, IntegrationType, IntegrationStatus,
  WebhookEndpoint, APIKey,
} from '../types';

function delay(ms = 200): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export const WEBHOOK_EVENTS = [
  'order.created', 'order.updated', 'order.cancelled',
  'payment.received', 'shipment.updated',
  'rfq.received', 'inventory.low',
] as const;

// --- Mock Integrations (8) ---
let mockIntegrations: Integration[] = [
  { id: 'int-01', name: 'SAP ERP', type: 'ERP', status: 'Đã kết nối', description: 'Đồng bộ đơn hàng & tồn kho với SAP', lastSyncAt: '2026-03-15T08:30:00Z', syncFrequency: '15 phút', companyId: 'comp-001', createdAt: '2025-06-01' },
  { id: 'int-02', name: 'QuickBooks', type: 'Kế toán', status: 'Đã kết nối', description: 'Tự động xuất hoá đơn sang QuickBooks', lastSyncAt: '2026-03-15T09:00:00Z', syncFrequency: '1 giờ', companyId: 'comp-001', createdAt: '2025-07-15' },
  { id: 'int-03', name: 'Salesforce', type: 'CRM', status: 'Ngắt kết nối', description: 'Đồng bộ khách hàng & cơ hội bán hàng', lastSyncAt: '2026-02-28T10:00:00Z', syncFrequency: '30 phút', companyId: 'comp-001', createdAt: '2025-08-01' },
  { id: 'int-04', name: 'Gmail / SMTP', type: 'Email', status: 'Đã kết nối', description: 'Gửi email thông báo qua Gmail', lastSyncAt: '2026-03-15T10:00:00Z', syncFrequency: 'Realtime', companyId: 'comp-001', createdAt: '2025-06-15' },
  { id: 'int-05', name: 'GHN Express', type: 'Vận chuyển', status: 'Đã kết nối', description: 'Tạo đơn vận chuyển & tracking tự động', lastSyncAt: '2026-03-15T07:45:00Z', syncFrequency: '5 phút', companyId: 'comp-001', createdAt: '2025-09-01' },
  { id: 'int-06', name: 'VNPay', type: 'Thanh toán', status: 'Lỗi', description: 'Cổng thanh toán VNPay — đang lỗi kết nối', lastSyncAt: '2026-03-14T23:00:00Z', syncFrequency: 'Realtime', companyId: 'comp-001', createdAt: '2025-10-01' },
  { id: 'int-07', name: 'Slack', type: 'Chat', status: 'Chưa cài đặt', description: 'Nhận thông báo đơn hàng & cảnh báo trên Slack', companyId: 'comp-001', createdAt: '2026-01-01' },
  { id: 'int-08', name: 'Custom API', type: 'Custom API', status: 'Chưa cài đặt', description: 'Kết nối hệ thống nội bộ qua REST API tuỳ chỉnh', companyId: 'comp-001', createdAt: '2026-01-01' },
];

// --- Mock Webhooks (4) ---
let mockWebhooks: WebhookEndpoint[] = [
  { id: 'wh-01', name: 'ERP Sync', url: 'https://erp.example.com/webhooks/orders', events: ['order.created', 'order.updated'], isActive: true, lastTriggeredAt: '2026-03-15T08:30:00Z', companyId: 'comp-001', createdAt: '2025-06-01' },
  { id: 'wh-02', name: 'Inventory Alert', url: 'https://slack.example.com/hooks/inventory', events: ['inventory.low'], isActive: true, lastTriggeredAt: '2026-03-14T14:00:00Z', companyId: 'comp-001', createdAt: '2025-08-01' },
  { id: 'wh-03', name: 'Payment Notify', url: 'https://accounting.example.com/hooks/payment', events: ['payment.received'], isActive: true, lastTriggeredAt: '2026-03-15T09:15:00Z', companyId: 'comp-001', createdAt: '2025-09-10' },
  { id: 'wh-04', name: 'Legacy System', url: 'https://legacy.internal.com/api/hooks', events: ['order.created', 'order.cancelled', 'rfq.received'], isActive: false, companyId: 'comp-001', createdAt: '2025-07-20' },
];

// --- Mock API Keys (3) ---
let mockAPIKeys: APIKey[] = [
  { id: 'ak-01', name: 'Production Key', keyMasked: 'sk_live_...4xRm', permissions: ['read:orders', 'write:orders', 'read:products', 'read:inventory'], isActive: true, lastUsedAt: '2026-03-15T10:00:00Z', companyId: 'comp-001', createdAt: '2025-06-01' },
  { id: 'ak-02', name: 'Staging Key', keyMasked: 'sk_test_...9bKp', permissions: ['read:orders', 'read:products'], isActive: true, lastUsedAt: '2026-03-10T16:00:00Z', expiresAt: '2026-12-31', companyId: 'comp-001', createdAt: '2025-08-01' },
  { id: 'ak-03', name: 'Mobile App Key', keyMasked: 'sk_live_...2fNj', permissions: ['read:products', 'read:inventory'], isActive: false, lastUsedAt: '2026-01-15T09:00:00Z', companyId: 'comp-001', createdAt: '2025-10-01' },
];

// --- Mock Sync History ---
interface SyncLog {
  id: string;
  integrationId: string;
  integrationName: string;
  action: string;
  status: 'ok' | 'error';
  errorDetail?: string;
  timestamp: string;
}

const mockSyncHistory: SyncLog[] = [
  { id: 'sl-01', integrationId: 'int-01', integrationName: 'SAP ERP', action: 'Đồng bộ đơn hàng', status: 'ok', timestamp: '2026-03-15T08:30:00Z' },
  { id: 'sl-02', integrationId: 'int-02', integrationName: 'QuickBooks', action: 'Xuất hoá đơn INV-2026-048', status: 'ok', timestamp: '2026-03-15T09:00:00Z' },
  { id: 'sl-03', integrationId: 'int-06', integrationName: 'VNPay', action: 'Kiểm tra kết nối', status: 'error', errorDetail: 'Connection timeout (30s)', timestamp: '2026-03-14T23:00:00Z' },
  { id: 'sl-04', integrationId: 'int-05', integrationName: 'GHN Express', action: 'Tạo đơn VĐ #GHN123456', status: 'ok', timestamp: '2026-03-15T07:45:00Z' },
  { id: 'sl-05', integrationId: 'int-04', integrationName: 'Gmail / SMTP', action: 'Gửi email xác nhận đơn', status: 'ok', timestamp: '2026-03-15T10:00:00Z' },
  { id: 'sl-06', integrationId: 'int-01', integrationName: 'SAP ERP', action: 'Đồng bộ tồn kho', status: 'ok', timestamp: '2026-03-15T08:15:00Z' },
  { id: 'sl-07', integrationId: 'int-06', integrationName: 'VNPay', action: 'Xử lý thanh toán', status: 'error', errorDetail: 'API trả về mã 503', timestamp: '2026-03-14T22:00:00Z' },
  { id: 'sl-08', integrationId: 'int-03', integrationName: 'Salesforce', action: 'Đồng bộ khách hàng', status: 'ok', timestamp: '2026-02-28T10:00:00Z' },
];

export interface IntegrationStats {
  activeConnections: number;
  totalWebhooks: number;
  totalAPIKeys: number;
  syncThisMonth: number;
  recentErrors: number;
}

// --- Public API ---
export const integrationApi = {
  async getAll(typeFilter?: IntegrationType, statusFilter?: IntegrationStatus, search?: string): Promise<Integration[]> {
    await delay();
    let items = [...mockIntegrations];
    if (typeFilter) items = items.filter(i => i.type === typeFilter);
    if (statusFilter) items = items.filter(i => i.status === statusFilter);
    if (search) items = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return items;
  },

  async getById(id: string): Promise<Integration | null> {
    await delay(100);
    return mockIntegrations.find(i => i.id === id) || null;
  },

  async connect(id: string, configData: Record<string, string>): Promise<Integration> {
    await delay(500);
    const idx = mockIntegrations.findIndex(i => i.id === id);
    if (idx !== -1) {
      mockIntegrations[idx] = {
        ...mockIntegrations[idx],
        status: 'Đã kết nối',
        configData,
        lastSyncAt: new Date().toISOString(),
      };
    }
    return mockIntegrations[idx];
  },

  async disconnect(id: string): Promise<Integration> {
    await delay(300);
    const idx = mockIntegrations.findIndex(i => i.id === id);
    if (idx !== -1) {
      mockIntegrations[idx] = { ...mockIntegrations[idx], status: 'Ngắt kết nối' };
    }
    return mockIntegrations[idx];
  },

  async test(id: string): Promise<{ ok: boolean; message: string; latency: number }> {
    await delay(800);
    const item = mockIntegrations.find(i => i.id === id);
    if (!item || item.status === 'Chưa cài đặt') {
      return { ok: false, message: 'Chưa cài đặt', latency: 0 };
    }
    if (item.status === 'Lỗi') {
      return { ok: false, message: 'Connection timeout', latency: 30000 };
    }
    return { ok: true, message: 'Kết nối thành công', latency: Math.floor(80 + Math.random() * 150) };
  },

  // Webhooks
  async getWebhooks(): Promise<WebhookEndpoint[]> {
    await delay();
    return [...mockWebhooks];
  },

  async createWebhook(data: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    await delay(300);
    const wh: WebhookEndpoint = {
      id: `wh-${Date.now()}`,
      name: data.name || 'Webhook mới',
      url: data.url || '',
      events: data.events || [],
      isActive: true,
      companyId: 'comp-001',
      createdAt: new Date().toISOString(),
    };
    mockWebhooks = [wh, ...mockWebhooks];
    return wh;
  },

  async deleteWebhook(id: string): Promise<boolean> {
    await delay(200);
    const len = mockWebhooks.length;
    mockWebhooks = mockWebhooks.filter(w => w.id !== id);
    return mockWebhooks.length < len;
  },

  // API Keys
  async getAPIKeys(): Promise<APIKey[]> {
    await delay();
    return [...mockAPIKeys];
  },

  async createAPIKey(data: Partial<APIKey>): Promise<APIKey & { fullKey: string }> {
    await delay(300);
    const rand = () => Math.random().toString(36).slice(2, 6);
    const fullKey = `sk_live_${rand()}${rand()}${rand()}${rand()}`;
    const key: APIKey = {
      id: `ak-${Date.now()}`,
      name: data.name || 'API Key mới',
      keyMasked: `sk_live_...${fullKey.slice(-4)}`,
      permissions: data.permissions || [],
      expiresAt: data.expiresAt,
      isActive: true,
      companyId: 'comp-001',
      createdAt: new Date().toISOString(),
    };
    mockAPIKeys = [key, ...mockAPIKeys];
    return { ...key, fullKey };
  },

  async revokeAPIKey(id: string): Promise<boolean> {
    await delay(200);
    const idx = mockAPIKeys.findIndex(k => k.id === id);
    if (idx !== -1) {
      mockAPIKeys[idx] = { ...mockAPIKeys[idx], isActive: false };
      return true;
    }
    return false;
  },

  // Sync History
  async getSyncHistory(integrationId?: string): Promise<SyncLog[]> {
    await delay();
    let items = [...mockSyncHistory];
    if (integrationId) items = items.filter(l => l.integrationId === integrationId);
    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return items;
  },

  // Stats
  async getStats(): Promise<IntegrationStats> {
    await delay(100);
    return {
      activeConnections: mockIntegrations.filter(i => i.status === 'Đã kết nối').length,
      totalWebhooks: mockWebhooks.filter(w => w.isActive).length,
      totalAPIKeys: mockAPIKeys.filter(k => k.isActive).length,
      syncThisMonth: 1_247,
      recentErrors: mockSyncHistory.filter(l => l.status === 'error').length,
    };
  },
};
