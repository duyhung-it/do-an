// ============================================================
// Đặt hàng từ file CSV — Buyer (P3 Đợt 7: P3.11–P3.13, P3.19–P3.20)
// Animated drop zone, preview highlight, template download, progress
// ============================================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download,
  ArrowRight, ArrowLeft, ShoppingCart, X, Loader2, FileDown, FileUp,
  Zap, File, CloudUpload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { IconWrapper } from '../shared/IconWrapper';
import { toast } from 'sonner';

const fmtPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

// Mock product DB for validation
const MOCK_PRODUCTS: Record<string, { name: string; price: number; stock: number; supplier: string; supplierId: string }> = {
  'SP001': { name: 'Arduino Uno R3', price: 250000, stock: 500, supplier: 'Điện tử Sài Gòn', supplierId: 'sup-01' },
  'SP002': { name: 'Cảm biến nhiệt DS18B20', price: 35000, stock: 1200, supplier: 'Điện tử Sài Gòn', supplierId: 'sup-01' },
  'SP003': { name: 'Thép hình U100', price: 185000, stock: 800, supplier: 'Thép Miền Nam', supplierId: 'sup-02' },
  'SP004': { name: 'Xi măng PCB40', price: 95000, stock: 2000, supplier: 'Vật liệu XD Phú Thọ', supplierId: 'sup-03' },
  'SP005': { name: 'Vải cotton 100%', price: 45000, stock: 3000, supplier: 'Dệt may Tân Bình', supplierId: 'sup-04' },
  'SP006': { name: 'Gạo ST25 5kg', price: 125000, stock: 1500, supplier: 'Nông sản Mekong', supplierId: 'sup-05' },
  'SP007': { name: 'Cà phê Robusta 500g', price: 85000, stock: 900, supplier: 'Nông sản Mekong', supplierId: 'sup-05' },
  'SP008': { name: 'Module WiFi ESP8266', price: 55000, stock: 800, supplier: 'Điện tử Sài Gòn', supplierId: 'sup-01' },
};

const SYSTEM_COLUMNS = [
  { key: 'sku', label: 'Mã SP / SKU', required: true },
  { key: 'quantity', label: 'Số lượng', required: true },
  { key: 'notes', label: 'Ghi chú', required: false },
];

type Step = 'upload' | 'preview' | 'mapping' | 'validation' | 'confirm' | 'done';
interface CsvRow { [key: string]: string }
interface ValidatedItem {
  sku: string; quantity: number; notes: string; valid: boolean; error?: string;
  productName?: string; price?: number; supplier?: string; supplierId?: string; total?: number;
}

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: CsvRow = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

// P3.13: Template download
function downloadTemplate() {
  const bom = '\uFEFF';
  const csv = bom + 'ma_sp,so_luong,ghi_chu\nSP001,10,Giao gấp\nSP002,50,\nSP003,20,Đóng gói cẩn thận';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'template-dat-hang.csv';
  a.click();
  toast.success('Đã tải file mẫu');
}

const STEPS_INFO: { key: Step; label: string; icon: typeof Upload }[] = [
  { key: 'upload', label: 'Upload', icon: CloudUpload },
  { key: 'preview', label: 'Xem trước', icon: FileSpreadsheet },
  { key: 'mapping', label: 'Ghép cột', icon: Zap },
  { key: 'validation', label: 'Kiểm tra', icon: AlertTriangle },
  { key: 'confirm', label: 'Xác nhận', icon: ShoppingCart },
  { key: 'done', label: 'Hoàn tất', icon: CheckCircle2 },
];

export function BuyerBulkOrderPage() {
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState<ValidatedItem[]>([]);
  const [creating, setCreating] = useState(false);

  // P3.11: Drag state
  const [isDragging, setIsDragging] = useState(false);
  // P3.20: Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // P3.20: Simulate upload progress
  const simulateUpload = useCallback((file: File, cb: () => void) => {
    setUploading(true);
    setUploadProgress(0);
    const total = file.size;
    let loaded = 0;
    const chunkSize = Math.max(total / 20, 100);
    const interval = setInterval(() => {
      loaded = Math.min(loaded + chunkSize + Math.random() * chunkSize, total);
      setUploadProgress(Math.round((loaded / total) * 100));
      if (loaded >= total) {
        clearInterval(interval);
        setUploading(false);
        cb();
      }
    }, 50);
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) { toast.error('Chỉ hỗ trợ file .csv'); return; }
    setFileName(file.name);
    setFileSize(file.size);

    simulateUpload(file, () => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const { headers: h, rows: r } = parseCsv(text);
        if (h.length === 0) { toast.error('File trống hoặc sai định dạng'); return; }
        setHeaders(h); setRows(r);
        const autoMap: Record<string, string> = {};
        SYSTEM_COLUMNS.forEach(sc => {
          const match = h.find(hd =>
            hd.toLowerCase().includes(sc.key) ||
            hd.toLowerCase().includes(sc.label.toLowerCase()) ||
            (sc.key === 'sku' && (hd.toLowerCase().includes('ma') || hd.toLowerCase().includes('sp'))) ||
            (sc.key === 'quantity' && (hd.toLowerCase().includes('luong') || hd.toLowerCase().includes('qty'))) ||
            (sc.key === 'notes' && hd.toLowerCase().includes('ghi'))
          );
          if (match) autoMap[sc.key] = match;
        });
        setMapping(autoMap);
        setStep('preview');
      };
      reader.readAsText(file);
    });
  }, [simulateUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const runValidation = useCallback(() => {
    const items: ValidatedItem[] = rows.map(row => {
      const sku = (row[mapping.sku] ?? '').trim().toUpperCase();
      const qtyStr = (row[mapping.quantity] ?? '').trim();
      const notes = (row[mapping.notes] ?? '').trim();
      const qty = parseInt(qtyStr, 10);
      if (!sku) return { sku, quantity: 0, notes, valid: false, error: 'Thiếu mã SP' };
      if (isNaN(qty) || qty <= 0) return { sku, quantity: 0, notes, valid: false, error: 'SL không hợp lệ' };
      const product = MOCK_PRODUCTS[sku];
      if (!product) return { sku, quantity: qty, notes, valid: false, error: 'SP không tồn tại' };
      if (qty > product.stock) return { sku, quantity: qty, notes, valid: false, error: `Tồn kho: ${product.stock}` };
      return {
        sku, quantity: qty, notes, valid: true,
        productName: product.name, price: product.price,
        supplier: product.supplier, supplierId: product.supplierId,
        total: product.price * qty,
      };
    });
    setValidated(items); setStep('validation');
  }, [rows, mapping]);

  const validItems = useMemo(() => validated.filter(v => v.valid), [validated]);
  const invalidItems = useMemo(() => validated.filter(v => !v.valid), [validated]);
  const grandTotal = useMemo(() => validItems.reduce((s, v) => s + (v.total ?? 0), 0), [validItems]);

  const orderGroups = useMemo(() => {
    const groups: Record<string, { supplier: string; items: ValidatedItem[] }> = {};
    for (const item of validItems) {
      const sid = item.supplierId ?? 'unknown';
      if (!groups[sid]) groups[sid] = { supplier: item.supplier ?? '', items: [] };
      groups[sid].items.push(item);
    }
    return Object.entries(groups);
  }, [validItems]);

  const handleCreateOrders = async () => {
    setCreating(true);
    await new Promise(r => setTimeout(r, 800));
    setCreating(false); setStep('done');
    toast.success(`Đã tạo ${orderGroups.length} đơn hàng!`);
  };

  const reset = () => {
    setStep('upload'); setFileName(''); setFileSize(0); setHeaders([]); setRows([]);
    setMapping({}); setValidated([]); setUploadProgress(0);
  };

  const canProceedMapping = SYSTEM_COLUMNS.filter(c => c.required).every(c => mapping[c.key]);
  const currentStepIdx = STEPS_INFO.findIndex(s => s.key === step);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <AppBreadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đặt hàng từ file' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <FileUp className="h-6 w-6 text-primary" /> Đặt hàng từ file CSV
          </h1>
          <p className="text-muted-foreground mt-1">Nhập danh sách sản phẩm từ file CSV để đặt hàng hàng loạt</p>
        </div>
        {/* P3.13: Template download */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate} className="gap-1.5">
            <FileDown className="h-4 w-4" /> Tải file mẫu Excel/CSV
          </Button>
        </div>
      </div>

      {/* Steps indicator — redesigned */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {STEPS_INFO.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === currentStepIdx;
          const isDone = i < currentStepIdx;
          return (
            <div key={s.key} className="flex items-center">
              {i > 0 && (
                <div className={`w-6 sm:w-10 h-0.5 ${isDone ? 'bg-primary' : 'bg-border'}`} />
              )}
              <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all ${
                isActive ? 'bg-primary text-primary-foreground shadow-sm' :
                isDone ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}>
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload — P3.11 animated drag-drop */}
      {step === 'upload' && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border hover:border-primary/50 hover:bg-muted/20'
              }`}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              {/* P3.11: Animated icon */}
              <div className={`mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted/50 text-muted-foreground'
              }`}>
                <CloudUpload className={`h-10 w-10 transition-transform duration-300 ${isDragging ? 'scale-110 -translate-y-1' : ''}`} />
              </div>

              <p style={{ fontFamily: 'var(--font-heading)' }} className="text-lg mb-1">
                {isDragging ? 'Thả file vào đây' : 'Kéo thả file CSV vào đây'}
              </p>
              <p className="text-muted-foreground text-sm mb-4">hoặc nhấn để chọn file từ máy tính</p>

              {/* P3.11: Supported formats */}
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><File className="h-3 w-3" /> .csv</span>
                <span className="text-muted-foreground/30">|</span>
                <span>Tối đa 5MB</span>
                <span className="text-muted-foreground/30">|</span>
                <span>UTF-8</span>
              </div>

              <input id="csv-input" type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            </div>

            {/* P3.20: Upload progress */}
            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Đang tải: {fileName}
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)' }}>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-100"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {(fileSize / 1024).toFixed(1)} KB · ~{Math.max(1, Math.round((100 - uploadProgress) / 20))}s còn lại
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview — P3.12 highlight */}
      {step === 'preview' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <IconWrapper icon={FileSpreadsheet} variant="primary" size="sm" />
                <div>
                  <CardTitle className="text-base">{fileName}</CardTitle>
                  <CardDescription>{rows.length} dòng · {headers.length} cột · {(fileSize / 1024).toFixed(1)} KB</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}><X className="h-4 w-4 mr-1" /> Chọn lại</Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* P3.19: Mobile card list */}
            <div className="sm:hidden space-y-2">
              {rows.slice(0, 10).map((row, i) => (
                <div key={i} className="p-3 rounded-xl border border-border/50 text-sm">
                  {headers.map(h => (
                    <div key={h} className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">{h}:</span>
                      <span>{row[h]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>{headers.map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>{headers.map(h => <TableCell key={h}>{row[h]}</TableCell>)}</TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {rows.length > 10 && <p className="text-muted-foreground mt-2 text-center text-sm">Hiển thị 10/{rows.length} dòng</p>}
            <div className="flex justify-end mt-4">
              <Button onClick={() => setStep('mapping')} className="gap-1.5">Tiếp: Ghép cột <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Mapping */}
      {step === 'mapping' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconWrapper icon={Zap} variant="warning" size="sm" /> Ghép cột file với hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SYSTEM_COLUMNS.map(sc => (
              <div key={sc.key} className="grid sm:grid-cols-2 gap-3 items-center p-3 rounded-xl bg-muted/20">
                <Label className="flex items-center gap-1.5">
                  {sc.required && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />}
                  {sc.label}
                </Label>
                <Select value={mapping[sc.key] ?? ''} onValueChange={v => setMapping(p => ({ ...p, [sc.key]: v }))}>
                  <SelectTrigger><SelectValue placeholder="Chọn cột..." /></SelectTrigger>
                  <SelectContent>{headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep('preview')} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
              <Button onClick={runValidation} disabled={!canProceedMapping} className="gap-1.5">Kiểm tra <ArrowRight className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Validation — P3.12 highlight errors */}
      {step === 'validation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4 flex items-center gap-3">
                <IconWrapper icon={CheckCircle2} variant="success" size="sm" />
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)' }} className="text-lg text-emerald-600">{validItems.length}</p>
                  <p className="text-xs text-muted-foreground">SP hợp lệ</p>
                </div>
              </CardContent>
            </Card>
            <Card className={`border-l-4 ${invalidItems.length > 0 ? 'border-l-red-500' : 'border-l-muted'}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <IconWrapper icon={AlertTriangle} variant={invalidItems.length > 0 ? 'danger' : 'neutral'} size="sm" />
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)' }} className={`text-lg ${invalidItems.length > 0 ? 'text-red-500' : ''}`}>{invalidItems.length}</p>
                  <p className="text-xs text-muted-foreground">SP lỗi</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4 flex items-center gap-3">
                <IconWrapper icon={ShoppingCart} variant="primary" size="sm" />
                <div>
                  <p style={{ fontFamily: 'var(--font-heading)' }} className="text-lg text-primary">{fmtPrice(grandTotal)}</p>
                  <p className="text-xs text-muted-foreground">Tổng tiền dự kiến</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {invalidItems.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{invalidItems.length} dòng lỗi sẽ bị bỏ qua khi đặt hàng</AlertDescription>
            </Alert>
          )}

          {/* P3.19: Mobile card list for validation */}
          <div className="sm:hidden space-y-2">
            {validated.map((v, i) => (
              <div key={i} className={`p-3 rounded-xl border ${!v.valid ? 'border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/30' : 'border-border/50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontFamily: 'var(--font-heading)' }} className="text-sm">{v.sku || '—'}</span>
                  {v.valid
                    ? <Badge className="bg-emerald-100 text-emerald-700 text-[10px]"><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> OK</Badge>
                    : <Badge variant="destructive" className="text-[10px]"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {v.error}</Badge>
                  }
                </div>
                <p className="text-sm">{v.productName ?? '—'}</p>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>SL: {v.quantity || '—'}</span>
                  <span>{v.total ? fmtPrice(v.total) : '—'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <Card className="hidden sm:block">
            <CardHeader><CardTitle className="text-base">Kết quả kiểm tra</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã SP</TableHead><TableHead>Tên SP</TableHead>
                      <TableHead className="text-right">SL</TableHead><TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead><TableHead>NCC</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validated.map((v, i) => (
                      <TableRow key={i} className={!v.valid ? 'bg-red-50/60 dark:bg-red-950/10' : ''}>
                        <TableCell className={!v.valid ? 'text-red-600' : ''} style={{ fontFamily: 'var(--font-heading)' }}>{v.sku}</TableCell>
                        <TableCell>{v.productName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="text-right">{v.quantity || '—'}</TableCell>
                        <TableCell className="text-right">{v.price ? fmtPrice(v.price) : '—'}</TableCell>
                        <TableCell className="text-right">{v.total ? fmtPrice(v.total) : '—'}</TableCell>
                        <TableCell>{v.supplier ?? '—'}</TableCell>
                        <TableCell>
                          {v.valid
                            ? <Badge className="bg-emerald-100 text-emerald-700 gap-0.5 text-xs"><CheckCircle2 className="h-3 w-3" /> OK</Badge>
                            : <Badge variant="destructive" className="gap-0.5 text-xs"><AlertTriangle className="h-3 w-3" /> {v.error}</Badge>
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('mapping')} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
            <Button onClick={() => setStep('confirm')} disabled={validItems.length === 0} className="gap-1.5">Xác nhận <ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 5: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Sẽ tạo {orderGroups.length} đơn hàng (nhóm theo NCC) với {validItems.length} SP · {fmtPrice(grandTotal)}</AlertDescription>
          </Alert>
          {orderGroups.map(([sid, group]) => (
            <Card key={sid}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <IconWrapper icon={ShoppingCart} variant="primary" size="xs" />
                  <div>
                    <CardTitle className="text-base">{group.supplier}</CardTitle>
                    <CardDescription>{group.items.length} SP · {fmtPrice(group.items.reduce((s, v) => s + (v.total ?? 0), 0))}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.items.map((v, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 text-sm">
                      <span className="flex items-center gap-2">
                        <span style={{ fontFamily: 'var(--font-heading)' }} className="text-muted-foreground">{v.sku}</span>
                        <span>{v.productName}</span>
                      </span>
                      <span className="text-muted-foreground">×{v.quantity} = <span className="text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{fmtPrice(v.total ?? 0)}</span></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('validation')} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
            <Button onClick={handleCreateOrders} disabled={creating} className="gap-1.5">
              {creating ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang tạo...</> : <><ShoppingCart className="h-4 w-4" /> Đặt hàng ({orderGroups.length} đơn)</>}
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Done */}
      {step === 'done' && (
        <Card>
          <CardContent className="p-10 sm:p-16 text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)' }}>Đặt hàng thành công!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Đã tạo {orderGroups.length} đơn hàng với {validItems.length} sản phẩm · Tổng {fmtPrice(grandTotal)}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={reset}>Đặt hàng mới</Button>
              <Button onClick={() => window.location.href = '/orders'}>Xem đơn hàng</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
