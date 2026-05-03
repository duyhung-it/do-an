// ============================================================
// Service: RFQ Attachment API (DB-D.03/D.06)
// Quản lý tài liệu đính kèm cho yêu cầu báo giá
// ============================================================

import type { RFQAttachment } from '../types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

let mockAttachments: RFQAttachment[] = [
  {
    id: 'rfqa-001', rfqId: 'rfq-001',
    fileName: 'Bản vẽ kỹ thuật PCB.pdf', fileUrl: '/files/pcb-design.pdf',
    fileSize: 2450000, fileType: 'application/pdf',
    uploadedBy: 'user-001', createdAt: '2025-03-01',
  },
  {
    id: 'rfqa-002', rfqId: 'rfq-001',
    fileName: 'Yêu cầu kỹ thuật chi tiết.xlsx', fileUrl: '/files/tech-specs.xlsx',
    fileSize: 185000, fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    uploadedBy: 'user-001', createdAt: '2025-03-01',
  },
  {
    id: 'rfqa-003', rfqId: 'rfq-002',
    fileName: 'Mẫu vải yêu cầu.jpg', fileUrl: '/files/fabric-sample.jpg',
    fileSize: 890000, fileType: 'image/jpeg',
    uploadedBy: 'user-002', createdAt: '2025-03-05',
  },
  {
    id: 'rfqa-004', rfqId: 'rfq-004',
    fileName: 'Kích thước hộp carton.pdf', fileUrl: '/files/carton-size.pdf',
    fileSize: 1200000, fileType: 'application/pdf',
    uploadedBy: 'user-008', createdAt: '2025-03-08',
  },
  {
    id: 'rfqa-005', rfqId: 'rfq-005',
    fileName: 'Chứng nhận organic mẫu.pdf', fileUrl: '/files/organic-cert.pdf',
    fileSize: 540000, fileType: 'application/pdf',
    uploadedBy: 'user-001', createdAt: '2025-02-15',
  },
];

let nextId = 6;

export const rfqAttachmentApi = {
  /** Lấy danh sách tài liệu theo RFQ */
  async getByRFQ(rfqId: string): Promise<RFQAttachment[]> {
    await delay(80);
    return mockAttachments
      .filter(a => a.rfqId === rfqId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Thêm tài liệu đính kèm */
  async add(rfqId: string, data: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    uploadedBy: string;
  }): Promise<RFQAttachment> {
    await delay(150);
    const attachment: RFQAttachment = {
      id: `rfqa-${String(nextId++).padStart(3, '0')}`,
      rfqId,
      ...data,
      createdAt: new Date().toISOString(),
    };
    mockAttachments.push(attachment);
    return attachment;
  },

  /** Xoá tài liệu đính kèm */
  async remove(attachmentId: string): Promise<void> {
    await delay(100);
    mockAttachments = mockAttachments.filter(a => a.id !== attachmentId);
  },

  /** Lấy tất cả (admin) */
  async getAll(): Promise<RFQAttachment[]> {
    await delay(100);
    return [...mockAttachments].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};
