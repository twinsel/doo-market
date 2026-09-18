import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { WelcomeModal } from './components/WelcomeModal';
import { ScrollToTop } from './components/ScrollToTop';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';
import { DealsPage } from './pages/DealsPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { AuthPage } from './pages/AuthPage';
import { AuthProvider } from './context/AuthContext';

// Lazy Loaded Secondary Store Routes
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then(m => ({ default: m.TrackOrderPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const AddReviewPage = lazy(() => import('./pages/AddReviewPage').then(m => ({ default: m.AddReviewPage })));

// Lazy Loaded Admin Management Routes
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboardOverview = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboardOverview })));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrdersPage })));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProductsPage })));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategoriesPage })));
const AdminBannersPage = lazy(() => import('./pages/admin/AdminBanners').then(m => ({ default: m.AdminBannersPage })));
const AdminFlashDealsPage = lazy(() => import('./pages/admin/AdminFlashDeals').then(m => ({ default: m.AdminFlashDealsPage })));
const AdminCollectionsPage = lazy(() => import('./pages/admin/AdminCollections').then(m => ({ default: m.AdminCollectionsPage })));
const AdminSectionsPage = lazy(() => import('./pages/admin/AdminSections').then(m => ({ default: m.AdminSectionsPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsersPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettingsPage })));

import { AppAuthGate } from './components/AppAuthGate';
import { useShop } from './context/ShopContext';
import { Loader2 } from 'lucide-react';

const StoreLayout: React.FC = () => {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#F7F7F8] lg:pb-0"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
    >
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

const LoadingFallback: React.FC = () => (
  <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-3">
    <Loader2 className="animate-spin text-orange-500" size={32} />
    <p className="text-sm font-bold text-slate-400">جاري التحميل...</p>
  </div>
);

const AppContent: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <WelcomeModal />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Storefront Routes */}
          <Route element={<StoreLayout />}>
            <Route index element={<Navigate to="/profile" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="category/:id" element={<CategoryPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="deals" element={<DealsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="track-order" element={<TrackOrderPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="auth" element={<AuthPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="product/:id/review" element={<AddReviewPage />} />
          </Route>

          {/* Admin Management Routes (Stage 2) */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardOverview />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="banners" element={<AdminBannersPage />} />
            <Route path="flash" element={<AdminFlashDealsPage />} />
            <Route path="collections" element={<AdminCollectionsPage />} />
            <Route path="sections" element={<AdminSectionsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <AppContent />
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
