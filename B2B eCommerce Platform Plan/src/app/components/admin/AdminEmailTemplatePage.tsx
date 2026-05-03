// ============================================================
// AdminEmailTemplatePage — Quản lý Email Templates
// Route: /admin/email-templates
// Mustache-style vars: {{name}}, {{orderNumber}}, {{amount}}...
// ============================================================

import { useState } from 'react';
import { Mail, Eye, Edit2, Send, Plus, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
  trigger: string;
  isActive: boolean;
  lastSent?: string;
  sentCount: number;
  category: 'order' | 'rfq' | 'payment' | 'auth' | 'system';
}

const mockTemplates: EmailTemplate[] = [
  {
    id: '1', key: 'order_confirmed', name: 'Xác nhận đơn hàng', category: 'order',
    description: 'Gửi khi đơn hàng được xác nhận', trigger: 'Khi Order → Confirmed',
    subject: '✅ Đơn hàng #{{orderNumber}} đã được xác nhận',
    body: `Chào {{buyerName}},\n\nĐơn hàng #{{orderNumber}} của bạn đã được xác nhận thành công!\n\nTổng tiền: {{totalAmount}}\nDự kiến giao: {{expectedDate}}\n\nCảm ơn bạn đã mua sắm tại CELLPHONES!`,
    variables: ['buyerName', 'orderNumber', 'totalAmount', 'expectedDate'],
    isActive: true, lastSent: '2026-04-14', sentCount: 1243,
  },
  {
    id: '2', key: 'order_shipped', name: 'Thông báo giao hàng', category: 'order',
    description: 'Gửi khi đơn hàng đang được vận chuyển', trigger: 'Khi Order → Shipping',
    subject: '🚚 Đơn hàng #{{orderNumber}} đang trên đường đến bạn',
    body: `Chào {{buyerName}},\n\nĐơn hàng #{{orderNumber}} đang được vận chuyển.\n\nMã theo dõi: {{trackingCode}}\nĐơn vị VC: {{carrier}}\n\nDự kiến nhận: {{expectedDate}}`,
    variables: ['buyerName', 'orderNumber', 'trackingCode', 'carrier', 'expectedDate'],
    isActive: true, lastSent: '2026-04-14', sentCount: 987,
  },
  {
    id: '3', key: 'payment_due', name: 'Nhắc nhở thanh toán', category: 'payment',
    description: 'Gửi khi đến hạn thanh toán', trigger: 'Khi Payment → Quá hạn',
    subject: '⚠️ Nhắc nhở: Thanh toán hoá đơn #{{invoiceNumber}} đến hạn',
    body: `Chào {{buyerName}},\n\nHoá đơn #{{invoiceNumber}} trị giá {{amount}} đã đến hạn vào ngày {{dueDate}}.\n\nVui lòng thanh toán để tránh phát sinh phí trễ hạn.\n\nLink thanh toán: {{paymentLink}}`,
    variables: ['buyerName', 'invoiceNumber', 'amount', 'dueDate', 'paymentLink'],
    isActive: true, lastSent: '2026-04-13', sentCount: 234,
  },
  {
    id: '4', key: 'rfq_response', name: 'Có báo giá mới', category: 'rfq',
    description: 'Gửi cho buyer khi NCC phản hồi RFQ', trigger: 'Khi Quotation → Submitted',
    subject: '📋 Yêu cầu báo giá #{{rfqNumber}} có phản hồi mới',
    body: `Chào {{buyerName}},\n\nNhà cung cấp {{supplierName}} đã gửi báo giá cho RFQ #{{rfqNumber}}.\n\nTổng giá trị: {{quotationAmount}}\nHiệu lực đến: {{validUntil}}\n\nXem chi tiết tại: {{link}}`,
    variables: ['buyerName', 'rfqNumber', 'supplierName', 'quotationAmount', 'validUntil', 'link'],
    isActive: true, lastSent: '2026-04-12', sentCount: 156,
  },
  {
    id: '5', key: 'welcome', name: 'Chào mừng đăng ký', category: 'auth',
    description: 'Gửi khi người dùng đăng ký mới', trigger: 'Khi User → Registered',
    subject: '🎉 Chào mừng đến với CELLPHONES - {{companyName}}!',
    body: `Chào {{fullName}},\n\nChúc mừng bạn đã đăng ký tài khoản CELLPHONES!\n\nUsername: {{email}}\nVerify email: {{verifyLink}}\n\nBắt đầu mua sắm ngay tại: {{shopLink}}`,
    variables: ['fullName', 'email', 'companyName', 'verifyLink', 'shopLink'],
    isActive: true, sentCount: 892,
  },
  {
    id: '6', key: 'maintenance', name: 'Thông báo bảo trì', category: 'system',
    description: 'Thông báo hệ thống bảo trì định kỳ', trigger: 'Manual',
    subject: '🔧 Thông báo bảo trì hệ thống CELLPHONES',
    body: `Kính gửi {{name}},\n\nHệ thống CELLPHONES sẽ bảo trì từ {{startTime}} đến {{endTime}} vào ngày {{date}}.\n\nXin lỗi vì sự bất tiện này.`,
    variables: ['name', 'startTime', 'endTime', 'date'],
    isActive: false, sentCount: 23,
  },
];

const categoryColor: Record<EmailTemplate['category'], string> = {
  order: 'bg-blue-50 text-blue-700', rfq: 'bg-indigo-50 text-indigo-700',
  payment: 'bg-red-50 text-red-700', auth: 'bg-green-50 text-green-700',
  system: 'bg-gray-50 text-gray-700',
};
const categoryLabel: Record<EmailTemplate['category'], string> = {
  order: 'Đơn hàng', rfq: 'RFQ', payment: 'Thanh toán', auth: 'Xác thực', system: 'Hệ thống',
};

export function AdminEmailTemplatePage() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<EmailTemplate | null>(null);
  const [previewItem, setPreviewItem] = useState<EmailTemplate | null>(null);

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.key.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (updated: EmailTemplate) => {
    setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditItem(null);
    toast.success('Đã lưu template email');
  };

  const handleTest = (t: EmailTemplate) => {
    toast.success(`Đã gửi email test: "${t.name}" đến admin@cellphones.vn`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Email Templates' }]} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Email Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý nội dung email tự động gửi cho người dùng</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Thêm template</Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['order','rfq','payment','auth'] as const).map(cat => (
          <Card key={cat} className="text-center p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{categoryLabel[cat]}</p>
            <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {templates.filter(t => t.category === cat).length}
            </p>
            <p className="text-xs text-muted-foreground">templates</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Tìm template..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Template list */}
      <div className="space-y-3">
        {filtered.map(t => (
          <Card key={t.id} className={`transition-all duration-200 hover:shadow-md ${!t.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${t.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Mail className={`h-5 w-5 ${t.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{t.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColor[t.category]}`}>{categoryLabel[t.category]}</span>
                    {t.isActive
                      ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3 w-3"/>Đang bật</span>
                      : <span className="flex items-center gap-1 text-xs text-muted-foreground"><AlertCircle className="h-3 w-3"/>Đang tắt</span>
                    }
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Trigger: <b className="text-foreground">{t.trigger}</b></span>
                    <span>Đã gửi: <b className="text-foreground">{t.sentCount.toLocaleString()}</b></span>
                    {t.lastSent && <span>Lần cuối: {t.lastSent}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setPreviewItem(t)}><Eye className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditItem({ ...t })}><Edit2 className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleTest(t)}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xem trước: {previewItem?.name}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium">{previewItem.subject}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Nội dung</p>
                <pre className="text-sm whitespace-pre-wrap font-sans">{previewItem.body}</pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Variables</p>
                <div className="flex flex-wrap gap-1">
                  {previewItem.variables.map(v => (
                    <code key={v} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{`{{${v}}}`}</code>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa: {editItem?.name}</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Subject</Label>
                <Input value={editItem.subject} onChange={e => setEditItem({ ...editItem, subject: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Nội dung (Mustache variables: {`{{varName}}`})</Label>
                <Textarea rows={8} value={editItem.body} onChange={e => setEditItem({ ...editItem, body: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">Variables:</p>
                {editItem.variables.map(v => (
                  <code key={v} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{`{{${v}}}`}</code>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Huỷ</Button>
            <Button onClick={() => editItem && handleSave(editItem)}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
