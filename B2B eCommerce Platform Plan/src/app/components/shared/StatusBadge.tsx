// ============================================================
// StatusBadge — Badge trạng thái với dot indicator
// A4.03–A4.04: dot trước text, size prop (sm/md)
// ============================================================

import { Badge } from '../ui/badge';

const statusColorMap: Record<string, { badge: string; dot: string }> = {
  // Đơn hàng
  'Chờ xác nhận': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Đã xác nhận': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Đang xử lý': { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Đang giao hàng': { badge: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'Đã giao': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Đã huỷ': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  'Hoàn trả': { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  // Sản phẩm
  'Chờ duyệt': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Đã duyệt': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Từ chối': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  'Hết hàng': { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  'Ẩn': { badge: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  // Người dùng
  'Hoạt động': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Bị khoá': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  'Chờ xác minh': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  // RFQ / Báo giá
  'Bản nháp': { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  'Đã gửi': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Đang báo giá': { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Đã báo giá': { badge: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'Chấp nhận': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Hết hạn': { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  'Chờ phản hồi': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  // Hợp đồng
  'Chờ ký': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Đang thực hiện': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Hoàn thành': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Tranh chấp': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  // Milestone
  'Chưa đến hạn': { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  'Quá hạn': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  // Tồn kho
  'Đủ hàng': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Sắp hết': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Thấp': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Hết': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  // Stock movement
  'Nhập kho': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Xuất kho': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Chuyển kho': { badge: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'Điều chỉnh': { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  'Trả hàng': { badge: 'bg-pink-50 text-pink-700 border-pink-200', dot: 'bg-pink-500' },
  // Vận chuyển
  'Chuẩn bị': { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  'Đã lấy hàng': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Đang vận chuyển': { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Đang giao': { badge: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'Thất bại': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  // Thanh toán
  'Chờ thanh toán': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Đã thanh toán một phần': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Đã thanh toán': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Hoàn tiền': { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  // Khuyến mãi
  'Đang chạy': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Sắp diễn ra': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Tắt': { badge: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  // Chứng chỉ DN
  'Chưa xác minh': { badge: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  'Đang xem xét': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Đã xác minh': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  // Hoá đơn
  'Đã xuất': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  // Trả hàng & Hoàn tiền
  'Đã hoàn tiền': { badge: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  'Đã đóng': { badge: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
  // Tín dụng
  'Tạm ngưng': { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  // Nhật ký
  'Tạo': { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Sửa': { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  'Xoá': { badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  'Duyệt': { badge: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  'Đăng nhập': { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'Đăng xuất': { badge: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

const defaultColors = { badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export function StatusBadge({ status, className = '', size = 'md', showDot = true }: StatusBadgeProps) {
  const colors = statusColorMap[status] ?? defaultColors;
  const sizeClass = size === 'sm' ? 'text-[11px] px-1.5 py-0' : '';

  return (
    <Badge variant="outline" className={`${colors.badge} ${sizeClass} ${className}`}>
      {showDot && (
        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 shrink-0 ${colors.dot}`} />
      )}
      {status}
    </Badge>
  );
}
