// ============================================================
// Routes — B2B eCommerce Platform
// Cập nhật: Đăng ký đầy đủ Seller routes + Buyer B2B routes
// ============================================================
import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { AuthLayout } from './components/auth/AuthLayout';
import { BuyerLayout } from './components/buyer/BuyerLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminGuard } from './components/admin/AdminGuard';
import { SellerGuard } from './components/seller/SellerGuard';
import { BuyerGuard } from './components/buyer/BuyerGuard';
import { SellerLayout } from './components/seller/SellerLayout';

// ---- Auth pages ----
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));

// ---- Storefront (Public) pages ----
const HomePage = lazy(() => import('./components/buyer/HomePage').then(m => ({ default: m.HomePage })));
const ProductListPage = lazy(() => import('./components/buyer/ProductListPage').then(m => ({ default: m.ProductListPage })));
const ProductDetailPage = lazy(() => import('./components/buyer/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ProductComparePage = lazy(() => import('./components/buyer/ProductComparePage').then(m => ({ default: m.ProductComparePage })));
const CartPage = lazy(() => import('./components/buyer/CartPage').then(m => ({ default: m.CartPage })));
const OrderListPage = lazy(() => import('./components/buyer/OrderListPage').then(m => ({ default: m.OrderListPage })));
const OrderDetailPage = lazy(() => import('./components/buyer/OrderDetailPage').then(m => ({ default: m.OrderDetailPage })));
const OrderConfirmationPage = lazy(() => import('./components/buyer/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const SupplierListPage = lazy(() => import('./components/buyer/SupplierListPage').then(m => ({ default: m.SupplierListPage })));
const SupplierDetailPage = lazy(() => import('./components/buyer/SupplierDetailPage').then(m => ({ default: m.SupplierDetailPage })));
const BuyerProfilePage = lazy(() => import('./components/buyer/BuyerProfilePage').then(m => ({ default: m.BuyerProfilePage })));
const BuyerWishlistPage = lazy(() => import('./components/buyer/BuyerWishlistPage').then(m => ({ default: m.BuyerWishlistPage })));
const BuyerReviewsPage = lazy(() => import('./components/buyer/BuyerReviewsPage').then(m => ({ default: m.BuyerReviewsPage })));
const BuyerWarrantyPage = lazy(() => import('./components/buyer/BuyerWarrantyPage').then(m => ({ default: m.BuyerWarrantyPage })));
const BuyerPromotionPage = lazy(() => import('./components/buyer/BuyerPromotionPage').then(m => ({ default: m.BuyerPromotionPage })));
const TradeInPage = lazy(() => import('./components/buyer/TradeInPage').then(m => ({ default: m.TradeInPage })));
const IMEICheckPage = lazy(() => import('./components/buyer/IMEICheckPage').then(m => ({ default: m.IMEICheckPage })));
const BlogPage = lazy(() => import('./components/buyer/BlogPage').then(m => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import('./components/buyer/BlogPage').then(m => ({ default: m.BlogDetailPage })));
const StoreLocatorPage = lazy(() => import('./components/buyer/StoreLocatorPage').then(m => ({ default: m.StoreLocatorPage })));
const PhoneFinderPage = lazy(() => import('./components/buyer/PhoneFinderPage').then(m => ({ default: m.PhoneFinderPage })));
const NotificationCenterPage = lazy(() => import('./components/shared/NotificationCenterPage').then(m => ({ default: m.NotificationCenterPage })));
const NotFoundPage = lazy(() => import('./components/shared/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// ---- Buyer B2B pages (cần đăng nhập) ----
const BuyerDashboardPage = lazy(() => import('./components/buyer/BuyerDashboardPage').then(m => ({ default: m.BuyerDashboardPage })));
const BuyerRFQListPage = lazy(() => import('./components/buyer/BuyerRFQListPage').then(m => ({ default: m.BuyerRFQListPage })));
const BuyerRFQCreatePage = lazy(() => import('./components/buyer/BuyerRFQCreatePage').then(m => ({ default: m.BuyerRFQCreatePage })));
const BuyerRFQDetailPage = lazy(() => import('./components/buyer/BuyerRFQDetailPage').then(m => ({ default: m.BuyerRFQDetailPage })));
const BuyerContractList = lazy(() => import('./components/buyer/BuyerContractList').then(m => ({ default: m.BuyerContractList })));
const BuyerContractDetail = lazy(() => import('./components/buyer/BuyerContractDetail').then(m => ({ default: m.BuyerContractDetail })));
const BuyerPaymentList = lazy(() => import('./components/buyer/BuyerPaymentList').then(m => ({ default: m.BuyerPaymentList })));
const BuyerPaymentDetail = lazy(() => import('./components/buyer/BuyerPaymentDetail').then(m => ({ default: m.BuyerPaymentDetail })));
const BuyerInvoiceListPage = lazy(() => import('./components/buyer/BuyerInvoiceListPage').then(m => ({ default: m.BuyerInvoiceListPage })));
const BuyerInvoiceDetail = lazy(() => import('./components/buyer/BuyerInvoiceDetail').then(m => ({ default: m.BuyerInvoiceDetail })));
const BuyerReturnListPage = lazy(() => import('./components/buyer/BuyerReturnListPage').then(m => ({ default: m.BuyerReturnListPage })));
const BuyerReturnDetail = lazy(() => import('./components/buyer/BuyerReturnDetail').then(m => ({ default: m.BuyerReturnDetail })));
const BuyerShipmentList = lazy(() => import('./components/buyer/BuyerShipmentList').then(m => ({ default: m.BuyerShipmentList })));
const BuyerShipmentDetail = lazy(() => import('./components/buyer/BuyerShipmentDetail').then(m => ({ default: m.BuyerShipmentDetail })));
const BuyerGRNListPage = lazy(() => import('./components/buyer/BuyerGRNListPage').then(m => ({ default: m.BuyerGRNListPage })));
const BuyerGRNDetail = lazy(() => import('./components/buyer/BuyerGRNDetail').then(m => ({ default: m.BuyerGRNDetail })));
const BuyerPRListPage = lazy(() => import('./components/buyer/BuyerPRListPage').then(m => ({ default: m.BuyerPRListPage })));
const BuyerPRDetail = lazy(() => import('./components/buyer/BuyerPRDetail').then(m => ({ default: m.BuyerPRDetail })));
const BuyerBudgetPage = lazy(() => import('./components/buyer/BuyerBudgetPage').then(m => ({ default: m.BuyerBudgetPage })));
const BuyerOrderTemplatePage = lazy(() => import('./components/buyer/BuyerOrderTemplatePage').then(m => ({ default: m.BuyerOrderTemplatePage })));
const BuyerBulkOrderPage = lazy(() => import('./components/buyer/BuyerBulkOrderPage').then(m => ({ default: m.BuyerBulkOrderPage })));
const BuyerQuickOrderPage = lazy(() => import('./components/buyer/BuyerQuickOrderPage').then(m => ({ default: m.BuyerQuickOrderPage })));
const BuyerAnalyticsPage = lazy(() => import('./components/buyer/BuyerAnalyticsPage').then(m => ({ default: m.BuyerAnalyticsPage })));
const BuyerAuctionListPage = lazy(() => import('./components/buyer/BuyerAuctionListPage').then(m => ({ default: m.BuyerAuctionListPage })));
const BuyerAuctionDetail = lazy(() => import('./components/buyer/BuyerAuctionDetail').then(m => ({ default: m.BuyerAuctionDetail })));
const BuyerPriceAgreementPage = lazy(() => import('./components/buyer/BuyerPriceAgreementPage').then(m => ({ default: m.BuyerPriceAgreementPage })));
const BuyerPriceAgreementDetail = lazy(() => import('./components/buyer/BuyerPriceAgreementDetail').then(m => ({ default: m.BuyerPriceAgreementDetail })));
const BuyerTeamPage = lazy(() => import('./components/buyer/BuyerTeamPage').then(m => ({ default: m.BuyerTeamPage })));
const BuyerLoyaltyPage = lazy(() => import('./components/buyer/BuyerLoyaltyPage').then(m => ({ default: m.BuyerLoyaltyPage })));
const BuyerSupplierComparePage = lazy(() => import('./components/buyer/BuyerSupplierComparePage').then(m => ({ default: m.BuyerSupplierComparePage })));

// ---- Seller pages ----
const SellerDashboard = lazy(() => import('./components/seller/SellerDashboard').then(m => ({ default: m.SellerDashboard })));
const SellerProductList = lazy(() => import('./components/seller/SellerProductList').then(m => ({ default: m.SellerProductList })));
const SellerProductForm = lazy(() => import('./components/seller/SellerProductForm').then(m => ({ default: m.SellerProductForm })));
const SellerOrderList = lazy(() => import('./components/seller/SellerOrderList').then(m => ({ default: m.SellerOrderList })));
const SellerOrderDetail = lazy(() => import('./components/seller/SellerOrderDetail').then(m => ({ default: m.SellerOrderDetail })));
const SellerRFQList = lazy(() => import('./components/seller/SellerRFQList').then(m => ({ default: m.SellerRFQList })));
const SellerRFQDetail = lazy(() => import('./components/seller/SellerRFQDetail').then(m => ({ default: m.SellerRFQDetail })));
const SellerContractList = lazy(() => import('./components/seller/SellerContractList').then(m => ({ default: m.SellerContractList })));
const SellerContractDetail = lazy(() => import('./components/seller/SellerContractDetail').then(m => ({ default: m.SellerContractDetail })));
const SellerWarehouse = lazy(() => import('./components/seller/SellerWarehouse').then(m => ({ default: m.SellerWarehouse })));
const SellerShipmentList = lazy(() => import('./components/seller/SellerShipmentList').then(m => ({ default: m.SellerShipmentList })));
const SellerPaymentList = lazy(() => import('./components/seller/SellerPaymentList').then(m => ({ default: m.SellerPaymentList })));
const SellerInvoiceListPage = lazy(() => import('./components/seller/SellerInvoiceListPage').then(m => ({ default: m.SellerInvoiceListPage })));
const SellerInvoiceDetail = lazy(() => import('./components/seller/SellerInvoiceDetail').then(m => ({ default: m.SellerInvoiceDetail })));
const SellerCreditPage = lazy(() => import('./components/seller/SellerCreditPage').then(m => ({ default: m.SellerCreditPage })));
const SellerDebitCreditPage = lazy(() => import('./components/seller/SellerDebitCreditPage').then(m => ({ default: m.SellerDebitCreditPage })));
const SellerDebitCreditDetail = lazy(() => import('./components/seller/SellerDebitCreditDetail').then(m => ({ default: m.SellerDebitCreditDetail })));
const SellerReturnListPage = lazy(() => import('./components/seller/SellerReturnListPage').then(m => ({ default: m.SellerReturnListPage })));
const SellerReturnDetail = lazy(() => import('./components/seller/SellerReturnDetail').then(m => ({ default: m.SellerReturnDetail })));
const SellerReviewsPage = lazy(() => import('./components/seller/SellerReviewsPage').then(m => ({ default: m.SellerReviewsPage })));
const SellerPromotionList = lazy(() => import('./components/seller/SellerPromotionList').then(m => ({ default: m.SellerPromotionList })));
const SellerStaffList = lazy(() => import('./components/seller/SellerStaffList').then(m => ({ default: m.SellerStaffList })));
const SellerApprovalListPage = lazy(() => import('./components/seller/SellerApprovalListPage').then(m => ({ default: m.SellerApprovalListPage })));
const SellerApprovalRulesPage = lazy(() => import('./components/seller/SellerApprovalRulesPage').then(m => ({ default: m.SellerApprovalRulesPage })));
const SellerAuctionPage = lazy(() => import('./components/seller/SellerAuctionPage').then(m => ({ default: m.SellerAuctionPage })));
const SellerAuctionDetail = lazy(() => import('./components/seller/SellerAuctionDetail').then(m => ({ default: m.SellerAuctionDetail })));
const SellerPriceAgreementPage = lazy(() => import('./components/seller/SellerPriceAgreementPage').then(m => ({ default: m.SellerPriceAgreementPage })));
const SellerPriceAgreementDetail = lazy(() => import('./components/seller/SellerPriceAgreementDetail').then(m => ({ default: m.SellerPriceAgreementDetail })));
const SellerSLAPage = lazy(() => import('./components/seller/SellerSLAPage').then(m => ({ default: m.SellerSLAPage })));
const SellerSLADetail = lazy(() => import('./components/seller/SellerSLADetail').then(m => ({ default: m.SellerSLADetail })));
const SellerWarrantyPage = lazy(() => import('./components/seller/SellerWarrantyPage').then(m => ({ default: m.SellerWarrantyPage })));
const SellerReports = lazy(() => import('./components/seller/SellerReports').then(m => ({ default: m.SellerReports })));
const SellerActivityPage = lazy(() => import('./components/seller/SellerActivityPage').then(m => ({ default: m.SellerActivityPage })));
const SellerProfile = lazy(() => import('./components/seller/SellerProfile').then(m => ({ default: m.SellerProfile })));
const IntegrationHubPage = lazy(() => import('./components/seller/IntegrationHubPage').then(m => ({ default: m.IntegrationHubPage })));
const WarehouseTransferPage = lazy(() => import('./components/seller/WarehouseTransferPage').then(m => ({ default: m.WarehouseTransferPage })));
const DocumentCenterPage = lazy(() => import('./components/buyer/DocumentCenterPage').then(m => ({ default: m.DocumentCenterPage })));

// ---- Admin pages ----
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('./components/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const CategoryManagement = lazy(() => import('./components/admin/CategoryManagement').then(m => ({ default: m.CategoryManagement })));
const ProductApproval = lazy(() => import('./components/admin/ProductApproval').then(m => ({ default: m.ProductApproval })));
const OrderOverview = lazy(() => import('./components/admin/OrderOverview').then(m => ({ default: m.OrderOverview })));
const AdminPromotionPage = lazy(() => import('./components/admin/AdminPromotionPage').then(m => ({ default: m.AdminPromotionPage })));
const ReviewManagement = lazy(() => import('./components/admin/ReviewManagement').then(m => ({ default: m.ReviewManagement })));
const SystemSettings = lazy(() => import('./components/admin/SystemSettings').then(m => ({ default: m.SystemSettings })));
const AdminReportPage = lazy(() => import('./components/admin/AdminReportPage').then(m => ({ default: m.AdminReportPage })));
const AdminInventoryPage = lazy(() => import('./components/admin/AdminInventoryPage').then(m => ({ default: m.AdminInventoryPage })));
const AdminTradeInPage = lazy(() => import('./components/admin/AdminTradeInPage').then(m => ({ default: m.AdminTradeInPage })));
const AdminSupplierPage = lazy(() => import('./components/admin/AdminSupplierPage').then(m => ({ default: m.AdminSupplierPage })));
const AdminCertificateReview = lazy(() => import('./components/admin/AdminCertificateReview').then(m => ({ default: m.AdminCertificateReview })));
const AdminInvoicePage = lazy(() => import('./components/admin/AdminInvoicePage').then(m => ({ default: m.AdminInvoicePage })));
const AdminPaymentPage = lazy(() => import('./components/admin/AdminPaymentPage').then(m => ({ default: m.AdminPaymentPage })));
const AdminShipmentPage = lazy(() => import('./components/admin/AdminShipmentPage').then(m => ({ default: m.AdminShipmentPage })));
const RFQManagement = lazy(() => import('./components/admin/RFQManagement').then(m => ({ default: m.RFQManagement })));
const ContractManagement = lazy(() => import('./components/admin/ContractManagement').then(m => ({ default: m.ContractManagement })));
const AdminActivityLog = lazy(() => import('./components/admin/AdminActivityLog').then(m => ({ default: m.AdminActivityLog })));
const AdminAuctionPage = lazy(() => import('./components/admin/AdminAuctionPage').then(m => ({ default: m.AdminAuctionPage })));
const AdminPriceAgreementPage = lazy(() => import('./components/admin/AdminPriceAgreementPage').then(m => ({ default: m.AdminPriceAgreementPage })));
const AdminSLAPage = lazy(() => import('./components/admin/AdminSLAPage').then(m => ({ default: m.AdminSLAPage })));
const AdminWarrantyPage = lazy(() => import('./components/admin/AdminWarrantyPage').then(m => ({ default: m.AdminWarrantyPage })));
const AdminLoyaltyPage = lazy(() => import('./components/admin/AdminLoyaltyPage').then(m => ({ default: m.AdminLoyaltyPage })));
const AdminAnalyticsPage = lazy(() => import('./components/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminWarehousePage = lazy(() => import('./components/admin/AdminWarehousePage').then(m => ({ default: m.AdminWarehousePage })));
const AdminReturnPage = lazy(() => import('./components/admin/AdminReturnPage').then(m => ({ default: m.AdminReturnPage })));
const AdminDocumentPage = lazy(() => import('./components/shared/DocumentCenterPage').then(m => ({ default: m.DocumentCenterPage })));
const ReportBuilderPage = lazy(() => import('./components/shared/ReportBuilderPage').then(m => ({ default: m.ReportBuilderPage })));
const AdminDebitCreditPage = lazy(() => import('./components/admin/AdminDebitCreditPage').then(m => ({ default: m.AdminDebitCreditPage })));
const AdminPlatformFeePage = lazy(() => import('./components/admin/AdminPlatformFeePage').then(m => ({ default: m.AdminPlatformFeePage })));
const AdminEmailTemplatePage = lazy(() => import('./components/admin/AdminEmailTemplatePage').then(m => ({ default: m.AdminEmailTemplatePage })));
const AdminBannerPage = lazy(() => import('./components/admin/AdminBannerPage').then(m => ({ default: m.AdminBannerPage })));
const AdminBudgetPage = lazy(() => import('./components/admin/AdminBudgetPage').then(m => ({ default: m.AdminBudgetPage })));
const AdminPRPage = lazy(() => import('./components/admin/AdminPRPage').then(m => ({ default: m.AdminPRPage })));
const AdminGRNPage = lazy(() => import('./components/admin/AdminGRNPage').then(m => ({ default: m.AdminGRNPage })));
const AdminBlogPage = lazy(() => import('./components/admin/AdminBlogPage').then(m => ({ default: m.AdminBlogPage })));
const AdminStorePage = lazy(() => import('./components/admin/AdminStorePage').then(m => ({ default: m.AdminStorePage })));
const AdminComboPage = lazy(() => import('./components/admin/AdminComboPage').then(m => ({ default: m.AdminComboPage })));

const wrap = (Component: ComponentType) => (
  <Suspense fallback={<div className="flex h-screen items-center justify-center"><span className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"/></div>}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // ── Auth ──────────────────────────────────────────────
  {
    Component: AuthLayout,
    children: [
      { path: '/login', element: wrap(LoginPage) },
      { path: '/register', element: wrap(RegisterPage) },
    ],
  },

  // ── Storefront (Public) ────────────────────────────────
  {
    path: '/',
    Component: BuyerLayout,
    children: [
      { index: true, element: wrap(HomePage) },
      { path: 'products', element: wrap(ProductListPage) },
      { path: 'products/compare', element: wrap(ProductComparePage) },
      { path: 'products/:id', element: wrap(ProductDetailPage) },
      { path: 'suppliers', element: wrap(SupplierListPage) },
      { path: 'suppliers/compare', element: wrap(BuyerSupplierComparePage) },
      { path: 'suppliers/:id', element: wrap(SupplierDetailPage) },
      { path: 'promotions', element: wrap(BuyerPromotionPage) },
      { path: 'trade-in', element: wrap(TradeInPage) },
      { path: 'imei-check', element: wrap(IMEICheckPage) },
      { path: 'blog', element: wrap(BlogPage) },
      { path: 'blog/:slug', element: wrap(BlogDetailPage) },
      { path: 'stores', element: wrap(StoreLocatorPage) },
      { path: 'phone-finder', element: wrap(PhoneFinderPage) },

      // Buyer B2B — cần đăng nhập
      {
        Component: BuyerGuard,
        children: [
          { path: 'dashboard', element: wrap(BuyerDashboardPage) },
          { path: 'cart', element: wrap(CartPage) },
          { path: 'orders', element: wrap(OrderListPage) },
          { path: 'orders/:id', element: wrap(OrderDetailPage) },
          { path: 'order-confirmation', element: wrap(OrderConfirmationPage) },
          { path: 'wishlist', element: wrap(BuyerWishlistPage) },
          { path: 'reviews', element: wrap(BuyerReviewsPage) },
          { path: 'warranty', element: wrap(BuyerWarrantyPage) },
          { path: 'profile', element: wrap(BuyerProfilePage) },
          { path: 'notifications', element: wrap(NotificationCenterPage) },
          { path: 'loyalty', element: wrap(BuyerLoyaltyPage) },
          { path: 'quick-order', element: wrap(BuyerQuickOrderPage) },
          { path: 'bulk-order', element: wrap(BuyerBulkOrderPage) },
          { path: 'order-templates', element: wrap(BuyerOrderTemplatePage) },
          { path: 'rfqs', element: wrap(BuyerRFQListPage) },
          { path: 'rfqs/create', element: wrap(BuyerRFQCreatePage) },
          { path: 'rfqs/:id', element: wrap(BuyerRFQDetailPage) },
          { path: 'buyer/contracts', element: wrap(BuyerContractList) },
          { path: 'buyer/contracts/:id', element: wrap(BuyerContractDetail) },
          { path: 'payments', element: wrap(BuyerPaymentList) },
          { path: 'payments/:id', element: wrap(BuyerPaymentDetail) },
          { path: 'invoices', element: wrap(BuyerInvoiceListPage) },
          { path: 'invoices/:id', element: wrap(BuyerInvoiceDetail) },
          { path: 'returns', element: wrap(BuyerReturnListPage) },
          { path: 'returns/:id', element: wrap(BuyerReturnDetail) },
          { path: 'shipments', element: wrap(BuyerShipmentList) },
          { path: 'shipments/:id', element: wrap(BuyerShipmentDetail) },
          { path: 'grns', element: wrap(BuyerGRNListPage) },
          { path: 'grns/:id', element: wrap(BuyerGRNDetail) },
          { path: 'purchase-requisitions', element: wrap(BuyerPRListPage) },
          { path: 'purchase-requisitions/:id', element: wrap(BuyerPRDetail) },
          { path: 'budgets', element: wrap(BuyerBudgetPage) },
          { path: 'analytics', element: wrap(BuyerAnalyticsPage) },
          { path: 'auctions', element: wrap(BuyerAuctionListPage) },
          { path: 'auctions/:id', element: wrap(BuyerAuctionDetail) },
          { path: 'price-agreements', element: wrap(BuyerPriceAgreementPage) },
          { path: 'price-agreements/:id', element: wrap(BuyerPriceAgreementDetail) },
          { path: 'team', element: wrap(BuyerTeamPage) },
          // Enterprise B2B — Document Center (Nhóm 37)
          { path: 'documents', element: wrap(DocumentCenterPage) },
        ],
      },

      { path: '*', element: wrap(NotFoundPage) },
    ],
  },

  // ── Seller ────────────────────────────────────────────
  {
    path: '/seller',
    Component: SellerGuard,
    children: [
      {
        Component: SellerLayout,
        children: [
          { index: true, element: wrap(SellerDashboard) },
          { path: 'products', element: wrap(SellerProductList) },
          { path: 'products/new', element: wrap(SellerProductForm) },
          { path: 'products/:id/edit', element: wrap(SellerProductForm) },
          { path: 'orders', element: wrap(SellerOrderList) },
          { path: 'orders/:id', element: wrap(SellerOrderDetail) },
          { path: 'rfq', element: wrap(SellerRFQList) },
          { path: 'rfq/:id', element: wrap(SellerRFQDetail) },
          { path: 'contracts', element: wrap(SellerContractList) },
          { path: 'contracts/:id', element: wrap(SellerContractDetail) },
          { path: 'warehouse', element: wrap(SellerWarehouse) },
          { path: 'shipments', element: wrap(SellerShipmentList) },
          { path: 'returns', element: wrap(SellerReturnListPage) },
          { path: 'returns/:id', element: wrap(SellerReturnDetail) },
          { path: 'warranty', element: wrap(SellerWarrantyPage) },
          { path: 'sla', element: wrap(SellerSLAPage) },
          { path: 'sla/:id', element: wrap(SellerSLADetail) },
          { path: 'payments', element: wrap(SellerPaymentList) },
          { path: 'invoices', element: wrap(SellerInvoiceListPage) },
          { path: 'invoices/:id', element: wrap(SellerInvoiceDetail) },
          { path: 'credits', element: wrap(SellerCreditPage) },
          { path: 'debit-credit', element: wrap(SellerDebitCreditPage) },
          { path: 'debit-credit/:id', element: wrap(SellerDebitCreditDetail) },
          { path: 'reviews', element: wrap(SellerReviewsPage) },
          { path: 'promotions', element: wrap(SellerPromotionList) },
          { path: 'staff', element: wrap(SellerStaffList) },
          { path: 'approvals', element: wrap(SellerApprovalListPage) },
          { path: 'approval-rules', element: wrap(SellerApprovalRulesPage) },
          { path: 'auctions', element: wrap(SellerAuctionPage) },
          { path: 'auctions/:id', element: wrap(SellerAuctionDetail) },
          { path: 'price-agreements', element: wrap(SellerPriceAgreementPage) },
          { path: 'price-agreements/:id', element: wrap(SellerPriceAgreementDetail) },
          { path: 'reports', element: wrap(SellerReports) },
          { path: 'activity', element: wrap(SellerActivityPage) },
          { path: 'profile', element: wrap(SellerProfile) },
          // Enterprise Seller — Nhóm 37, 38, 40
          { path: 'documents', element: wrap(DocumentCenterPage) },
          { path: 'warehouse/transfers', element: wrap(WarehouseTransferPage) },
          { path: 'integrations', element: wrap(IntegrationHubPage) },
        ],
      },
    ],
  },

  // ── Admin ────────────────────────────────────────────
  {
    path: '/admin',
    Component: AdminGuard,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, element: wrap(AdminDashboard) },
          { path: 'products', element: wrap(ProductApproval) },
          { path: 'inventory', element: wrap(AdminInventoryPage) },
          { path: 'categories', element: wrap(CategoryManagement) },
          { path: 'orders', element: wrap(OrderOverview) },
          { path: 'customers', element: wrap(UserManagement) },
          { path: 'suppliers', element: wrap(AdminSupplierPage) },
          { path: 'certificates', element: wrap(AdminCertificateReview) },
          { path: 'reviews', element: wrap(ReviewManagement) },
          { path: 'promotions', element: wrap(AdminPromotionPage) },
          { path: 'trade-in', element: wrap(AdminTradeInPage) },
          { path: 'payments', element: wrap(AdminPaymentPage) },
          { path: 'invoices', element: wrap(AdminInvoicePage) },
          { path: 'shipments', element: wrap(AdminShipmentPage) },
          { path: 'rfqs', element: wrap(RFQManagement) },
          { path: 'contracts', element: wrap(ContractManagement) },
          { path: 'reports', element: wrap(AdminReportPage) },
          { path: 'activity-logs', element: wrap(AdminActivityLog) },
          { path: 'settings', element: wrap(SystemSettings) },
          // Giai đoạn D — Admin mở rộng
          { path: 'auctions', element: wrap(AdminAuctionPage) },
          { path: 'price-agreements', element: wrap(AdminPriceAgreementPage) },
          { path: 'sla', element: wrap(AdminSLAPage) },
          { path: 'warranty', element: wrap(AdminWarrantyPage) },
          { path: 'loyalty', element: wrap(AdminLoyaltyPage) },
          { path: 'analytics', element: wrap(AdminAnalyticsPage) },
          { path: 'warehouses', element: wrap(AdminWarehousePage) },
          { path: 'returns', element: wrap(AdminReturnPage) },
          { path: 'documents', element: wrap(AdminDocumentPage) },
          { path: 'report-builder', element: wrap(ReportBuilderPage) },
          { path: 'debit-credit', element: wrap(AdminDebitCreditPage) },
          // Sprint 1 — Admin pages còn thiếu
          { path: 'platform-fees', element: wrap(AdminPlatformFeePage) },
          { path: 'email-templates', element: wrap(AdminEmailTemplatePage) },
          { path: 'banners', element: wrap(AdminBannerPage) },
          // B2B Procurement
          { path: 'budgets', element: wrap(AdminBudgetPage) },
          { path: 'purchase-requisitions', element: wrap(AdminPRPage) },
          { path: 'grns', element: wrap(AdminGRNPage) },
          { path: 'blog', element: wrap(AdminBlogPage) },
          { path: 'stores', element: wrap(AdminStorePage) },
          { path: 'combos', element: wrap(AdminComboPage) },
        ],
      },
    ],
  },
]);