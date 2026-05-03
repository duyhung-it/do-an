// ============================================================
// Cấu hình hệ thống Admin — Validation, unsaved changes, reset
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { AppBreadcrumb } from '../shared/AppBreadcrumb';
import { configApi } from '../../services/api';
import type { SystemConfig } from '../../types';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';

type ConfigErrors = Partial<Record<keyof SystemConfig, string>>;

const DEFAULT_CONFIG: SystemConfig = {
  siteName: 'B2B Marketplace',
  siteDescription: 'Sàn thương mại điện tử B2B hàng đầu Việt Nam',
  currency: 'VND',
  taxRate: 10,
  minOrderValue: 100000,
  defaultPageSize: 10,
  maintenanceMode: false,
  emailNotifications: true,
  autoApproveProducts: false,
  maxUploadSize: 10,
};

function validateConfig(config: SystemConfig): ConfigErrors {
  const errors: ConfigErrors = {};
  if (!config.siteName.trim()) errors.siteName = 'Tên sàn không được để trống';
  else if (config.siteName.length > 100) errors.siteName = 'Tên sàn tối đa 100 ký tự';

  if (!config.siteDescription.trim()) errors.siteDescription = 'Mô tả không được để trống';
  else if (config.siteDescription.length > 500) errors.siteDescription = 'Mô tả tối đa 500 ký tự';

  if (!config.currency.trim()) errors.currency = 'Đơn vị tiền tệ không được để trống';

  if (config.taxRate < 0 || config.taxRate > 100) errors.taxRate = 'Thuế suất phải từ 0 đến 100%';
  if (config.minOrderValue < 0) errors.minOrderValue = 'Giá trị tối thiểu phải ≥ 0';
  if (config.defaultPageSize < 5 || config.defaultPageSize > 100)
    errors.defaultPageSize = 'Số mục mỗi trang phải từ 5 đến 100';
  if (config.maxUploadSize < 1 || config.maxUploadSize > 100)
    errors.maxUploadSize = 'Giới hạn upload từ 1 đến 100 MB';

  return errors;
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [original, setOriginal] = useState<SystemConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ConfigErrors>({});
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    configApi.get().then(c => {
      setConfig(c);
      setOriginal(c);
    });
  }, []);

  const hasChanges = useMemo(() => {
    if (!config || !original) return false;
    return JSON.stringify(config) !== JSON.stringify(original);
  }, [config, original]);

  const update = useCallback(<K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
    setConfig(prev => prev ? { ...prev, [key]: value } : null);
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    const errs = validateConfig(config);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Vui lòng sửa các lỗi trước khi lưu');
      return;
    }
    setSaving(true);
    try {
      await configApi.update(config);
      setOriginal(config);
      toast.success('Đã lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_CONFIG });
    setErrors({});
    setShowResetDialog(false);
    toast.info('Đã khôi phục cấu hình mặc định (chưa lưu)');
  };

  const handleRevert = () => {
    if (original) {
      setConfig({ ...original });
      setErrors({});
      toast.info('Đã hoàn tác thay đổi');
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasChanges]);

  if (!config) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const fieldClass = (key: keyof SystemConfig) =>
    errors[key] ? 'border-destructive' : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <AppBreadcrumb items={[{ label: 'Quản trị', href: '/admin' }, { label: 'Cấu hình' }]} />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1>Cấu hình hệ thống</h1>
          <p className="text-muted-foreground">Thiết lập các thông số cho sàn TMĐT</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="ghost" size="sm" onClick={handleRevert}>
              Hoàn tác
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)}>
            <RotateCcw className="mr-1 h-4 w-4" /> Mặc định
          </Button>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bạn có thay đổi chưa lưu. Nhấn &ldquo;Lưu cấu hình&rdquo; để áp dụng.
          </AlertDescription>
        </Alert>
      )}

      {/* Thông tin chung */}
      <Card>
        <CardHeader><CardTitle>Thông tin chung</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Tên sàn *</Label>
            <Input
              value={config.siteName}
              onChange={e => update('siteName', e.target.value)}
              className={fieldClass('siteName')}
              maxLength={100}
            />
            {errors.siteName && <p className="text-destructive">{errors.siteName}</p>}
            <p className="text-muted-foreground text-xs">{config.siteName.length}/100 ký tự</p>
          </div>
          <div className="grid gap-2">
            <Label>Mô tả *</Label>
            <Input
              value={config.siteDescription}
              onChange={e => update('siteDescription', e.target.value)}
              className={fieldClass('siteDescription')}
              maxLength={500}
            />
            {errors.siteDescription && <p className="text-destructive">{errors.siteDescription}</p>}
            <p className="text-muted-foreground text-xs">{config.siteDescription.length}/500 ký tự</p>
          </div>
        </CardContent>
      </Card>

      {/* Tài chính */}
      <Card>
        <CardHeader><CardTitle>Tài chính & Giao dịch</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Đơn vị tiền tệ *</Label>
              <Input
                value={config.currency}
                onChange={e => update('currency', e.target.value)}
                className={fieldClass('currency')}
              />
              {errors.currency && <p className="text-destructive">{errors.currency}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Thuế suất (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={config.taxRate}
                onChange={e => update('taxRate', Number(e.target.value))}
                className={fieldClass('taxRate')}
              />
              {errors.taxRate && <p className="text-destructive">{errors.taxRate}</p>}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Giá trị đơn hàng tối thiểu (VNĐ)</Label>
              <Input
                type="number"
                min={0}
                value={config.minOrderValue}
                onChange={e => update('minOrderValue', Number(e.target.value))}
                className={fieldClass('minOrderValue')}
              />
              {errors.minOrderValue && <p className="text-destructive">{errors.minOrderValue}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Số mục mỗi trang mặc định</Label>
              <Input
                type="number"
                min={5}
                max={100}
                value={config.defaultPageSize}
                onChange={e => update('defaultPageSize', Number(e.target.value))}
                className={fieldClass('defaultPageSize')}
              />
              {errors.defaultPageSize && <p className="text-destructive">{errors.defaultPageSize}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chức năng */}
      <Card>
        <CardHeader><CardTitle>Chức năng hệ thống</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Chế độ bảo trì</Label>
              <p className="text-muted-foreground">Tạm ngưng hoạt động để bảo trì</p>
            </div>
            <Switch checked={config.maintenanceMode} onCheckedChange={v => update('maintenanceMode', v)} />
          </div>
          {config.maintenanceMode && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Chế độ bảo trì đang BẬT. Người dùng sẽ không thể truy cập hệ thống.
              </AlertDescription>
            </Alert>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Thông báo email</Label>
              <p className="text-muted-foreground">Gửi email thông báo tự động</p>
            </div>
            <Switch checked={config.emailNotifications} onCheckedChange={v => update('emailNotifications', v)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Tự động duyệt sản phẩm</Label>
              <p className="text-muted-foreground">Sản phẩm mới không cần admin duyệt</p>
            </div>
            <Switch checked={config.autoApproveProducts} onCheckedChange={v => update('autoApproveProducts', v)} />
          </div>
          <Separator />
          <div className="grid gap-2">
            <Label>Giới hạn upload (MB)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={config.maxUploadSize}
              onChange={e => update('maxUploadSize', Number(e.target.value))}
              className={fieldClass('maxUploadSize')}
            />
            {errors.maxUploadSize && <p className="text-destructive">{errors.maxUploadSize}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
      </div>

      {/* Reset dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khôi phục mặc định?</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả cấu hình sẽ được đặt về giá trị mặc định. Bạn vẫn cần nhấn &ldquo;Lưu cấu hình&rdquo; để áp dụng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Khôi phục</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
