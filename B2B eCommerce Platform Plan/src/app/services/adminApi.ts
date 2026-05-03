// ============================================================
// API Admin bổ sung — Chứng chỉ, Nhật ký, Hoá đơn, Cấu hình
// ============================================================

import type {
  PaginationParams, SortParams, PaginatedResponse, ActiveFilter,
  BusinessCertificate, VerificationStatus, ActivityLog,
  Invoice, InvoiceStatus,
  AdminNotificationConfig, PlatformFee, MaintenanceConfig,
  EmailTemplate, BannerConfig, SEOConfig, AdminQuickStats,
} from '../types';

import {
  mockCertificates, mockActivityLogs, mockInvoices,
  mockAdminNotificationConfig, mockPlatformFees, mockMaintenanceConfig,
  mockEmailTemplates, mockBannerConfigs, mockSEOConfig, mockAdminQuickStats,
} from '../data/mockAdminData';

// --- Tiện ích ---
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

function paginate<T>(
  data: T[],
  { page, pageSize }: PaginationParams,
): PaginatedResponse<T> {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  return {
    data: data.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

function sortData<T>(data: T[], sort?: SortParams): T[] {
  if (!sort) return data;
  return [...data].sort((a, b) => {
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
}

function filterData<T extends Record<string, unknown>>(data: T[], filters: ActiveFilter[]): T[] {
  if (!filters.length) return data;
  return data.filter(item =>
    filters.every(f => {
      const val = item[f.key];
      if (Array.isArray(f.value)) {
        if (f.value.length === 2 && typeof f.value[0] === 'number') {
          const numVal = Number(val);
          return numVal >= (f.value as [number, number])[0] && numVal <= (f.value as [number, number])[1];
        }
        return (f.value as string[]).includes(String(val));
      }
      return String(val).toLowerCase().includes(String(f.value).toLowerCase());
    }),
  );
}

// ============================================================
// API Chứng chỉ doanh nghiệp
// ============================================================
let certificates: BusinessCertificate[] = [...mockCertificates];

export const certificateApi = {
  async getPaginated(
    pagination: PaginationParams,
    sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ): Promise<PaginatedResponse<BusinessCertificate>> {
    await delay();
    let data = [...certificates];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(c =>
        c.supplierName.toLowerCase().includes(s) ||
        c.name.toLowerCase().includes(s) ||
        c.issuedBy.toLowerCase().includes(s) ||
        c.type.toLowerCase().includes(s),
      );
    }
    if (filters) data = filterData(data as unknown as Record<string, unknown>[], filters) as unknown as BusinessCertificate[];
    data = sortData(data, sort);
    return paginate(data, pagination);
  },

  async getAll(): Promise<BusinessCertificate[]> {
    await delay();
    return [...certificates];
  },

  async getById(id: string): Promise<BusinessCertificate | undefined> {
    await delay();
    return certificates.find(c => c.id === id);
  },

  async getBySeller(supplierId: string): Promise<BusinessCertificate[]> {
    await delay();
    return certificates.filter(c => c.supplierId === supplierId);
  },

  async review(id: string, status: VerificationStatus, note: string): Promise<BusinessCertificate> {
    await delay();
    const idx = certificates.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Không tìm thấy chứng chỉ');
    certificates[idx] = {
      ...certificates[idx],
      status,
      reviewNote: note,
      reviewedBy: 'Admin Hệ thống',
      reviewedAt: new Date().toISOString().slice(0, 10),
    };
    return certificates[idx];
  },

  async upload(data: Omit<BusinessCertificate, 'id' | 'createdAt' | 'status'>): Promise<BusinessCertificate> {
    await delay();
    const newCert: BusinessCertificate = {
      ...data,
      id: `cert-${Date.now()}`,
      status: 'Chưa xác minh',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    certificates.unshift(newCert);
    return newCert;
  },

  async delete(id: string): Promise<void> {
    await delay();
    certificates = certificates.filter(c => c.id !== id);
  },

  async getStats(): Promise<Record<VerificationStatus, number>> {
    await delay();
    const stats: Record<string, number> = {
      'Chưa xác minh': 0, 'Đang xem xét': 0, 'Đã xác minh': 0, 'Từ chối': 0, 'Hết hạn': 0,
    };
    for (const c of certificates) {
      stats[c.status] = (stats[c.status] || 0) + 1;
    }
    return stats as Record<VerificationStatus, number>;
  },

  async getExpiring(days: number): Promise<BusinessCertificate[]> {
    await delay();
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + days);
    const todayStr = today.toISOString().slice(0, 10);
    const futureStr = future.toISOString().slice(0, 10);
    return certificates.filter(c =>
      c.status === 'Đã xác minh' && c.expiryDate >= todayStr && c.expiryDate <= futureStr,
    );
  },
};

// ============================================================
// API Nhật ký hoạt động
// ============================================================
let activityLogs: ActivityLog[] = [...mockActivityLogs];

export const activityApi = {
  async getPaginated(
    pagination: PaginationParams,
    sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ): Promise<PaginatedResponse<ActivityLog>> {
    await delay();
    let data = [...activityLogs];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(log =>
        log.userName.toLowerCase().includes(s) ||
        log.entityName.toLowerCase().includes(s) ||
        log.details.toLowerCase().includes(s) ||
        log.entity.toLowerCase().includes(s),
      );
    }
    if (filters) data = filterData(data as unknown as Record<string, unknown>[], filters) as unknown as ActivityLog[];
    data = sortData(data, sort);
    return paginate(data, pagination);
  },

  async getByUser(userId: string, limit = 20): Promise<ActivityLog[]> {
    await delay();
    return activityLogs
      .filter(log => log.userId === userId)
      .slice(0, limit);
  },

  async getByEntity(entity: string, entityId: string): Promise<ActivityLog[]> {
    await delay();
    return activityLogs.filter(log => log.entity === entity && log.entityId === entityId);
  },

  async getRecent(limit = 10): Promise<ActivityLog[]> {
    await delay();
    return [...activityLogs]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },

  async getStats(dateRange?: [string, string]): Promise<{
    byAction: Record<string, number>;
    byDay: { date: string; count: number }[];
    byUser: { userName: string; count: number }[];
    todayCount: number;
    weekCount: number;
    monthCount: number;
  }> {
    await delay();
    let data = [...activityLogs];
    if (dateRange) {
      data = data.filter(log => log.createdAt >= dateRange[0] && log.createdAt <= dateRange[1]);
    }

    const byAction: Record<string, number> = {};
    const byDayMap: Record<string, number> = {};
    const byUserMap: Record<string, number> = {};

    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    for (const log of data) {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      const day = log.createdAt.slice(0, 10);
      byDayMap[day] = (byDayMap[day] || 0) + 1;
      byUserMap[log.userName] = (byUserMap[log.userName] || 0) + 1;
      if (day === today) todayCount++;
      if (day >= weekAgo) weekCount++;
      if (day >= monthAgo) monthCount++;
    }

    return {
      byAction,
      byDay: Object.entries(byDayMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
      byUser: Object.entries(byUserMap).map(([userName, count]) => ({ userName, count })).sort((a, b) => b.count - a.count),
      todayCount,
      weekCount,
      monthCount,
    };
  },

  async log(data: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
    await delay(50);
    const newLog: ActivityLog = {
      ...data,
      id: `log-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    activityLogs.unshift(newLog);
    return newLog;
  },
};

// ============================================================
// API Hoá đơn
// ============================================================
let invoices: Invoice[] = [...mockInvoices];

export const invoiceApi = {
  async getPaginated(
    pagination: PaginationParams,
    sort?: SortParams,
    filters?: ActiveFilter[],
    search?: string,
  ): Promise<PaginatedResponse<Invoice>> {
    await delay();
    let data = [...invoices];
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(s) ||
        inv.orderNumber.toLowerCase().includes(s) ||
        inv.buyerName.toLowerCase().includes(s) ||
        inv.supplierName.toLowerCase().includes(s) ||
        inv.buyerTaxCode.toLowerCase().includes(s) ||
        inv.supplierTaxCode.toLowerCase().includes(s),
      );
    }
    if (filters) data = filterData(data as unknown as Record<string, unknown>[], filters) as unknown as Invoice[];
    data = sortData(data, sort);
    return paginate(data, pagination);
  },

  async getById(id: string): Promise<Invoice | undefined> {
    await delay();
    return invoices.find(inv => inv.id === id);
  },

  async getBySeller(supplierId: string): Promise<Invoice[]> {
    await delay();
    return invoices.filter(inv => inv.supplierId === supplierId);
  },

  async getByBuyer(buyerId: string): Promise<Invoice[]> {
    await delay();
    return invoices.filter(inv => inv.buyerId === buyerId);
  },

  async getByOrder(orderId: string): Promise<Invoice | undefined> {
    await delay();
    return invoices.find(inv => inv.orderId === orderId);
  },

  async create(data: Omit<Invoice, 'id' | 'createdAt'>): Promise<Invoice> {
    await delay();
    const newInv: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    invoices.unshift(newInv);
    return newInv;
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    await delay();
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx === -1) throw new Error('Không tìm thấy hoá đơn');
    invoices[idx] = { ...invoices[idx], ...data };
    return invoices[idx];
  },

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    await delay();
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx === -1) throw new Error('Không tìm thấy hoá đơn');
    invoices[idx] = {
      ...invoices[idx],
      status,
      ...(status === 'Đã thanh toán' ? { paidDate: new Date().toISOString().slice(0, 10) } : {}),
    };
    return invoices[idx];
  },

  async getStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    totalRevenue: number;
    totalTax: number;
    overdue: number;
  }> {
    await delay();
    const byStatus: Record<string, number> = {};
    let totalRevenue = 0;
    let totalTax = 0;
    let overdue = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const inv of invoices) {
      byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;
      if (inv.totalAmount > 0) {
        totalRevenue += inv.subtotal;
        totalTax += inv.taxAmount;
      }
      if (inv.status === 'Quá hạn' || (inv.dueDate < today && !['Đã thanh toán', 'Đã huỷ'].includes(inv.status))) {
        overdue++;
      }
    }

    return { total: invoices.length, byStatus, totalRevenue, totalTax, overdue };
  },

  async delete(id: string): Promise<void> {
    await delay();
    invoices = invoices.filter(inv => inv.id !== id);
  },
};

// ============================================================
// API Cấu hình Admin nâng cao
// ============================================================
let notificationConfig = { ...mockAdminNotificationConfig };
let platformFees = [...mockPlatformFees];
let maintenanceConfig = { ...mockMaintenanceConfig };
let emailTemplates = [...mockEmailTemplates];
let bannerConfigs = [...mockBannerConfigs];
let seoConfig = { ...mockSEOConfig };

export const adminApi = {
  // --- Quick Stats ---
  async getQuickStats(): Promise<AdminQuickStats> {
    await delay();
    return { ...mockAdminQuickStats };
  },

  // --- Notification Config ---
  async getNotificationConfig(): Promise<AdminNotificationConfig> {
    await delay();
    return { ...notificationConfig };
  },

  async updateNotificationConfig(data: AdminNotificationConfig): Promise<AdminNotificationConfig> {
    await delay();
    notificationConfig = { ...data };
    return notificationConfig;
  },

  // --- Platform Fees ---
  async getPlatformFees(): Promise<PlatformFee[]> {
    await delay();
    return [...platformFees];
  },

  async updatePlatformFee(id: string, data: Partial<PlatformFee>): Promise<PlatformFee> {
    await delay();
    const idx = platformFees.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Không tìm thấy phí');
    platformFees[idx] = { ...platformFees[idx], ...data };
    return platformFees[idx];
  },

  // --- Maintenance ---
  async getMaintenanceConfig(): Promise<MaintenanceConfig> {
    await delay();
    return { ...maintenanceConfig };
  },

  async updateMaintenanceConfig(data: MaintenanceConfig): Promise<MaintenanceConfig> {
    await delay();
    maintenanceConfig = { ...data };
    return maintenanceConfig;
  },

  // --- Email Templates ---
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    await delay();
    return [...emailTemplates];
  },

  async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    await delay();
    const idx = emailTemplates.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Không tìm thấy template');
    emailTemplates[idx] = { ...emailTemplates[idx], ...data };
    return emailTemplates[idx];
  },

  async createEmailTemplate(data: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    await delay();
    const newTemplate: EmailTemplate = { ...data, id: `et-${Date.now()}` };
    emailTemplates.push(newTemplate);
    return newTemplate;
  },

  async deleteEmailTemplate(id: string): Promise<void> {
    await delay();
    emailTemplates = emailTemplates.filter(t => t.id !== id);
  },

  // --- Banners ---
  async getBanners(): Promise<BannerConfig[]> {
    await delay();
    return [...bannerConfigs];
  },

  async createBanner(data: Omit<BannerConfig, 'id'>): Promise<BannerConfig> {
    await delay();
    const newBanner: BannerConfig = { ...data, id: `banner-${Date.now()}` };
    bannerConfigs.push(newBanner);
    return newBanner;
  },

  async updateBanner(id: string, data: Partial<BannerConfig>): Promise<BannerConfig> {
    await delay();
    const idx = bannerConfigs.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Không tìm thấy banner');
    bannerConfigs[idx] = { ...bannerConfigs[idx], ...data };
    return bannerConfigs[idx];
  },

  async deleteBanner(id: string): Promise<void> {
    await delay();
    bannerConfigs = bannerConfigs.filter(b => b.id !== id);
  },

  // --- SEO ---
  async getSEOConfig(): Promise<SEOConfig> {
    await delay();
    return { ...seoConfig };
  },

  async updateSEOConfig(data: SEOConfig): Promise<SEOConfig> {
    await delay();
    seoConfig = { ...data };
    return seoConfig;
  },
};
