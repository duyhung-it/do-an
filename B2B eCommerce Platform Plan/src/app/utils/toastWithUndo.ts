// ============================================================
// Toast with Undo — Hiển thị toast có nút "Hoàn tác" (Nhóm 21C)
// 21C.01-04: 5 giây timeout, progress bar, helper function
// ============================================================

import { toast } from 'sonner';

/**
 * Hiển thị toast có nút "Hoàn tác" với countdown.
 * @param message Nội dung toast (VD: "Đã xoá sản phẩm")
 * @param undoAction Callback khi nhấn "Hoàn tác"
 * @param timeout Thời gian chờ trước khi xác nhận (ms), mặc định 5000
 */
export function toastWithUndo(
  message: string,
  undoAction: () => void | Promise<void>,
  timeout = 5000,
): void {
  let undone = false;

  toast(message, {
    duration: timeout,
    action: {
      label: 'Hoàn tác',
      onClick: () => {
        undone = true;
        void undoAction();
        toast.success('Đã hoàn tác thành công');
      },
    },
    onAutoClose: () => {
      if (!undone) {
        // Action is confirmed (no undo)
      }
    },
  });
}
