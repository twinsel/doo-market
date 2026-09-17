import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  FolderTree, 
  Image as ImageIcon, 
  Zap, 
  Layers, 
  LayoutList, 
  Users, 
  Settings, 
  Cloud, 
  RefreshCw, 
  ExternalLink, 
  LogOut, 
  Eye, 
  EyeOff,
  Phone
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { BrandLogoBadge } from '../../components/Header';

const ADMIN_STORAGE_KEY = 'doo_admin_auth';
const ADMIN_PASS_KEY = 'doo_admin_pass';

const adminNavItems = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'نظرة عامة' },
  { to: '/admin/orders', icon: ClipboardList, label: 'الطلبات' },
  { to: '/admin/products', icon: Package, label: 'المنتجات' },
  { to: '/admin/categories', icon: FolderTree, label: 'الأقسام' },
  { to: '/admin/banners', icon: ImageIcon, label: 'البانرات' },
  { to: '/admin/flash', icon: Zap, label: 'عروض البرق' },
  { to: '/admin/collections', icon: Layers, label: 'المجموعات' },
  { to: '/admin/sections', icon: LayoutList, label: 'أقسام الصفحة' },
  { to: '/admin/users', icon: Users, label: 'المستخدمون' },
  { to: '/admin/settings', icon: Settings, label: 'الإعدادات' }
];

// Admin Login Form
const AdminLoginForm: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    await new Promise(r => setTimeout(r, 400));
    const savedPass = localStorage.getItem(ADMIN_PASS_KEY) || 'admin';

    if (password === savedPass || password === 'admin') {
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      onLoginSuccess();
    } else {
      setErrorMessage('كلمة المرور غير صحيحة (الافتراضية: admin)');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4" dir="rtl">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="mb-6 flex items-center gap-3">
          <BrandLogoBadge />
          <div>
            <h1 className="text-xl font-black text-slate-900">دخول لوحة التحكم</h1>
            <p className="text-xs text-slate-400 font-bold">منطقة محمية</p>
          </div>
        </div>

        <p className="mb-4 text-sm text-slate-500 font-bold leading-relaxed">
          هذه المنطقة محمية بكلمة مرور — للمسؤول فقط
        </p>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-bold text-slate-700">كلمة المرور</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="أدخل كلمة مرور المسؤول (admin)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pe-10 text-sm font-bold outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPassword ? 'إخفاء' : 'إظهار'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {errorMessage && (
          <p className="mb-3 text-xs font-bold text-red-500">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-orange-500 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 disabled:opacity-50 hover:bg-orange-600 active:scale-95 transition-all"
        >
          {isSubmitting ? 'جاري التحقق...' : 'دخول آمن'}
        </button>

        <Link to="/" className="mt-4 block text-center text-sm font-bold text-slate-400 hover:text-orange-600">
          العودة للمتجر
        </Link>

        <p className="mt-5 text-[11px] leading-relaxed text-slate-400 font-bold border-t border-slate-100 pt-4">
          بعد الدخول تبقى الجلسة نشطة حتى تضغط «خروج» أو تغلق التبويب.
          <br />
          كلمة المرور الافتراضية هي: <span className="font-mono text-orange-600">admin</span>
        </p>
      </form>
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const { data } = useShop();
  const [isAdminAuthed, setIsAdminAuthed] = useState(() => {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdminAuthed(false);
    navigate('/', { replace: true });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setIsRefreshing(false);
  };

  if (!isAdminAuthed) {
    return <AdminLoginForm onLoginSuccess={() => setIsAdminAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 selection:bg-orange-500 selection:text-white" dir="rtl">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3">
            <BrandLogoBadge size="sm" />
            <div>
              <div className="text-sm font-black text-slate-900">لوحة التحكم</div>
              <div className="text-[11px] text-slate-400 font-bold">
                {data.settings.siteName} · إدارة المتجر
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <Cloud size={12} /> متزامن
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
            >
              <span className="hidden sm:inline">عرض المتجر</span>
              <ExternalLink size={14} />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Horizontal Pills */}
        <nav className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 sm:px-4">
          {adminNavItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </header>

      {/* Main Content View */}
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
        <Outlet />
      </div>
    </div>
  );
};
