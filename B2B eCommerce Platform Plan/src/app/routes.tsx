// ============================================================
// Routes — CELLPHONES Store (B2C cửa hàng điện thoại)
// ============================================================
import { lazy, Suspense, type ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
import { AuthLayout } from './components/auth/AuthLayout';
import { BuyerLayout } from './components/buyer/BuyerLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminGuard } from './components/admin/AdminGuard';
import { BuyerGuard } from './components/buyer/BuyerGuard';

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
const PaymentResultPage = lazy(() => import('./components/buyer/PaymentResultPage').then(m => ({ default: m.PaymentResultPage })));
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

// ---- Customer (đăng nhập) pages ----
const BuyerDashboardPage = lazy(() => import('./components/buyer/BuyerDashboardPage').then(m => ({ default: m.BuyerDashboardPage })));
const BuyerPaymentList = lazy(() => import('./components/buyer/BuyerPaymentList').then(m => ({ default: m.BuyerPaymentList })));
const BuyerPaymentDetail = lazy(() => import('./components/buyer/BuyerPaymentDetail').then(m => ({ default: m.BuyerPaymentDetail })));
const BuyerInvoiceListPage = lazy(() => import('./components/buyer/BuyerInvoiceListPage').then(m => ({ default: m.BuyerInvoiceListPage })));
const BuyerInvoiceDetail = lazy(() => import('./components/buyer/BuyerInvoiceDetail').then(m => ({ default: m.BuyerInvoiceDetail })));
const BuyerReturnListPage = lazy(() => import('./components/buyer/BuyerReturnListPage').then(m => ({ default: m.BuyerReturnListPage })));
const BuyerReturnDetail = lazy(() => import('./components/buyer/BuyerReturnDetail').then(m => ({ default: m.BuyerReturnDetail })));
const BuyerShipmentList = lazy(() => import('./components/buyer/BuyerShipmentList').then(m => ({ default: m.BuyerShipmentList })));
const BuyerShipmentDetail = lazy(() => import('./components/buyer/BuyerShipmentDetail').then(m => ({ default: m.BuyerShipmentDetail })));
const BuyerLoyaltyPage = lazy(() => import('./components/buyer/BuyerLoyaltyPage').then(m => ({ default: m.BuyerLoyaltyPage })));

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
const AdminRevenuePage = lazy(() => import('./components/admin/AdminRevenuePage').then(m => ({ default: m.AdminRevenuePage })));
const AdminInventoryPage = lazy(() => import('./components/admin/AdminInventoryPage').then(m => ({ default: m.AdminInventoryPage })));
const AdminTradeInPage = lazy(() => import('./components/admin/AdminTradeInPage').then(m => ({ default: m.AdminTradeInPage })));
const AdminInvoicePage = lazy(() => import('./components/admin/AdminInvoicePage').then(m => ({ default: m.AdminInvoicePage })));
const AdminPaymentPage = lazy(() => import('./components/admin/AdminPaymentPage').then(m => ({ default: m.AdminPaymentPage })));
const AdminShipmentPage = lazy(() => import('./components/admin/AdminShipmentPage').then(m => ({ default: m.AdminShipmentPage })));
const AdminActivityLog = lazy(() => import('./components/admin/AdminActivityLog').then(m => ({ default: m.AdminActivityLog })));
const AdminWarrantyPage = lazy(() => import('./components/admin/AdminWarrantyPage').then(m => ({ default: m.AdminWarrantyPage })));
const AdminLoyaltyPage = lazy(() => import('./components/admin/AdminLoyaltyPage').then(m => ({ default: m.AdminLoyaltyPage })));
const AdminAnalyticsPage = lazy(() => import('./components/admin/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })));
const AdminWarehousePage = lazy(() => import('./components/admin/AdminWarehousePage').then(m => ({ default: m.AdminWarehousePage })));
const AdminReturnPage = lazy(() => import('./components/admin/AdminReturnPage').then(m => ({ default: m.AdminReturnPage })));
const AdminEmailTemplatePage = lazy(() => import('./components/admin/AdminEmailTemplatePage').then(m => ({ default: m.AdminEmailTemplatePage })));
const AdminBannerPage = lazy(() => import('./components/admin/AdminBannerPage').then(m => ({ default: m.AdminBannerPage })));
const AdminBlogPage = lazy(() => import('./components/admin/AdminBlogPage').then(m => ({ default: m.AdminBlogPage })));
const AdminStorePage = lazy(() => import('./components/admin/AdminStorePage').then(m => ({ default: m.AdminStorePage })));
const AdminComboPage = lazy(() => import('./components/admin/AdminComboPage').then(m => ({ default: m.AdminComboPage })));
const AdminInstallmentPage = lazy(() => import('./components/admin/AdminInstallmentPage').then(m => ({ default: m.AdminInstallmentPage })));
const AdminStaffPage = lazy(() => import('./components/admin/AdminStaffPage').then(m => ({ default: m.AdminStaffPage })));
const AdminInternalSupplierPage = lazy(() => import('./components/admin/AdminInternalSupplierPage').then(m => ({ default: m.AdminInternalSupplierPage })));

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
      { path: 'search', element: wrap(ProductListPage) },
      { path: 'category/:slug', element: wrap(ProductListPage) },
      { path: 'products', element: wrap(ProductListPage) },
      { path: 'products/compare', element: wrap(ProductComparePage) },
      { path: 'products/:id', element: wrap(ProductDetailPage) },
      { path: 'promotions', element: wrap(BuyerPromotionPage) },
      { path: 'trade-in', element: wrap(TradeInPage) },
      { path: 'check-imei', element: wrap(IMEICheckPage) },
      { path: 'imei-check', element: wrap(IMEICheckPage) },
      { path: 'blog', element: wrap(BlogPage) },
      { path: 'blog/:slug', element: wrap(BlogDetailPage) },
      { path: 'stores', element: wrap(StoreLocatorPage) },
      { path: 'phone-finder', element: wrap(PhoneFinderPage) },
      { path: 'payment-result', element: wrap(PaymentResultPage) },

      // Customer — cần đăng nhập
      {
        Component: BuyerGuard,
        children: [
          { path: 'dashboard', element: wrap(BuyerDashboardPage) },
          { path: 'cart', element: wrap(CartPage) },
          { path: 'orders', element: wrap(OrderListPage) },
          { path: 'account/orders', element: wrap(OrderListPage) },
          { path: 'orders/:id', element: wrap(OrderDetailPage) },
          { path: 'order-confirmation', element: wrap(OrderConfirmationPage) },
          { path: 'wishlist', element: wrap(BuyerWishlistPage) },
          { path: 'reviews', element: wrap(BuyerReviewsPage) },
          { path: 'warranty', element: wrap(BuyerWarrantyPage) },
          { path: 'profile', element: wrap(BuyerProfilePage) },
          { path: 'notifications', element: wrap(NotificationCenterPage) },
          { path: 'loyalty', element: wrap(BuyerLoyaltyPage) },
          { path: 'payments', element: wrap(BuyerPaymentList) },
          { path: 'payments/:id', element: wrap(BuyerPaymentDetail) },
          { path: 'invoices', element: wrap(BuyerInvoiceListPage) },
          { path: 'invoices/:id', element: wrap(BuyerInvoiceDetail) },
          { path: 'returns', element: wrap(BuyerReturnListPage) },
          { path: 'returns/:id', element: wrap(BuyerReturnDetail) },
          { path: 'shipments', element: wrap(BuyerShipmentList) },
          { path: 'shipments/:id', element: wrap(BuyerShipmentDetail) },
        ],
      },

      { path: '*', element: wrap(NotFoundPage) },
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
          { path: 'dashboard', element: wrap(AdminDashboard) },
          { path: 'products', element: wrap(ProductApproval) },
          { path: 'inventory', element: wrap(AdminInventoryPage) },
          { path: 'categories', element: wrap(CategoryManagement) },
          { path: 'orders', element: wrap(OrderOverview) },
          { path: 'customers', element: wrap(UserManagement) },
          { path: 'reviews', element: wrap(ReviewManagement) },
          { path: 'promotions', element: wrap(AdminPromotionPage) },
          { path: 'trade-in', element: wrap(AdminTradeInPage) },
          { path: 'reconciliation', element: wrap(AdminPaymentPage) },
          { path: 'payments', element: wrap(AdminPaymentPage) },
          { path: 'invoices', element: wrap(AdminInvoicePage) },
          { path: 'shipments', element: wrap(AdminShipmentPage) },
          { path: 'revenue', element: wrap(AdminRevenuePage) },
          { path: 'reports', element: wrap(AdminReportPage) },
          { path: 'activity-logs', element: wrap(AdminActivityLog) },
          { path: 'settings', element: wrap(SystemSettings) },
          { path: 'warranty', element: wrap(AdminWarrantyPage) },
          { path: 'loyalty', element: wrap(AdminLoyaltyPage) },
          { path: 'analytics', element: wrap(AdminAnalyticsPage) },
          { path: 'warehouses', element: wrap(AdminWarehousePage) },
          { path: 'returns', element: wrap(AdminReturnPage) },
          { path: 'email-templates', element: wrap(AdminEmailTemplatePage) },
          { path: 'banners', element: wrap(AdminBannerPage) },
          { path: 'blog', element: wrap(AdminBlogPage) },
          { path: 'stores', element: wrap(AdminStorePage) },
          { path: 'combos', element: wrap(AdminComboPage) },
          { path: 'installments', element: wrap(AdminInstallmentPage) },
          { path: 'staff', element: wrap(AdminStaffPage) },
          { path: 'suppliers', element: wrap(AdminInternalSupplierPage) },
        ],
      },
    ],
  },
]);
