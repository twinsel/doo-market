import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  MapPin,
  LogOut, 
  ShieldCheck, 
  Phone, 
  ExternalLink,
  ChevronLeft,
  Search
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { QrCodeCard } from '../components/QrCodeCard';
import { Order } from '../types';

const getStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'تم استلام الطلب';
    case 'processing': return 'قيد التجهيز والتغليف';
    case 'shipped': return 'تم الشحن مع مندوب التوصيل';
    case 'delivering': return 'في مرحلة التسليم';
    case 'delivered': return 'تم التوصيل بنجاح';
    case 'cancelled': return 'ملغي';
    default: return 'تم استلام الطلب';
  }
};

export const ProfilePage: React.FC = () => {
  const { currentUser, isAuthenticated, logout, data } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'support'>('orders');
  const [searchCode, setSearchCode] = useState('');

  const orders = data.orders || [];

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    navigate(`/track-order?code=${encodeURIComponent(searchCode.trim())}`);
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center" dir="rtl">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
          <User size={36} />
        </div>
        <h1 className="text-xl font-black text-gray-900">تسجيل الدخول إلى حسابك</h1>
        <p className="mt-2 text-xs text-gray-500 font-bold leading-relaxed">
          قم بتسجيل الدخول لتتبع طلباتك وإدارة مفضلتك وعناوينك
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors"
        >
          تسجيل الدخول / إنشاء حساب
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 space-y-6" dir="rtl">
      {/* Profile Header Box */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-2xl font-black text-white shadow-md shadow-orange-500/20">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900">{currentUser.name}</h1>
            <p className="text-xs text-gray-400 font-bold">{currentUser.email || currentUser.phone}</p>
            <span className="mt-1 inline-block rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-600">
              عميل موثوق ⭐
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-2xl bg-gray-900 px-4 py-2.5 text-xs font-black text-white shadow hover:bg-gray-800 transition-all"
            >
              <ShieldCheck size={16} />
              <span>لوحة الإدارة</span>
            </Link>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-2xl border border-red-100 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-all"
          >
            <LogOut size={16} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Standalone Tracking Search Input Bar */}
      <form onSubmit={handleSearchOrder} className="rounded-3xl bg-white p-3 sm:p-4 shadow-sm ring-1 ring-black/5">
        <div className="relative flex items-center">
          <input
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            placeholder="رقم الطلب (مثال: DM8421) أو رقم الهاتف"
            className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pe-28 ps-11 text-sm font-bold shadow-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
          <Search size={18} className="absolute start-4 text-gray-400" />
          <button
            type="submit"
            className="absolute end-2 rounded-xl bg-orange-500 px-5 py-2 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
          >
            تتبع
          </button>
        </div>
      </form>

      {/* Tabs Row */}
      <div className="flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-black/5">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all ${
            activeTab === 'orders'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Package size={16} />
          <span>طلباتي ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all ${
            activeTab === 'addresses'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <MapPin size={16} />
          <span>عناوين التوصيل</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all ${
            activeTab === 'support'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Phone size={16} />
          <span>الدعم والمساعدة</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map(order => (
              <div
                key={order.id}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-xs font-black text-gray-900">طلب #{order.id}</span>
                    <span className="text-[10px] text-gray-400 font-bold block">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black border ${
                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    order.status === 'delivering' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    order.status === 'processing' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <div className="flex items-center gap-2">
                        <img src={it.image} className="h-10 w-10 rounded-xl object-cover" alt="" />
                        <span>{it.quantity}x {it.name}</span>
                      </div>
                      <span>{it.price * it.quantity} {data.settings.currencySymbol}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-black text-gray-900">
                    الإجمالي: {order.total} {data.settings.currencySymbol}
                  </span>
                  <Link
                    to={`/track-order?code=${order.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
                  >
                    <span>تتبع الشحنة</span>
                    <ChevronLeft size={14} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <p className="text-xs font-bold text-gray-400">لا توجد طلبات سابقة حتى الآن</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
          <h2 className="text-sm font-black text-gray-900">العناوين المحفوظة</h2>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-gray-900">المنزل (افتراضي)</span>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold text-orange-600">افتراضي</span>
            </div>
            <p className="text-xs text-gray-600 font-bold">الرياض · حي الياسمين، شارع أنس بن مالك</p>
            <p className="text-xs text-gray-400 font-bold" dir="ltr">+966 50 123 4567</p>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
            <h2 className="text-sm font-black text-gray-900">قنوات التواصل المباشر</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${data.settings.whatsapp || '963954475933'}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors"
              >
                <Phone size={20} className="text-emerald-600" />
                <div>
                  <div className="font-black">محادثة واتساب مباشرة</div>
                  <div className="text-[10px] text-emerald-600">رد فوري على مدار الساعة</div>
                </div>
              </a>

              <a
                href={`mailto:${data.settings.email || 'support@doomarket.com'}`}
                className="flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-4 text-blue-800 font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                <ExternalLink size={20} className="text-blue-600" />
                <div>
                  <div className="font-black">البريد الإلكتروني</div>
                  <div className="text-[10px] text-blue-600">{data.settings.email}</div>
                </div>
              </a>
            </div>
          </div>

          <QrCodeCard />
        </div>
      )}
    </div>
  );
};
