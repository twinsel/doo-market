// ============================================================
// Doo Market
// src/pages/TrackOrderPage.tsx
// ============================================================
// صفحة تتبع الطلبات - تتبع فوري ومباشر مع دعم البارامترات

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, CheckCircle2, MapPin, Clock, AlertCircle } from 'lucide-react';
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

const getOrderTrackingSteps = (order: Order) => {
  const defaultSteps = [
    { title: 'تم استلام الطلب', description: 'تم تأكيد طلبك بنجاح وجارٍ التجهيز بمستودعاتنا' },
    { title: 'قيد التجهيز والتغليف', description: 'فحص الجودة وتغليف المنتجات بعناية' },
    { title: 'تم الشحن مع مندوب التوصيل', description: 'تسليم الشحنة لشركة الشحن المعتمدة' },
    { title: 'في مرحلة التسليم', description: 'المندوب في طريقه إلى عنوانك' },
    { title: 'تم التوصيل بنجاح', description: 'تم تسليم الشحنة للعميل بنجاح' }
  ];

  const statusOrder = ['pending', 'processing', 'shipped', 'delivering', 'delivered'];
  const maxCompletedIndex = statusOrder.indexOf(order.status);

  return defaultSteps.map((step, idx) => ({
    ...step,
    completed: idx <= maxCompletedIndex,
    timestamp: idx <= maxCompletedIndex ? 'مكتمل ✅' : 'قريباً'
  }));
};

const normalizeOrderId = (id: string): string => {
  return id.trim().toUpperCase().replace(/\s/g, '');
};

const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

export const TrackOrderPage: React.FC = () => {
  const { data } = useShop();
  const [searchParams] = useSearchParams();
  const [searchCode, setSearchCode] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const allOrders = data.orders || [];

  // القراءة التلقائية لرقم الطلب من رابط URL للفتح المباشر والفوري
  useEffect(() => {
    const codeParam = searchParams.get('code') || searchParams.get('id');
    if (codeParam && codeParam.trim()) {
      const trimmed = codeParam.trim();
      setSearchCode(trimmed);
      setSearched(true);
      setSelectedOrderId(trimmed);
    }
  }, [searchParams]);

  const query = searchCode.trim();

  // وظيفة البحث المحسّنة
  const matchedOrders = useMemo(() => {
    if (!query) return [];

    try {
      const normalizedQuery = query.trim();
      const lowerQuery = normalizedQuery.toLowerCase();
      const digitsQuery = normalizedQuery.replace(/\D/g, '');

      return allOrders.filter(o => {
        const orderId = normalizeOrderId(o.id);
        const searchId = normalizeOrderId(normalizedQuery);
        const orderIdWithoutDM = orderId.replace(/^DM/, '');
        const searchIdWithoutDM = searchId.replace(/^DM/, '');
        const orderPhone = normalizePhone(o.customer.phone);
        const customerName = o.customer.name.toLowerCase();

        const matchId = orderId.includes(searchId) || searchId.includes(orderId);
        const matchIdWithoutDM = orderIdWithoutDM === searchIdWithoutDM;
        const matchPhone = digitsQuery && (orderPhone.includes(digitsQuery) || digitsQuery.includes(orderPhone));
        const matchName = customerName.includes(lowerQuery);

        return matchId || matchIdWithoutDM || matchPhone || matchName;
      });
    } catch (error) {
      console.error('Error searching orders:', error);
      return [];
    }
  }, [allOrders, query]);

  // تحديد الطلب النشط المعروض فوراً
  const activeOrder = useMemo(() => {
    if (matchedOrders.length > 0) {
      if (selectedOrderId) {
        const found = matchedOrders.find(o =>
          normalizeOrderId(o.id) === normalizeOrderId(selectedOrderId) ||
          normalizeOrderId(o.id).replace(/^DM/, '') === normalizeOrderId(selectedOrderId).replace(/^DM/, '')
        );
        if (found) return found;
      }
      return matchedOrders[0];
    }

    // إذا لم يقم العميل بالبحث وفتح الصفحة مباشرة، نعرض أحدث طلب
    if (!query && !searched && allOrders.length > 0) {
      return allOrders[0];
    }

    return null;
  }, [matchedOrders, selectedOrderId, query, searched, allOrders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchError('يرجى إدخال رقم الطلب أو رقم الهاتف');
      return;
    }
    setSearched(true);
    setSelectedOrderId(null);
    setSearchError(null);
  };

  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4 space-y-6" dir="rtl">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-2xl font-black text-gray-900">تتبع حالة شحنتك المباشرة</h1>
        <p className="mt-1 text-xs text-gray-500 font-bold">
          أدخل رقم الطلب (مثال: DM8421) أو رقم هاتفك لمتابعة حالة الشحنة
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto">
        <div className="relative flex items-center">
          <input
            value={searchCode}
            onChange={e => {
              setSearchCode(e.target.value);
              setSearchError(null);
            }}
            placeholder="رقم الطلب (مثال: DM8421) أو رقم الهاتف"
            className={`w-full rounded-2xl border ${
              searchError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
            } bg-white py-3.5 pe-24 ps-11 text-sm font-bold shadow-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10`}
          />
          <Search size={18} className="absolute start-4 text-gray-400" />
          <button
            type="submit"
            className="absolute end-2 rounded-xl bg-orange-500 px-5 py-2 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
          >
            تتبع
          </button>
        </div>
        {searchError && (
          <p className="text-[11px] font-bold text-red-500 mt-1.5 flex items-center gap-1">
            <AlertCircle size={13} />
            <span>{searchError}</span>
          </p>
        )}
      </form>

      {/* Multiple Orders Selector Tabs if customer has > 1 order */}
      {matchedOrders.length > 1 && (
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800">
              عُثر على ({matchedOrders.length}) طلبات لهذا العميل:
            </span>
            <span className="text-[10px] font-bold text-slate-400">اختر الطلب للتبديل وتتبع حالته المستقلة</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchedOrders.map((ord) => {
              const isSelected = activeOrder?.id === ord.id;
              return (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20 scale-[1.02]'
                      : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  <span>الطلب #{ord.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {getStatusLabel(ord.status)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Order Tracking Timeline */}
      {activeOrder ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-6">
          {/* Order Header Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400">رقم الطلب النشط</span>
              <div className="text-xl font-black text-orange-600">#{activeOrder.id}</div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  activeOrder.status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : activeOrder.status === 'delivering'
                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                    : activeOrder.status === 'shipped'
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : activeOrder.status === 'processing'
                    ? 'bg-amber-50 text-amber-600 border border-amber-100'
                    : activeOrder.status === 'cancelled'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}
              >
                {getStatusLabel(activeOrder.status)}
              </span>
            </div>
          </div>

          {/* Timeline Visual Steps for activeOrder */}
          <div className="space-y-6 py-2">
            {(() => {
              const stepsToRender = getOrderTrackingSteps(activeOrder);
              const statusOrder = ['pending', 'processing', 'shipped', 'delivering', 'delivered'];
              const maxCompletedIndex = statusOrder.indexOf(activeOrder.status);

              return stepsToRender.map((step, idx, arr) => {
                const isLast = idx === arr.length - 1;
                const isLineActive = idx < maxCompletedIndex;

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Step Connector Line */}
                    {!isLast && (
                      <div
                        className={`absolute start-4 top-7 bottom-[-20px] w-0.5 transition-colors duration-500 ${
                          isLineActive ? 'bg-orange-500' : 'bg-gray-200'
                        }`}
                      />
                    )}

                    {/* Icon Circle */}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                        step.completed
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {step.completed ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-black transition-colors duration-300 ${
                            step.completed ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {step.title}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400">{step.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 font-bold">{step.description}</p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-xs">
            <div className="rounded-2xl bg-gray-50 p-4 space-y-2">
              <div className="flex items-center gap-2 font-black text-gray-900">
                <MapPin size={16} className="text-orange-500" />
                <span>عنوان التوصيل</span>
              </div>
              <p className="text-gray-600 font-bold">{activeOrder.customer.name}</p>
              <p className="text-gray-500">{activeOrder.customer.city} · {activeOrder.customer.address}</p>
              <p className="text-gray-500" dir="ltr">{activeOrder.customer.phone}</p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 space-y-2">
              <div className="flex items-center gap-2 font-black text-gray-900">
                <Package size={16} className="text-orange-500" />
                <span>المنتجات في الشحنة</span>
              </div>
              <div className="space-y-1">
                {activeOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-gray-700 font-bold">
                    <span>{it.quantity}x {it.name}</span>
                    <span>{it.price * it.quantity} {currencySymbol}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-gray-900">
                <span>الإجمالي:</span>
                <span className="text-orange-600">{activeOrder.total} {currencySymbol}</span>
              </div>
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-500">
            لم نتمكن من العثور على أي شحنة مطابقة للبحث «{searchCode}». الرجاء التأكد من صحة رقم الطلب أو رقم الهاتف.
          </p>
        </div>
      ) : null}

      <div className="max-w-md mx-auto">
        <QrCodeCard />
      </div>
    </div>
  );
};
