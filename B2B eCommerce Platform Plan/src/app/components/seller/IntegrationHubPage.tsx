// ============================================================
// IntegrationHubPage — Trung tâm tích hợp hệ thống (Nhóm 40)
// Cho phép kết nối ERP, kế toán, logistics, WMS từ bên ngoài
// ============================================================

import { useState } from 'react';
import {
  Plug, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle,
  Settings, Plus, Trash2, Eye, EyeOff, Copy, ExternalLink,
  Database, Truck, Calculator, BarChart3, Webhook, Key,
  Activity, Zap, Globe, Lock, Unlock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

// ---- Types ----
type IntegrationStatus = 'Đang kết nối' | 'Ngắt kết nối' | 'Lỗi' | 'Chờ xác nhận';
type IntegrationCategory = 'ERP' | 'Kế toán' | 'Logistics' | 'WMS' | 'CRM' | 'API';

interface Integration {
  id: string;
  name: string;
  logo: string;
  category: IntegrationCategory;
  description: string;
  status: IntegrationStatus;
  lastSync?: string;
  syncCount?: number;
  errorCount?: number;
  webhookUrl?: string;
  apiKey?: string;
  isPopular?: boolean;
}

interface WebhookEvent {
  id: string;
  event: string;
  timestamp: string;
  status: 'Thành công' | 'Thất bại' | 'Đang xử lý';
  payload: string;
}

// ---- Mock data ----
const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: 'int-001', name: 'SAP Business One', logo: '🏢', category: 'ERP',
    description: 'Đồng bộ đơn hàng, tồn kho và hóa đơn với SAP B1',
    status: 'Đang kết nối', lastSync: '2026-04-05T06:00:00Z', syncCount: 1247, errorCount: 3,
    apiKey: 'sk-sap-****************************', isPopular: true,
  },
  {
    id: 'int-002', name: 'Misa AMIS', logo: '📊', category: 'Kế toán',
    description: 'Đồng bộ hóa đơn và chứng từ kế toán với Misa AMIS',
    status: 'Đang kết nối', lastSync: '2026-04-05T05:30:00Z', syncCount: 543, errorCount: 0,
    apiKey: 'mk-misa-****************************', isPopular: true,
  },
  {
    id: 'int-003', name: 'GIAO HÀNG NHANH', logo: '🚚', category: 'Logistics',
    description: 'Tạo vận đơn và theo dõi đơn hàng tự động qua GHN',
    status: 'Đang kết nối', lastSync: '2026-04-05T07:15:00Z', syncCount: 2891, errorCount: 12,
    apiKey: 'ghn-****************************', isPopular: true,
  },
  {
    id: 'int-004', name: 'Giao Hàng Tiết Kiệm', logo: '📦', category: 'Logistics',
    description: 'Tích hợp GHTK cho vận chuyển hàng hóa B2B',
    status: 'Ngắt kết nối', syncCount: 0, errorCount: 0,
  },
  {
    id: 'int-005', name: 'FastExpress', logo: '⚡', category: 'Logistics',
    description: 'Đối tác vận chuyển nhanh khu vực nội thành',
    status: 'Lỗi', lastSync: '2026-04-04T23:00:00Z', syncCount: 456, errorCount: 89,
    apiKey: 'fx-****************************',
  },
  {
    id: 'int-006', name: 'Kiot Viet WMS', logo: '🏭', category: 'WMS',
    description: 'Quản lý kho hàng tích hợp với KiotViet WMS',
    status: 'Chờ xác nhận', syncCount: 0, errorCount: 0,
  },
  {
    id: 'int-007', name: 'HubSpot CRM', logo: '🧲', category: 'CRM',
    description: 'Đồng bộ thông tin khách hàng và cơ hội bán hàng',
    status: 'Ngắt kết nối', syncCount: 0, errorCount: 0, isPopular: true,
  },
  {
    id: 'int-008', name: 'Custom Webhook', logo: '🔗', category: 'API',
    description: 'Tích hợp REST API tùy chỉnh với hệ thống của bạn',
    status: 'Đang kết nối', lastSync: '2026-04-05T07:00:00Z', syncCount: 8234, errorCount: 45,
    webhookUrl: 'https://api.yourcompany.com/webhook/b2b',
    apiKey: 'cw-****************************',
  },
];

const MOCK_WEBHOOK_EVENTS: WebhookEvent[] = [
  { id: 'ev-001', event: 'order.created', timestamp: '2026-04-05T07:15:23Z', status: 'Thành công', payload: '{"orderId":"ord-123","total":15000000}' },
  { id: 'ev-002', event: 'invoice.paid', timestamp: '2026-04-05T06:55:11Z', status: 'Thành công', payload: '{"invoiceId":"inv-456","amount":32000000}' },
  { id: 'ev-003', event: 'shipment.dispatched', timestamp: '2026-04-05T06:30:00Z', status: 'Thất bại', payload: '{"shipmentId":"shp-789","carrier":"GHN"}' },
  { id: 'ev-004', event: 'stock.alert', timestamp: '2026-04-05T06:00:00Z', status: 'Thành công', payload: '{"productId":"prod-321","stock":5}' },
  { id: 'ev-005', event: 'contract.signed', timestamp: '2026-04-05T05:45:00Z', status: 'Đang xử lý', payload: '{"contractId":"con-111"}' },
];

const CATEGORY_ICONS: Record<IntegrationCategory, typeof Plug> = {
  'ERP': Database,
  'Kế toán': Calculator,
  'Logistics': Truck,
  'WMS': Database,
  'CRM': BarChart3,
  'API': Webhook,
};

const STATUS_COLORS: Record<IntegrationStatus, string> = {
  'Đang kết nối': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Ngắt kết nối': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Lỗi': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Chờ xác nhận': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

// ---- Integration Card ----
function IntegrationCard({ integration, onToggle, onConfigure }: {
  integration: Integration;
  onToggle: (id: string) => void;
  onConfigure: (int: Integration) => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const Icon = CATEGORY_ICONS[integration.category];
  const isConnected = integration.status === 'Đang kết nối';

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    setSyncing(false);
    toast.success(`Đã đồng bộ ${integration.name}`);
  };

  return (
    <Card className={`transition-all hover:shadow-md ${integration.status === 'Lỗi' ? 'border-red-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {integration.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{integration.name}</h3>
                {integration.isPopular && (
                  <Badge variant="secondary" className="text-xs py-0">Phổ biến</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{integration.category}</span>
              </div>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[integration.status]}`}>
            {integration.status}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{integration.description}</p>

        {/* Stats */}
        {isConnected && (
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Đã đồng bộ</p>
              <p className="font-medium text-sm">{(integration.syncCount ?? 0).toLocaleString()}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Lỗi</p>
              <p className={`font-medium text-sm ${(integration.errorCount ?? 0) > 0 ? 'text-red-500' : ''}`}>
                {integration.errorCount ?? 0}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Lần cuối</p>
              <p className="font-medium text-xs">{integration.lastSync ? formatRelativeTime(integration.lastSync) : '--'}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button size="sm" variant="outline" className="flex-1" onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Đang đồng bộ...' : 'Đồng bộ'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => onConfigure(integration)}>
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => onToggle(integration.id)}>
                <Unlock className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : integration.status === 'Lỗi' ? (
            <>
              <Button size="sm" className="flex-1" onClick={() => onToggle(integration.id)}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Kết nối lại
              </Button>
              <Button size="sm" variant="outline" onClick={() => onConfigure(integration)}>
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button size="sm" className="flex-1" onClick={() => onToggle(integration.id)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              {integration.status === 'Ngắt kết nối' ? 'Kết nối' : 'Kết nối'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---- Config Dialog ----
function ConfigDialog({ integration, onClose }: { integration: Integration; onClose: () => void }) {
  const [showKey, setShowKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(integration.webhookUrl ?? '');
  const [apiKey, setApiKey] = useState(integration.apiKey ?? '');

  const maskedKey = apiKey.replace(/^(.{8}).*$/, '$1' + '*'.repeat(Math.max(0, apiKey.length - 8)));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{integration.logo}</span>
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <p className="text-sm text-muted-foreground">Cấu hình kết nối</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>✕</Button>
        </div>

        <div className="p-4 space-y-4">
          {/* API Key */}
          <div>
            <label className="text-sm font-medium mb-1 block flex items-center gap-1">
              <Key className="h-3.5 w-3.5" /> API Key
            </label>
            <div className="flex gap-2">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Nhập API Key..."
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Đã sao chép!'); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Webhook URL */}
          <div>
            <label className="text-sm font-medium mb-1 block flex items-center gap-1">
              <Webhook className="h-3.5 w-3.5" /> Webhook URL (Nhận sự kiện)
            </label>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-system.com/webhook"
              />
              {webhookUrl && (
                <Button variant="outline" size="icon" onClick={() => window.open(webhookUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hệ thống sẽ gửi POST request đến URL này khi có sự kiện mới
            </p>
          </div>

          {/* Sync settings */}
          <div className="border rounded-lg p-3 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Cài đặt đồng bộ
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Đồng bộ tự động</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tần suất</span>
              <select className="text-sm border rounded px-2 py-1">
                <option>Mỗi 15 phút</option>
                <option>Mỗi giờ</option>
                <option>Mỗi ngày</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ghi log chi tiết</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            {integration.status === 'Đang kết nối' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : integration.status === 'Lỗi' ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">Trạng thái: {integration.status}</p>
              {integration.lastSync && (
                <p className="text-xs text-muted-foreground">Lần đồng bộ cuối: {formatRelativeTime(integration.lastSync)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t justify-end">
          <Button variant="outline" onClick={onClose}>Huỷ</Button>
          <Button onClick={() => { toast.success('Đã lưu cấu hình'); onClose(); }}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export function IntegrationHubPage({ mode = 'seller' }: { mode?: 'buyer' | 'seller' }) {
  const { user: _user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [filter, setFilter] = useState<IntegrationCategory | 'Tất cả'>('Tất cả');
  const [configTarget, setConfigTarget] = useState<Integration | null>(null);
  const [activeTab, setActiveTab] = useState<'integrations' | 'webhooks' | 'apikeys'>('integrations');

  const breadcrumb = mode === 'seller'
    ? [{ label: 'Kênh người bán', href: '/seller' }, { label: 'Tích hợp hệ thống' }]
    : [{ label: 'Trang chủ', href: '/' }, { label: 'Tích hợp' }];

  const handleToggle = (id: string) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id !== id) return int;
      const next: IntegrationStatus = int.status === 'Đang kết nối' ? 'Ngắt kết nối' : 'Đang kết nối';
      toast.success(next === 'Đang kết nối' ? `Đã kết nối ${int.name}` : `Đã ngắt kết nối ${int.name}`);
      return { ...int, status: next };
    }));
  };

  const categories: (IntegrationCategory | 'Tất cả')[] = ['Tất cả', 'ERP', 'Kế toán', 'Logistics', 'WMS', 'CRM', 'API'];

  const filtered = filter === 'Tất cả' ? integrations : integrations.filter(i => i.category === filter);
  const connectedCount = integrations.filter(i => i.status === 'Đang kết nối').length;
  const errorCount = integrations.filter(i => i.status === 'Lỗi').length;
  const totalSyncs = integrations.reduce((s, i) => s + (i.syncCount ?? 0), 0);

  return (
    <div className="space-y-4">
      <AppBreadcrumb items={breadcrumb} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="h-6 w-6 text-primary" />
            Trung tâm tích hợp
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kết nối ERP, kế toán, logistics và các hệ thống bên ngoài
          </p>
        </div>
        <Button onClick={() => toast.info('Tính năng thêm tích hợp tùy chỉnh sẽ sớm ra mắt!')}>
          <Plus className="h-4 w-4 mr-1" /> Thêm tích hợp
        </Button>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Đang kết nối</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{connectedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Lỗi kết nối</span>
            </div>
            <p className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-600' : ''}`}>{errorCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Tổng đồng bộ</span>
            </div>
            <p className="text-2xl font-bold">{totalSyncs.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Tổng tích hợp</span>
            </div>
            <p className="text-2xl font-bold">{integrations.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Error alert */}
      {errorCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-400">{errorCount} tích hợp đang gặp sự cố</p>
            <p className="text-sm text-red-600/80">Kiểm tra cấu hình API Key và kết nối mạng</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {([
          { key: 'integrations', label: 'Tích hợp', Icon: Plug },
          { key: 'webhooks', label: 'Webhook Log', Icon: Webhook },
          { key: 'apikeys', label: 'API Keys', Icon: Key },
        ] as const).map(({ key, label, Icon }) => (
          <Button
            key={key}
            size="sm"
            variant={activeTab === key ? 'default' : 'ghost'}
            onClick={() => setActiveTab(key)}
          >
            <Icon className="h-3.5 w-3.5 mr-1" /> {label}
          </Button>
        ))}
      </div>

      {/* Tab: Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-3">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                size="sm"
                variant={filter === cat ? 'default' : 'outline'}
                onClick={() => setFilter(cat)}
              >
                {cat !== 'Tất cả' && (() => {
                  const Icon = CATEGORY_ICONS[cat as IntegrationCategory];
                  return <Icon className="h-3.5 w-3.5 mr-1" />;
                })()}
                {cat}
                <span className="ml-1 text-xs opacity-70">
                  ({(cat === 'Tất cả' ? integrations : integrations.filter(i => i.category === cat)).length})
                </span>
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(int => (
              <IntegrationCard
                key={int.id}
                integration={int}
                onToggle={handleToggle}
                onConfigure={setConfigTarget}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Webhook Log */}
      {activeTab === 'webhooks' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" /> Lịch sử Webhook
            </CardTitle>
            <CardDescription>Các sự kiện được gửi đến/từ hệ thống tích hợp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground font-medium border-b">
                <span className="w-36 shrink-0">Sự kiện</span>
                <span className="w-28 shrink-0">Thời gian</span>
                <span className="w-24 shrink-0">Trạng thái</span>
                <span className="flex-1">Payload</span>
              </div>
              {MOCK_WEBHOOK_EVENTS.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30 rounded-lg font-mono text-sm">
                  <span className="w-36 shrink-0 font-medium">{ev.event}</span>
                  <span className="w-28 shrink-0 text-muted-foreground text-xs">
                    {new Date(ev.timestamp).toLocaleTimeString('vi-VN')}
                  </span>
                  <span className="w-24 shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      ev.status === 'Thành công' ? 'bg-green-100 text-green-700' :
                      ev.status === 'Thất bại' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {ev.status}
                    </span>
                  </span>
                  <span className="flex-1 text-xs text-muted-foreground truncate">{ev.payload}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: API Keys */}
      {activeTab === 'apikeys' && (
        <div className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" /> API Keys hệ thống
              </CardTitle>
              <CardDescription>Quản lý key để hệ thống bên ngoài truy cập API của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Production Key', key: 'prod_sk_****************************xyz', scopes: ['read', 'write', 'webhook'], createdAt: '2026-01-15', active: true },
                { name: 'Testing Key', key: 'test_sk_****************************abc', scopes: ['read'], createdAt: '2026-02-01', active: true },
                { name: 'Legacy Key (deprecated)', key: 'old_sk_****************************999', scopes: ['read', 'write'], createdAt: '2025-08-01', active: false },
              ].map((k, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${!k.active ? 'opacity-60' : ''}`}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${k.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {k.active ? <Lock className="h-5 w-5 text-green-600" /> : <Unlock className="h-5 w-5 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{k.name}</p>
                      {!k.active && <Badge variant="outline" className="text-xs">Vô hiệu</Badge>}
                    </div>
                    <p className="text-sm font-mono text-muted-foreground truncate">{k.key}</p>
                    <div className="flex gap-1 mt-1">
                      {k.scopes.map(s => <Badge key={s} variant="secondary" className="text-xs py-0">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">Tạo: {k.createdAt}</p>
                    <div className="flex gap-1 mt-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => { navigator.clipboard.writeText(k.key); toast.success('Đã sao chép!'); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {k.active && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => toast.info('Xác nhận vô hiệu hoá key?')}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full" onClick={() => toast.success('Đã tạo API Key mới!')}>
                <Plus className="h-4 w-4 mr-2" /> Tạo API Key mới
              </Button>
            </CardContent>
          </Card>

          {/* Docs link */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <Globe className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="font-medium">Tài liệu API</p>
                <p className="text-sm text-muted-foreground">Xem tài liệu hướng dẫn tích hợp API RESTful</p>
              </div>
              <Button variant="outline" className="ml-auto shrink-0" onClick={() => toast.info('API docs sẽ sớm ra mắt!')}>
                <ExternalLink className="h-4 w-4 mr-1" /> Xem docs
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Config dialog */}
      {configTarget && <ConfigDialog integration={configTarget} onClose={() => setConfigTarget(null)} />}
    </div>
  );
}
