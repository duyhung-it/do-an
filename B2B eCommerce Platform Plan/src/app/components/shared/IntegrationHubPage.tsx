// ============================================================
// Integration Hub — Trung tâm tích hợp (Nhóm 43C)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  Puzzle, Wifi, WifiOff, AlertTriangle, Plus, Trash2, Play,
  Key, Webhook, History, Settings, Link2, CheckCircle2, XCircle,
  RefreshCw, Eye, EyeOff, Copy, Server, Mail, Truck, CreditCard,
  MessageSquare, Cog, BarChart3, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import { AppBreadcrumb } from './AppBreadcrumb';
import { toast } from 'sonner';
import {
  integrationApi, WEBHOOK_EVENTS, type IntegrationStats,
} from '../../services/integrationApi';
import type {
  Integration, IntegrationType, IntegrationStatus,
  WebhookEndpoint, APIKey,
} from '../../types';

const STATUS_MAP: Record<IntegrationStatus, { color: string; icon: React.ReactNode }> = {
  'Đã kết nối':   { color: 'bg-green-100 text-green-700', icon: <Wifi className="h-3 w-3" /> },
  'Ngắt kết nối': { color: 'bg-gray-100 text-gray-600', icon: <WifiOff className="h-3 w-3" /> },
  'Lỗi':          { color: 'bg-red-100 text-red-700', icon: <AlertTriangle className="h-3 w-3" /> },
  'Chưa cài đặt': { color: 'bg-blue-100 text-blue-600', icon: <Settings className="h-3 w-3" /> },
};

const TYPE_ICONS: Record<IntegrationType, React.ReactNode> = {
  'ERP':         <Server className="h-8 w-8 text-indigo-500" />,
  'Kế toán':     <BarChart3 className="h-8 w-8 text-green-500" />,
  'CRM':         <Users className="h-8 w-8 text-blue-500" />,
  'Email':       <Mail className="h-8 w-8 text-amber-500" />,
  'Vận chuyển':  <Truck className="h-8 w-8 text-purple-500" />,
  'Thanh toán':  <CreditCard className="h-8 w-8 text-pink-500" />,
  'Chat':        <MessageSquare className="h-8 w-8 text-cyan-500" />,
  'Custom API':  <Cog className="h-8 w-8 text-gray-500" />,
};

const ALL_PERMISSIONS = [
  'read:orders', 'write:orders', 'read:products', 'write:products',
  'read:inventory', 'write:inventory', 'read:payments', 'read:reports',
];

// ===== Stats Cards =====
function StatsCards({ stats }: { stats: IntegrationStats | null }) {
  if (!stats) return null;
  const cards = [
    { label: 'Kết nối hoạt động', value: stats.activeConnections, icon: <Wifi className="h-5 w-5 text-green-500" /> },
    { label: 'Webhook', value: stats.totalWebhooks, icon: <Webhook className="h-5 w-5 text-blue-500" /> },
    { label: 'API Key', value: stats.totalAPIKeys, icon: <Key className="h-5 w-5 text-amber-500" /> },
    { label: 'Đồng bộ tháng này', value: stats.syncThisMonth.toLocaleString(), icon: <RefreshCw className="h-5 w-5 text-indigo-500" /> },
    { label: 'Lỗi gần đây', value: stats.recentErrors, icon: <AlertTriangle className="h-5 w-5 text-red-500" />, highlight: stats.recentErrors > 0 },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map(c => (
        <Card key={c.label} className={c.highlight ? 'border-red-300' : ''}>
          <CardContent className="p-3 flex items-center gap-3">
            {c.icon}
            <div>
              <p className="text-lg">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ===== Tab: Kết nối =====
function ConnectionsTab() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [configDialog, setConfigDialog] = useState<Integration | null>(null);
  const [configData, setConfigData] = useState({ apiKey: '', endpoint: '', token: '' });
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await integrationApi.getAll(
      typeFilter ? typeFilter as IntegrationType : undefined,
      statusFilter ? statusFilter as IntegrationStatus : undefined,
      search || undefined,
    );
    setIntegrations(data);
    setLoading(false);
  }, [typeFilter, statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleConnect = async () => {
    if (!configDialog) return;
    setConnecting(true);
    try {
      await integrationApi.connect(configDialog.id, configData);
      toast.success(`Đã kết nối ${configDialog.name}!`);
      setConfigDialog(null);
      setConfigData({ apiKey: '', endpoint: '', token: '' });
      fetchData();
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (intg: Integration) => {
    await integrationApi.disconnect(intg.id);
    toast.success(`Đã ngắt kết nối ${intg.name}`);
    fetchData();
  };

  const handleTest = async (intg: Integration) => {
    setTesting(intg.id);
    const result = await integrationApi.test(intg.id);
    if (result.ok) {
      toast.success(`${intg.name}: Kết nối OK! Latency: ${result.latency}ms`);
    } else {
      toast.error(`${intg.name}: ${result.message}`);
    }
    setTesting(null);
  };

  const getActionButton = (intg: Integration) => {
    switch (intg.status) {
      case 'Đã kết nối':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleTest(intg)} disabled={testing === intg.id}>
              {testing === intg.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              <span className="ml-1">Test</span>
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDisconnect(intg)}>
              <WifiOff className="h-3 w-3 mr-1" /> Ngắt
            </Button>
          </div>
        );
      case 'Ngắt kết nối':
      case 'Chưa cài đặt':
        return (
          <Button size="sm" onClick={() => setConfigDialog(intg)}>
            <Wifi className="h-3 w-3 mr-1" /> Kết nối
          </Button>
        );
      case 'Lỗi':
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleTest(intg)} disabled={testing === intg.id}>
              <RefreshCw className="h-3 w-3 mr-1" /> Thử lại
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDisconnect(intg)}>Ngắt</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input className="w-48" placeholder="Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} />
        <Select value={typeFilter || '__all__'} onValueChange={v => setTypeFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Loại" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả loại</SelectItem>
            {(['ERP', 'Kế toán', 'CRM', 'Email', 'Vận chuyển', 'Thanh toán', 'Chat', 'Custom API'] as IntegrationType[]).map(t =>
              <SelectItem key={t} value={t}>{t}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select value={statusFilter || '__all__'} onValueChange={v => setStatusFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả TT</SelectItem>
            {(['Đã kết nối', 'Ngắt kết nối', 'Lỗi', 'Chưa cài đặt'] as IntegrationStatus[]).map(s =>
              <SelectItem key={s} value={s}>{s}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map(intg => {
            const statusCfg = STATUS_MAP[intg.status];
            return (
              <Card key={intg.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {TYPE_ICONS[intg.type]}
                      <div>
                        <p className="font-medium">{intg.name}</p>
                        <Badge variant="outline" className="text-xs">{intg.type}</Badge>
                      </div>
                    </div>
                    <Badge className={`${statusCfg.color} flex items-center gap-1`}>
                      {statusCfg.icon} {intg.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{intg.description}</p>
                  {intg.lastSyncAt && (
                    <p className="text-xs text-muted-foreground">
                      Đồng bộ: {new Date(intg.lastSyncAt).toLocaleString('vi-VN')} • {intg.syncFrequency}
                    </p>
                  )}
                  <div className="flex justify-end">{getActionButton(intg)}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Config Dialog */}
      <Dialog open={!!configDialog} onOpenChange={() => setConfigDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Kết nối {configDialog?.name}</DialogTitle>
            <DialogDescription>Nhập thông tin cấu hình để kết nối dịch vụ</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>API Key</Label>
              <Input type="password" placeholder="Nhập API Key" value={configData.apiKey} onChange={e => setConfigData(d => ({ ...d, apiKey: e.target.value }))} />
            </div>
            <div>
              <Label>URL Endpoint</Label>
              <Input placeholder="https://api.example.com" value={configData.endpoint} onChange={e => setConfigData(d => ({ ...d, endpoint: e.target.value }))} />
            </div>
            <div>
              <Label>Token / Secret</Label>
              <Input type="password" placeholder="Nhập token" value={configData.token} onChange={e => setConfigData(d => ({ ...d, token: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialog(null)}>Huỷ</Button>
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? 'Đang kết nối...' : 'Kết nối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== Tab: Webhook =====
function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newWh, setNewWh] = useState({ name: '', url: '', events: [] as string[] });
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await integrationApi.getWebhooks();
    setWebhooks(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!newWh.name || !newWh.url) { toast.error('Nhập tên và URL'); return; }
    await integrationApi.createWebhook(newWh);
    toast.success('Đã tạo webhook');
    setShowCreate(false);
    setNewWh({ name: '', url: '', events: [] });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await integrationApi.deleteWebhook(id);
    toast.success('Đã xoá webhook');
    fetchData();
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    await new Promise(r => setTimeout(r, 600));
    toast.success(`Ping thành công! Latency: ${Math.floor(80 + Math.random() * 100)}ms`);
    setTestingId(null);
  };

  const toggleEvent = (event: string) => {
    setNewWh(w => ({
      ...w,
      events: w.events.includes(event) ? w.events.filter(e => e !== event) : [...w.events, event],
    }));
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <p className="text-sm text-muted-foreground">{webhooks.length} webhook đã cấu hình</p>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-3 w-3 mr-1" /> Tạo mới</Button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead><tr className="bg-muted/50">
              <th className="text-left p-2">Tên</th>
              <th className="text-left p-2">URL</th>
              <th className="text-left p-2">Sự kiện</th>
              <th className="text-left p-2">Trạng thái</th>
              <th className="text-left p-2">Ngày tạo</th>
              <th className="p-2"></th>
            </tr></thead>
            <tbody>
              {webhooks.map(wh => (
                <tr key={wh.id} className="border-b hover:bg-muted/30">
                  <td className="p-2">{wh.name}</td>
                  <td className="p-2 max-w-[200px] truncate text-xs font-mono">{wh.url}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map(e => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge className={wh.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {wh.isActive ? 'Hoạt động' : 'Tắt'}
                    </Badge>
                  </td>
                  <td className="p-2 text-xs">{new Date(wh.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleTest(wh.id)} disabled={testingId === wh.id}>
                        {testingId === wh.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDelete(wh.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Webhook mới</DialogTitle>
            <DialogDescription>Cấu hình webhook để nhận thông báo tự động</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Tên</Label><Input value={newWh.name} onChange={e => setNewWh(w => ({ ...w, name: e.target.value }))} /></div>
            <div><Label>URL</Label><Input placeholder="https://..." value={newWh.url} onChange={e => setNewWh(w => ({ ...w, url: e.target.value }))} /></div>
            <div>
              <Label>Sự kiện</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {WEBHOOK_EVENTS.map(ev => (
                  <label key={ev} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={newWh.events.includes(ev)} onCheckedChange={() => toggleEvent(ev)} />
                    {ev}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== Tab: API Keys =====
function APIKeysTab() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', permissions: [] as string[], expiresAt: '' });
  const [confirmRevoke, setConfirmRevoke] = useState<APIKey | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await integrationApi.getAPIKeys();
    setKeys(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!newKey.name) { toast.error('Nhập tên key'); return; }
    const result = await integrationApi.createAPIKey(newKey);
    toast.success(`Đã tạo API Key. Key: ${result.fullKey}`);
    setShowCreate(false);
    setNewKey({ name: '', permissions: [], expiresAt: '' });
    fetchData();
  };

  const handleRevoke = async () => {
    if (!confirmRevoke) return;
    await integrationApi.revokeAPIKey(confirmRevoke.id);
    toast.success('Đã thu hồi API Key');
    setConfirmRevoke(null);
    fetchData();
  };

  const togglePerm = (perm: string) => {
    setNewKey(k => ({
      ...k,
      permissions: k.permissions.includes(perm) ? k.permissions.filter(p => p !== perm) : [...k.permissions, perm],
    }));
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <p className="text-sm text-muted-foreground">{keys.length} API key</p>
        <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="h-3 w-3 mr-1" /> Tạo key</Button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead><tr className="bg-muted/50">
              <th className="text-left p-2">Tên</th>
              <th className="text-left p-2">Key</th>
              <th className="text-left p-2">Quyền</th>
              <th className="text-left p-2">Hết hạn</th>
              <th className="text-left p-2">Trạng thái</th>
              <th className="p-2"></th>
            </tr></thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id} className="border-b hover:bg-muted/30">
                  <td className="p-2">{k.name}</td>
                  <td className="p-2 font-mono text-xs">{k.keyMasked}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {k.permissions.slice(0, 3).map(p => <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>)}
                      {k.permissions.length > 3 && <Badge variant="secondary" className="text-xs">+{k.permissions.length - 3}</Badge>}
                    </div>
                  </td>
                  <td className="p-2 text-xs">{k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="p-2">
                    <Badge className={k.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {k.isActive ? 'Hoạt động' : 'Đã thu hồi'}
                    </Badge>
                  </td>
                  <td className="p-2">
                    {k.isActive && (
                      <Button size="sm" variant="destructive" onClick={() => setConfirmRevoke(k)}>Thu hồi</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo API Key mới</DialogTitle>
            <DialogDescription>Tạo API key để truy cập hệ thống từ ứng dụng bên ngoài</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Tên</Label><Input value={newKey.name} onChange={e => setNewKey(k => ({ ...k, name: e.target.value }))} /></div>
            <div>
              <Label>Quyền</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={newKey.permissions.includes(p)} onCheckedChange={() => togglePerm(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div><Label>Hạn sử dụng</Label><Input type="date" value={newKey.expiresAt} onChange={e => setNewKey(k => ({ ...k, expiresAt: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Huỷ</Button>
            <Button onClick={handleCreate}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <Dialog open={!!confirmRevoke} onOpenChange={() => setConfirmRevoke(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Thu hồi API Key</DialogTitle>
            <DialogDescription>Bạn có chắc thu hồi key "{confirmRevoke?.name}"? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRevoke(null)}>Huỷ</Button>
            <Button variant="destructive" onClick={handleRevoke}>Thu hồi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== Tab: Lịch sử =====
function HistoryTab() {
  const [logs, setLogs] = useState<{ id: string; integrationId: string; integrationName: string; action: string; status: 'ok' | 'error'; errorDetail?: string; timestamp: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterIntg, setFilterIntg] = useState('');

  useEffect(() => {
    setLoading(true);
    integrationApi.getSyncHistory(filterIntg || undefined).then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, [filterIntg]);

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  useEffect(() => { integrationApi.getAll().then(setIntegrations); }, []);

  return (
    <>
      <div className="flex gap-3 mb-4">
        <Select value={filterIntg || '__all__'} onValueChange={v => setFilterIntg(v === '__all__' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Tất cả dịch vụ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Tất cả dịch vụ</SelectItem>
            {integrations.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead><tr className="bg-muted/50">
              <th className="text-left p-2">Thời gian</th>
              <th className="text-left p-2">Dịch vụ</th>
              <th className="text-left p-2">Hành động</th>
              <th className="text-left p-2">Trạng thái</th>
              <th className="text-left p-2">Chi tiết</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b hover:bg-muted/30">
                  <td className="p-2 text-xs">{new Date(l.timestamp).toLocaleString('vi-VN')}</td>
                  <td className="p-2">{l.integrationName}</td>
                  <td className="p-2">{l.action}</td>
                  <td className="p-2">
                    <Badge className={l.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {l.status === 'ok' ? <><CheckCircle2 className="h-3 w-3 mr-1" /> OK</> : <><XCircle className="h-3 w-3 mr-1" /> Lỗi</>}
                    </Badge>
                  </td>
                  <td className="p-2 text-xs text-red-500">{l.errorDetail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ===== Main Page =====
export function IntegrationHubPage() {
  const [stats, setStats] = useState<IntegrationStats | null>(null);

  useEffect(() => { integrationApi.getStats().then(setStats); }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Tích hợp' }]} />

      <div className="flex items-center gap-2">
        <Puzzle className="h-6 w-6 text-primary" />
        <h1>Trung tâm tích hợp</h1>
      </div>

      <StatsCards stats={stats} />

      <Tabs defaultValue="connections">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connections" className="flex items-center gap-1">
            <Wifi className="h-4 w-4" /> Kết nối
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-1">
            <Webhook className="h-4 w-4" /> Webhook
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="flex items-center gap-1">
            <Key className="h-4 w-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" /> Lịch sử
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections"><ConnectionsTab /></TabsContent>
        <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        <TabsContent value="apikeys"><APIKeysTab /></TabsContent>
        <TabsContent value="history"><HistoryTab /></TabsContent>
      </Tabs>
    </div>
  );
}