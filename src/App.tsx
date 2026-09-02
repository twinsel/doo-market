import React, { Suspense } from 'react';
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
import { TrackOrderPage } from './pages/TrackOrderPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuthPage } from './pages/AuthPage';
import { AddReviewPage } from './pages/AddReviewPage';

// Admin Sub-pages (Stage 2)
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardOverview } from './pages/admin/AdminDashboard';
import { AdminOrdersPage } from './pages/admin/AdminOrders';
import { AdminProductsPage } from './pages/admin/AdminProducts';
import { AdminCategoriesPage } from './pages/admin/AdminCategories';
import { AdminBannersPage } from './pages/admin/AdminBanners';
import { AdminFlashDealsPage } from './pages/admin/AdminFlashDeals';
import { AdminCollectionsPage } from './pages/admin/AdminCollections';
import { AdminSectionsPage } from './pages/admin/AdminSections';
import { AdminUsersPage } from './pages/admin/AdminUsers';
import { AdminSettingsPage } from './pages/admin/AdminSettings';

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
  const { isAuthenticated } = useShop();

  return (
    <HashRouter>
      {!isAuthenticated && <AppAuthGate />}
      <ScrollToTop />
      <WelcomeModal />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Storefront Routes */}
          <Route element={<StoreLayout />}>
            <Route index element={<HomePage />} />
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
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}

export default App;
