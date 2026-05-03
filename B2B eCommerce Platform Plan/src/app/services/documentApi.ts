// ============================================================
// Service API — Trung tâm tài liệu (Nhóm 37)
// ============================================================

import type {
  Document, DocCategory, DocStatus,
  PaginationParams, SortParams, PaginatedResponse,
} from '../types';

// --- Mock documents (15 tài liệu mẫu) ---
const mockDocuments: Document[] = [
  // 3 Hợp đồng
  {
    id: 'doc-001', name: 'Hợp đồng cung cấp thép xây dựng', fileName: 'HD_Thep_2026.pdf', fileType: 'pdf', fileSize: 2_450_000,
    category: 'Hợp đồng', entityType: 'contract', entityId: 'contract-001', tags: ['thép', 'xây dựng', '2026'], version: 2,
    uploadedBy: 'user-001', uploadedByName: 'Nguyễn Văn Mua', companyId: 'buyer-001', companyName: 'Công ty TNHH Xây Dựng ABC',
    description: 'Hợp đồng khung cung cấp thép xây dựng năm 2026', status: 'Hiệu lực',
    createdAt: '2026-01-15T08:30:00Z', updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'doc-002', name: 'Phụ lục HĐ — Điều khoản thanh toán', fileName: 'PL_HD_ThanhToan.docx', fileType: 'docx', fileSize: 580_000,
    category: 'Hợp đồng', entityType: 'contract', entityId: 'contract-001', tags: ['phụ lục', 'thanh toán'], version: 1,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Phụ lục bổ sung điều khoản thanh toán trả chậm 60 ngày', status: 'Hiệu lực',
    createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'doc-003', name: 'Hợp đồng vận chuyển Q1/2026', fileName: 'HD_VanChuyen_Q1.pdf', fileType: 'pdf', fileSize: 1_800_000,
    category: 'Hợp đồng', tags: ['vận chuyển', 'Q1'], version: 1,
    uploadedBy: 'user-001', uploadedByName: 'Nguyễn Văn Mua', companyId: 'buyer-001', companyName: 'Công ty TNHH Xây Dựng ABC',
    description: 'Hợp đồng vận chuyển hàng hoá quý 1 năm 2026', status: 'Lưu trữ',
    createdAt: '2025-12-20T14:00:00Z', updatedAt: '2026-03-01T08:00:00Z',
  },
  // 3 Hoá đơn
  {
    id: 'doc-004', name: 'Hoá đơn GTGT #INV-2026-001', fileName: 'INV_2026_001.pdf', fileType: 'pdf', fileSize: 320_000,
    category: 'Hoá đơn', entityType: 'invoice', entityId: 'inv-001', tags: ['GTGT', 'tháng 1'], version: 1,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Hoá đơn giá trị gia tăng cho đơn hàng ORD-2026-001', status: 'Hiệu lực',
    createdAt: '2026-01-25T10:30:00Z', updatedAt: '2026-01-25T10:30:00Z',
  },
  {
    id: 'doc-005', name: 'Hoá đơn GTGT #INV-2026-015', fileName: 'INV_2026_015.pdf', fileType: 'pdf', fileSize: 285_000,
    category: 'Hoá đơn', entityType: 'invoice', entityId: 'inv-002', tags: ['GTGT', 'tháng 2'], version: 1,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Hoá đơn GTGT tháng 2/2026', status: 'Hiệu lực',
    createdAt: '2026-02-15T11:00:00Z', updatedAt: '2026-02-15T11:00:00Z',
  },
  {
    id: 'doc-006', name: 'Hoá đơn điều chỉnh #ADJ-001', fileName: 'ADJ_001.pdf', fileType: 'pdf', fileSize: 210_000,
    category: 'Hoá đơn', entityType: 'invoice', entityId: 'inv-001', tags: ['điều chỉnh'], version: 1,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Hoá đơn điều chỉnh do chênh lệch số lượng', status: 'Hiệu lực',
    createdAt: '2026-02-20T08:00:00Z', updatedAt: '2026-02-20T08:00:00Z',
  },
  // 2 Chứng chỉ
  {
    id: 'doc-007', name: 'Chứng chỉ ISO 9001:2015', fileName: 'ISO9001_NCC_ThepMN.pdf', fileType: 'pdf', fileSize: 4_200_000,
    category: 'Chứng chỉ', tags: ['ISO', 'chất lượng'], version: 3,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Chứng chỉ hệ thống quản lý chất lượng ISO 9001:2015', status: 'Hiệu lực',
    createdAt: '2025-06-01T07:00:00Z', updatedAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'doc-008', name: 'Giấy phép kinh doanh — NCC Thép MN', fileName: 'GPKD_ThepMN.png', fileType: 'png', fileSize: 3_100_000,
    category: 'Chứng chỉ', tags: ['GPKD', 'pháp lý'], version: 1,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Giấy phép kinh doanh bản scan màu', status: 'Hiệu lực',
    createdAt: '2025-03-15T06:00:00Z', updatedAt: '2025-03-15T06:00:00Z',
  },
  // 2 Báo giá
  {
    id: 'doc-009', name: 'Bảng báo giá thép hình Q1/2026', fileName: 'BaoGia_ThepHinh_Q1.xlsx', fileType: 'xlsx', fileSize: 890_000,
    category: 'Báo giá', tags: ['thép hình', 'Q1', 'báo giá'], version: 2,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Bảng báo giá chi tiết các loại thép hình quý 1/2026', status: 'Hiệu lực',
    createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'doc-010', name: 'Báo giá xi măng đặc biệt', fileName: 'BaoGia_XiMang.pdf', fileType: 'pdf', fileSize: 450_000,
    category: 'Báo giá', tags: ['xi măng', 'đặc biệt'], version: 1,
    uploadedBy: 'user-003', uploadedByName: 'Lê Văn NCC', companyId: 'seller-002', companyName: 'NCC Vật Liệu Bắc',
    description: 'Báo giá xi măng PC50 và PCB40 cho dự án lớn', status: 'Lưu trữ',
    createdAt: '2025-11-20T14:00:00Z', updatedAt: '2025-12-01T08:00:00Z',
  },
  // 2 Phiếu xuất
  {
    id: 'doc-011', name: 'Phiếu xuất kho #PXK-2026-045', fileName: 'PXK_045.pdf', fileType: 'pdf', fileSize: 180_000,
    category: 'Phiếu xuất', entityType: 'order', entityId: 'order-001', tags: ['xuất kho', 'tháng 2'], version: 1,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Phiếu xuất kho cho đơn hàng ORD-2026-001', status: 'Hiệu lực',
    createdAt: '2026-02-10T07:30:00Z', updatedAt: '2026-02-10T07:30:00Z',
  },
  {
    id: 'doc-012', name: 'Phiếu xuất kho #PXK-2026-062', fileName: 'PXK_062.xlsx', fileType: 'xlsx', fileSize: 150_000,
    category: 'Phiếu xuất', entityType: 'order', entityId: 'order-002', tags: ['xuất kho', 'tháng 3'], version: 1,
    uploadedBy: 'user-002', uploadedByName: 'Trần Thị Seller', companyId: 'seller-001', companyName: 'NCC Thép Miền Nam',
    description: 'Phiếu xuất kho cho đơn hàng ORD-2026-005', status: 'Hiệu lực',
    createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z',
  },
  // 2 GRN
  {
    id: 'doc-013', name: 'Biên bản nhận hàng #GRN-2026-012', fileName: 'GRN_012.pdf', fileType: 'pdf', fileSize: 520_000,
    category: 'GRN', entityType: 'grn', entityId: 'grn-001', tags: ['nhận hàng', 'thép'], version: 1,
    uploadedBy: 'user-001', uploadedByName: 'Nguyễn Văn Mua', companyId: 'buyer-001', companyName: 'Công ty TNHH Xây Dựng ABC',
    description: 'Biên bản nhận hàng thép — đạt chất lượng', status: 'Hiệu lực',
    createdAt: '2026-02-12T14:00:00Z', updatedAt: '2026-02-12T14:00:00Z',
  },
  {
    id: 'doc-014', name: 'Biên bản GRN có vấn đề #GRN-2026-018', fileName: 'GRN_018_issue.pdf', fileType: 'pdf', fileSize: 780_000,
    category: 'GRN', entityType: 'grn', entityId: 'grn-002', tags: ['nhận hàng', 'lỗi', 'khiếu nại'], version: 2,
    uploadedBy: 'user-001', uploadedByName: 'Nguyễn Văn Mua', companyId: 'buyer-001', companyName: 'Công ty TNHH Xây Dựng ABC',
    description: 'Biên bản nhận hàng có vấn đề — thiếu số lượng + hàng hư hỏng', status: 'Hiệu lực',
    createdAt: '2026-02-28T10:00:00Z', updatedAt: '2026-03-02T08:00:00Z',
  },
  // 1 Khác
  {
    id: 'doc-015', name: 'Hướng dẫn sử dụng sàn B2B', fileName: 'Huong_dan_B2B.pdf', fileType: 'pdf', fileSize: 5_600_000,
    category: 'Khác', tags: ['hướng dẫn', 'nội bộ'], version: 1,
    uploadedBy: 'user-001', uploadedByName: 'Nguyễn Văn Mua', companyId: 'buyer-001', companyName: 'Công ty TNHH Xây Dựng ABC',
    description: 'Tài liệu hướng dẫn sử dụng sàn thương mại điện tử B2B cho nhân viên', status: 'Hiệu lực',
    createdAt: '2025-10-01T08:00:00Z', updatedAt: '2025-10-01T08:00:00Z',
  },
];

// --- Helper ---
function delay(ms = 200): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

let docs = [...mockDocuments];

// --- Document API ---
export const documentApi = {
  /** Lấy tài liệu theo user / company */
  async getByUser(
    userId: string,
    pagination: PaginationParams,
    sort: SortParams,
    filters?: { category?: DocCategory; status?: DocStatus; fileType?: string; tags?: string[]; dateFrom?: string; dateTo?: string },
    search?: string,
  ): Promise<PaginatedResponse<Document>> {
    await delay();
    let filtered = docs.filter(d => d.status !== 'Đã xoá');

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters?.category) filtered = filtered.filter(d => d.category === filters.category);
    if (filters?.status) filtered = filtered.filter(d => d.status === filters.status);
    if (filters?.fileType) filtered = filtered.filter(d => d.fileType === filters.fileType);
    if (filters?.tags && filters.tags.length > 0) {
      filtered = filtered.filter(d => filters.tags!.some(t => d.tags.includes(t)));
    }
    if (filters?.dateFrom) filtered = filtered.filter(d => d.createdAt >= filters.dateFrom!);
    if (filters?.dateTo) filtered = filtered.filter(d => d.createdAt <= filters.dateTo!);

    // Sort
    filtered.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sort.field];
      const bVal = (b as Record<string, unknown>)[sort.field];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    const total = filtered.length;
    const start = (pagination.page - 1) * pagination.pageSize;
    const data = filtered.slice(start, start + pagination.pageSize);

    return { data, total, page: pagination.page, pageSize: pagination.pageSize, totalPages: Math.ceil(total / pagination.pageSize) };
  },

  /** Lấy tài liệu theo entity (order, contract, invoice, grn) */
  async getByEntity(entityType: string, entityId: string): Promise<Document[]> {
    await delay();
    return docs.filter(d => d.entityType === entityType && d.entityId === entityId && d.status !== 'Đã xoá');
  },

  /** Upload tài liệu mới */
  async upload(data: Partial<Document>): Promise<Document> {
    await delay(300);
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: data.name || 'Tài liệu mới',
      fileName: data.fileName || 'file.pdf',
      fileType: data.fileType || 'pdf',
      fileSize: data.fileSize || 0,
      category: data.category || 'Khác',
      entityType: data.entityType,
      entityId: data.entityId,
      tags: data.tags || [],
      version: 1,
      uploadedBy: data.uploadedBy || 'user-001',
      uploadedByName: data.uploadedByName || 'Người dùng',
      companyId: data.companyId || 'buyer-001',
      companyName: data.companyName || 'Công ty',
      description: data.description || '',
      status: 'Hiệu lực',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    docs = [newDoc, ...docs];
    return newDoc;
  },

  /** Cập nhật tài liệu */
  async update(id: string, data: Partial<Document>): Promise<Document | null> {
    await delay(200);
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) return null;
    docs[idx] = { ...docs[idx], ...data, updatedAt: new Date().toISOString() };
    return docs[idx];
  },

  /** Xoá (soft delete) */
  async delete(id: string): Promise<boolean> {
    await delay(200);
    const idx = docs.findIndex(d => d.id === id);
    if (idx === -1) return false;
    docs[idx] = { ...docs[idx], status: 'Đã xoá', updatedAt: new Date().toISOString() };
    return true;
  },

  /** Tìm kiếm full-text */
  async search(query: string): Promise<Document[]> {
    await delay();
    if (!query) return [];
    const q = query.toLowerCase();
    return docs.filter(d =>
      d.status !== 'Đã xoá' && (
        d.name.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      )
    ).slice(0, 20);
  },

  /** Thống kê */
  async getStats(userId?: string): Promise<{
    total: number;
    byCategory: { category: DocCategory; count: number }[];
    totalSize: number;
    recentCount: number;
  }> {
    await delay();
    const active = docs.filter(d => d.status !== 'Đã xoá');
    const categories: DocCategory[] = ['Hợp đồng', 'Hoá đơn', 'Chứng chỉ', 'Báo giá', 'Phiếu xuất', 'GRN', 'Khác'];
    const byCategory = categories.map(cat => ({
      category: cat,
      count: active.filter(d => d.category === cat).length,
    }));
    const totalSize = active.reduce((s, d) => s + d.fileSize, 0);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 3600_000).toISOString();
    const recentCount = active.filter(d => d.createdAt >= oneWeekAgo).length;

    return { total: active.length, byCategory, totalSize, recentCount };
  },

  /** Lấy lịch sử version (giả lập) */
  async getVersionHistory(docId: string): Promise<{ version: number; updatedBy: string; updatedAt: string; note: string }[]> {
    await delay();
    const doc = docs.find(d => d.id === docId);
    if (!doc) return [];
    const history = [];
    for (let v = doc.version; v >= 1; v--) {
      const daysAgo = (doc.version - v) * 15;
      const dt = new Date(new Date(doc.createdAt).getTime() + daysAgo * 86_400_000);
      history.push({
        version: v,
        updatedBy: doc.uploadedByName,
        updatedAt: dt.toISOString(),
        note: v === doc.version ? 'Phiên bản hiện tại' : `Cập nhật v${v}`,
      });
    }
    return history;
  },

  formatFileSize,
};
