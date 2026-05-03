// ============================================================
// FormDialog — Dialog form nâng cấp UI-B Đợt 7
// B7.01–B7.03: animation, multi-step, sticky footer
// ============================================================

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** B7.02: Multi-step progress */
  steps?: string[];
  currentStep?: number;
  /** Thêm nút phụ (VD: "Xoá") */
  destructiveLabel?: string;
  onDestructive?: () => void;
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// B7.02: Step indicator
function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 py-3 px-4 border-b border-border/50 bg-muted/30">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        return (
          <div key={idx} className="flex items-center">
            {idx > 0 && (
              <div className={`h-px w-6 sm:w-10 mx-1 transition-colors ${isDone ? 'bg-primary' : 'bg-border'}`} />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`
                  h-6 w-6 rounded-full flex items-center justify-center text-xs transition-all
                  ${isActive ? 'bg-primary text-primary-foreground shadow-theme-sm' : ''}
                  ${isDone ? 'bg-primary/20 text-primary' : ''}
                  ${!isActive && !isDone ? 'bg-muted text-muted-foreground' : ''}
                `}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={`hidden sm:inline text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FormDialog({
  open,
  onClose,
  title,
  description,
  onSubmit,
  submitLabel = 'Lưu',
  cancelLabel = 'Huỷ',
  loading = false,
  children,
  size = 'md',
  steps,
  currentStep = 0,
  destructiveLabel,
  onDestructive,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className={`${sizeMap[size]} p-0 gap-0 overflow-hidden`}>
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle style={{ fontFamily: 'var(--font-heading)' }}>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* B7.02: Steps */}
        {steps && steps.length > 1 && (
          <StepIndicator steps={steps} currentStep={currentStep} />
        )}

        {/* Content */}
        <ScrollArea className="max-h-[60vh]">
          <div className="grid gap-4 py-4 px-5">
            {children}
          </div>
        </ScrollArea>

        {/* B7.03: Sticky footer */}
        <DialogFooter className="px-5 py-3 border-t border-border/50 bg-muted/20 flex-row gap-2">
          {destructiveLabel && onDestructive && (
            <Button
              variant="destructive"
              onClick={onDestructive}
              disabled={loading}
              className="mr-auto"
            >
              {destructiveLabel}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Đang xử lý...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
