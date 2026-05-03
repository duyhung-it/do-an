// ============================================================
// ImportDialog — Component nhập dữ liệu CSV chung toàn hệ thống
// 5 bước: Upload → Preview → Mapping → Validation → Kết quả
// ============================================================

import { useState, useCallback, useMemo } from 'react';
import {
  Upload, FileSpreadsheet, ArrowRight, ArrowLeft, CheckCircle2,
  AlertTriangle, Download, X, Loader2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { downloadTemplate } from '../../utils/exportUtils';

export interface ImportColumn {
  key: string;
  label: string;
  required: boolean;
  validate?: (value: string) => string | null; // return error or null
}

export interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: { row: number; field: string; error: string }[];
  data: Record<string, string>[];
}

type Step = 'upload' | 'preview' | 'mapping' | 'validation' | 'result';
type DuplicateMode = 'skip' | 'overwrite' | 'create';

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    return row;
  });
  return { headers, rows };
}

export function ImportDialog({
  open,
  onClose,
  title,
  columns,
  onImport,
  templateSample,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  columns: ImportColumn[];
  onImport: (data: Record<string, string>[], mode: DuplicateMode) => Promise<ImportResult>;
  templateSample?: string[][];
}) {
  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [dupMode, setDupMode] = useState<DuplicateMode>('skip');
  const [validationErrors, setValidationErrors] = useState<{ row: number; field: string; error: string }[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  const reset = useCallback(() => {
    setStep('upload'); setHeaders([]); setRows([]);
    setMapping({}); setValidationErrors([]); setResult(null);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) { toast.error('Chỉ hỗ trợ file .csv'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers: h, rows: r } = parseCsv(e.target?.result as string);
      if (h.length === 0) { toast.error('File trống hoặc sai định dạng'); return; }
      setHeaders(h); setRows(r);
      // Auto-map
      const autoMap: Record<string, string> = {};
      columns.forEach(col => {
        const match = h.find(hd =>
          hd.toLowerCase() === col.key.toLowerCase() ||
          hd.toLowerCase() === col.label.toLowerCase() ||
          hd.toLowerCase().includes(col.key.toLowerCase()),
        );
        if (match) autoMap[col.key] = match;
      });
      setMapping(autoMap);
      setStep('preview');
    };
    reader.readAsText(file);
  }, [columns]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileUpload(f);
  }, [handleFileUpload]);

  const canProceedMapping = columns.filter(c => c.required).every(c => mapping[c.key]);

  // Validation
  const runValidation = useCallback(() => {
    const errors: { row: number; field: string; error: string }[] = [];
    rows.forEach((row, i) => {
      columns.forEach(col => {
        const fileCol = mapping[col.key];
        const val = fileCol ? (row[fileCol] ?? '').trim() : '';
        if (col.required && !val) {
          errors.push({ row: i + 1, field: col.label, error: 'Trường bắt buộc' });
        } else if (val && col.validate) {
          const err = col.validate(val);
          if (err) errors.push({ row: i + 1, field: col.label, error: err });
        }
      });
    });
    setValidationErrors(errors);
    setStep('validation');
  }, [rows, columns, mapping]);

  const errorRows = useMemo(() => new Set(validationErrors.map(e => e.row)), [validationErrors]);
  const validCount = rows.length - errorRows.size;

  const handleImport = async () => {
    setImporting(true);
    try {
      // Map data
      const mapped = rows
        .filter((_, i) => !errorRows.has(i + 1))
        .map(row => {
          const obj: Record<string, string> = {};
          columns.forEach(col => {
            const fileCol = mapping[col.key];
            obj[col.key] = fileCol ? (row[fileCol] ?? '').trim() : '';
          });
          return obj;
        });
      const res = await onImport(mapped, dupMode);
      setResult(res);
      setStep('result');
    } catch {
      toast.error('Lỗi nhập dữ liệu');
    } finally { setImporting(false); }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(
      columns.map(c => c.key),
      `template-${title.toLowerCase().replace(/\s+/g, '-')}.csv`,
      templateSample,
    );
    toast.success('Đã tải file mẫu');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> {title}
          </DialogTitle>
          <DialogDescription>
            Tải lên file Excel/CSV để nhập dữ liệu hàng loạt
          </DialogDescription>
        </DialogHeader>

        {/* Steps */}
        <div className="flex items-center gap-1 flex-wrap mb-4">
          {[
            { key: 'upload', label: 'Upload' }, { key: 'preview', label: 'Xem trước' },
            { key: 'mapping', label: 'Ghép cột' }, { key: 'validation', label: 'Kiểm tra' },
            { key: 'result', label: 'Kết quả' },
          ].map((s, i) => {
            const steps: Step[] = ['upload', 'preview', 'mapping', 'validation', 'result'];
            const cur = steps.indexOf(step);
            const idx = steps.indexOf(s.key as Step);
            return (
              <div key={s.key} className="flex items-center gap-1">
                {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                <Badge variant={idx <= cur ? 'default' : 'outline'} className="text-xs">{s.label}</Badge>
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              onClick={() => document.getElementById('import-csv-input')?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p>Kéo thả file CSV vào đây hoặc nhấn để chọn</p>
              <input id="import-csv-input" type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }} />
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-1 h-4 w-4" /> Tải file mẫu
            </Button>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <div className="space-y-3">
            <p className="text-muted-foreground">{rows.length} dòng · {headers.length} cột</p>
            <div className="overflow-x-auto max-h-[300px]">
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
            {rows.length > 10 && <p className="text-muted-foreground text-center text-sm">Hiển thị 10/{rows.length} dòng</p>}
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={reset}><X className="mr-1 h-4 w-4" /> Chọn lại</Button>
              <Button size="sm" onClick={() => setStep('mapping')}>Tiếp <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 3: Mapping */}
        {step === 'mapping' && (
          <div className="space-y-3">
            {columns.map(col => (
              <div key={col.key} className="grid grid-cols-2 gap-3 items-center">
                <Label>{col.label} {col.required && <span className="text-destructive">*</span>}</Label>
                <Select value={mapping[col.key] ?? ''} onValueChange={v => setMapping(p => ({ ...p, [col.key]: v }))}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Chọn cột..." /></SelectTrigger>
                  <SelectContent>{headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2">
              <Label>Xử lý bản ghi trùng:</Label>
              <div className="flex gap-3">
                {[
                  { v: 'skip' as const, l: 'Bỏ qua' },
                  { v: 'overwrite' as const, l: 'Ghi đè' },
                  { v: 'create' as const, l: 'Tạo mới' },
                ].map(o => (
                  <label key={o.v} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="dupMode" checked={dupMode === o.v} onChange={() => setDupMode(o.v)} className="accent-primary" />
                    <span>{o.l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep('preview')}><ArrowLeft className="mr-1 h-4 w-4" /> Quay lại</Button>
              <Button size="sm" onClick={runValidation} disabled={!canProceedMapping}>Kiểm tra <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: Validation */}
        {step === 'validation' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg text-center"><p className="text-xl text-green-600">{validCount}</p><p className="text-muted-foreground text-sm">Hợp lệ</p></div>
              <div className="p-3 border rounded-lg text-center"><p className="text-xl text-red-500">{errorRows.size}</p><p className="text-muted-foreground text-sm">Lỗi</p></div>
            </div>
            {validationErrors.length > 0 && (
              <div className="overflow-x-auto max-h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Dòng</TableHead><TableHead>Trường</TableHead><TableHead>Lỗi</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationErrors.slice(0, 20).map((e, i) => (
                      <TableRow key={i} className="text-destructive">
                        <TableCell>{e.row}</TableCell><TableCell>{e.field}</TableCell><TableCell>{e.error}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {validationErrors.length > 20 && <p className="text-muted-foreground text-center text-sm">+{validationErrors.length - 20} lỗi khác</p>}
              </div>
            )}
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep('mapping')}><ArrowLeft className="mr-1 h-4 w-4" /> Quay lại</Button>
              <Button size="sm" onClick={handleImport} disabled={validCount === 0 || importing}>
                {importing ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Đang nhập...</> : <>Nhập {validCount} bản ghi</>}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Result */}
        {step === 'result' && result && (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h3>Hoàn tất!</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg"><p className="text-xl text-green-600">{result.success}</p><p className="text-muted-foreground text-sm">Thành công</p></div>
              <div className="p-3 border rounded-lg"><p className="text-xl text-red-500">{result.failed}</p><p className="text-muted-foreground text-sm">Thất bại</p></div>
              <div className="p-3 border rounded-lg"><p className="text-xl text-amber-500">{result.skipped}</p><p className="text-muted-foreground text-sm">Bỏ qua</p></div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Hoàn tất</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}