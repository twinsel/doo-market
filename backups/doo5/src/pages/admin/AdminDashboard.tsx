import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  FolderTree, 
  Users, 
  Activity, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  Lightbulb,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminDashboardOverview: React.FC = () => {
  const { data } = useShop();
  const [pulseExpanded, setPulseExpanded] = useState(false);

  const orders = data.orders || [];
  const products = data.products || [];
  const categories = data.categories || [];
  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  const quickStats = [
    {
      to: '/admin/orders',
      value: orders.length,
      label: 'إجمالي الطلبات',
      color: 'from-orange-500 to-amber-500',
      icon: Package
    },
    {
      to: '/admin/products',
      value: products.length,
      label: 'إجمالي المنتجات',
      color: 'from-blue-500 to-cyan-500',
      icon: ShoppingBag
    },
    {
      to: '/admin/categories',
      value: categories.length,
      label: 'الأقسام النشطة',
      color: 'from-purple-500 to-pink-500',
      icon: FolderTree
    },
    {
      to: '/admin/users',
      value: 3,
      label: 'المستخدمون',
      color: 'from-emerald-500 to-teal-500',
      icon: Users
    }
  ];

  return (
    <div className="pb-24 text-right space-y-6" dir="rtl">
      {/* Header */}
      <div className="relative h-20 overflow-hidden rounded-3xl bg-slate-900 px-6 shadow-xl flex items-center justify-between" dir="rtl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Left Side: Activity Icon */}
        <div className="relative z-10">
          <div className="h-10 w-10 rounded-full bg-white/5 shadow-xs flex items-center justify-center text-slate-400 border border-white/10">
            <Activity size={20} />
          </div>
        </div>

        {/* Right Side: Title & Icon */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="text-right">
            <h1 className="text-lg font-black text-white flex items-center justify-end gap-3">
              لوحة القيادة
              <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <TrendingUp className="text-orange-500" size={20} />
              </div>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">مرحباً بك في إدارة {data.settings.siteName}</p>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              to={stat.to}
              className="h-20 group relative overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-xs border border-slate-100 transition-all active:scale-95 hover:shadow-md flex items-center justify-between"
            >
              <div className="relative z-10">
                  <div className="text-lg font-black text-slate-900 leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${stat.color} shrink-0`}
              >
                <Icon size={18} strokeWidth={2.5} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Enterprise Real-time Pulse Card */}
      <div className="space-y-4">
        <div className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl ring-1 ring-white/10">
          <button
            type="button"
            onClick={() => setPulseExpanded(p => !p)}
            className={`flex h-20 w-full items-center justify-between px-6 transition-all ${
              pulseExpanded ? 'bg-white/5 border-b border-white/10' : 'hover:bg-white/5'
            }`}
          >
            <div
              className={`rounded-full p-2 transition-transform duration-300 ${
                pulseExpanded ? 'rotate-180 bg-white text-slate-900 shadow-lg' : 'bg-white/10 text-white/40'
              }`}
            >
              <ChevronDown size={18} />
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-sm font-black">النبض اللحظي (Enterprise)</div>
                <div className="text-[10px] font-bold text-orange-400">
                  ✅ النظام مستقر ومراقب على مدار الساعة
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] overflow-hidden shrink-0">
                <Activity size={24} className="text-white animate-pulse" />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {pulseExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="p-4 space-y-4 text-right">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-bold text-slate-400 mb-1">تغييرات معلقة</div>
                      <div className="text-lg font-black text-orange-500">0</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-bold text-slate-400 mb-1">حالة المزامنة</div>
                      <div className="text-lg font-black text-emerald-400">سحابية</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-bold text-slate-400 mb-1">زمن الاستجابة</div>
                      <div className="text-lg font-black text-cyan-400">18ms</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-3xl bg-white p-5 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Package size={18} className="text-orange-500" />
              <span>أحدث الطلبات</span>
            </h2>
            <Link to="/admin/orders" className="text-xs font-bold text-orange-600 hover:underline">
              عرض الكل
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="font-black text-xs text-slate-900">#{order.id}</div>
                  <div className="text-[11px] font-bold text-slate-400">
                    {order.customer.name} · {order.total} {currencySymbol}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                    order.status === 'delivered'
                      ? 'bg-emerald-50 text-emerald-600'
                      : order.status === 'shipped'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {order.status === 'delivered'
                    ? 'تم التوصيل'
                    : order.status === 'shipped'
                    ? 'تم الشحن'
                    : 'قيد الانتظار'}
                </span>
              </div>
            ))}

            {orders.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-400 font-bold">لا توجد طلبات بعد</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-3xl bg-white p-5 shadow-xs border border-slate-100 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              <span>الأكثر مبيعاً</span>
            </h2>
            <Link to="/admin/products" className="text-xs font-bold text-orange-600 hover:underline">
              إدارة المنتجات
            </Link>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map(prod => (
              <div
                key={prod.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={prod.images[0]} className="h-10 w-10 rounded-xl object-cover" alt="" />
                  <div>
                    <div className="font-black text-xs text-slate-900 line-clamp-1">{prod.name}</div>
                    <div className="text-[10px] text-slate-400 font-bold">
                      {prod.price} {currencySymbol} · المخزون: {prod.stock}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  {prod.sold || 0} مبيعة
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Tips Box */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl relative overflow-hidden group text-right">
        <div className="relative z-10 space-y-4">
          <h2 className="text-lg font-black flex items-center gap-3 justify-end">
            <span>نصائح سريعة</span>
            <Lightbulb className="text-orange-400" size={20} />
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 text-[11px] text-slate-400 font-bold">
            <div className="flex items-start gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 justify-end">
              <p className="text-right leading-relaxed">تأكد من مراجعة الطلبات المعلقة يومياً لضمان ولاء العملاء.</p>
              <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white shrink-0 mt-0.5">
                1
              </div>
            </div>
            <div className="flex items-start gap-2 bg-white/5 p-3 rounded-2xl border border-white/5 justify-end">
              <p className="text-right leading-relaxed">الصور الدائرية تعطي طابعاً عصرياً، استخدم صوراً واضحة للمنتجات.</p>
              <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white shrink-0 mt-0.5">
                2
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-colors" />
      </div>
    </div>
  );
};
