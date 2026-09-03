import React, { useState } from 'react';
import { 
  Package, 
  ShoppingBag, 
  Layers, 
  Settings, 
  TrendingUp, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Zap,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    data, 
    updateProduct, 
    addProduct, 
    deleteProduct, 
    updateSettings, 
    updateOrderStatus,
    resetData 
  } = useShop();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'settings'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  // Settings form state
  const [siteName, setSiteName] = useState(data.settings.siteName);
  const [brandMark, setBrandMark] = useState(data.settings.brandMark);
  const [announcement, setAnnouncement] = useState(data.settings.announcement);
  const [freeShippingMin, setFreeShippingMin] = useState(data.settings.freeShippingMin);
  const [whatsapp, setWhatsapp] = useState(data.settings.whatsapp);
  const [cartHoldHours, setCartHoldHours] = useState(data.settings.cartHoldHours);

  // New Product form state
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(99);
  const [prodOriginalPrice, setProdOriginalPrice] = useState(199);
  const [prodCategory, setProdCategory] = useState(data.categories[0]?.id || 'cat-fashion');
  const [prodStock, setProdStock] = useState(20);
  const [prodDesc, setProdDesc] = useState('');
  const [prodFlashDeal, setProdFlashDeal] = useState(false);

  const totalRevenue = (data.orders || []).reduce((acc, o) => acc + o.total, 0);
  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteName,
      brandMark,
      announcement,
      freeShippingMin: Number(freeShippingMin),
      whatsapp,
      cartHoldHours: Number(cartHoldHours)
    });
    alert('تم حفظ إعدادات المتجر بنجاح!');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    addProduct({
      name: prodName,
      price: Number(prodPrice),
      originalPrice: Number(prodOriginalPrice),
      categoryId: prodCategory,
      stock: Number(prodStock),
      description: prodDesc || 'منتج عالي الجودة بتصميم رائع',
      images: ['/images/product-1.jpg'],
      rating: 5,
      reviews: 1,
      sold: 0,
      flashDeal: prodFlashDeal,
      featured: true,
      active: true
    });

    setIsNewProductModalOpen(false);
    setProdName('');
    alert('تمت إضافة المنتج بنجاح!');
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">لوحة تحكم المتجر (Admin)</h1>
          <p className="text-xs font-bold text-gray-500 mt-0.5">إدارة الطلبات، المنتجات، العروض والإعدادات</p>
        </div>

        <button
          onClick={resetData}
          className="rounded-xl border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
        >
          استعادة البيانات الافتراضية
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'نظرة عامة', icon: TrendingUp },
          { id: 'orders', label: `الطلبات (${data.orders?.length || 0})`, icon: Package },
          { id: 'products', label: `المنتجات (${data.products.length})`, icon: ShoppingBag },
          { id: 'settings', label: 'إعدادات المتجر', icon: Settings }
        ].map(tab => {
          const isCurrent = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-black transition-all ${
                isCurrent
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 ring-1 ring-black/5'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <span className="text-xs font-bold text-gray-400">إجمالي المبيعات</span>
              <div className="mt-2 text-2xl font-black text-gray-900">
                {totalRevenue.toLocaleString('en-US')} {currencySymbol}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <span className="text-xs font-bold text-gray-400">الطلبات المسجلة</span>
              <div className="mt-2 text-2xl font-black text-orange-600">
                {data.orders?.length || 0}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <span className="text-xs font-bold text-gray-400">المنتجات النشطة</span>
              <div className="mt-2 text-2xl font-black text-emerald-600">
                {data.products.filter(p => p.active).length}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <span className="text-xs font-bold text-gray-400">الأقسام</span>
              <div className="mt-2 text-2xl font-black text-blue-600">
                {data.categories.length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Management Tab */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
          <h2 className="text-lg font-black text-gray-900">إدارة الطلبات</h2>
          <div className="space-y-4">
            {(data.orders || []).map(order => (
              <div key={order.id} className="rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-black text-sm text-gray-900">طلب #{order.id}</span>
                    <span className="text-xs text-gray-500 font-bold block">
                      العميل: {order.customer.name} ({order.customer.phone})
                    </span>
                  </div>

                  {/* Status selector */}
                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value as any)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-800"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="processing">قيد التجهيز</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="delivered">تم التوصيل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>

                <div className="text-xs text-gray-600">
                  {order.items.map(it => `${it.quantity}x ${it.name}`).join(' ، ')}
                </div>
                <div className="text-xs font-black text-orange-600">
                  الإجمالي: {order.total} {currencySymbol}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Management Tab */}
      {activeTab === 'products' && (
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900">إدارة المنتجات</h2>
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
            >
              <Plus size={16} />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.products.map(prod => (
              <div key={prod.id} className="rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="flex gap-3">
                  <img src={prod.images[0]} className="h-16 w-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-xs font-black text-gray-900 truncate">{prod.name}</h3>
                    <div className="mt-1 text-xs font-bold text-orange-600">{prod.price} {currencySymbol}</div>
                    <div className="text-[10px] text-gray-500 font-bold">المخزون: {prod.stock} قطعة</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
                  <button
                    onClick={() => updateProduct(prod.id, { flashDeal: !prod.flashDeal })}
                    className={`rounded-lg px-2.5 py-1 font-bold ${
                      prod.flashDeal ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {prod.flashDeal ? '⚡ عرض برق' : 'عرض عادي'}
                  </button>

                  <button
                    onClick={() => {
                      const newStock = prompt('أدخل كمية المخزون الجديدة:', String(prod.stock));
                      if (newStock !== null) {
                        updateProduct(prod.id, { stock: Number(newStock) });
                      }
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    تعديل المخزون
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف ${prod.name}؟`)) {
                        deleteProduct(prod.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
          <h2 className="text-lg font-black text-gray-900">إعدادات المتجر العامة</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">اسم المتجر</label>
              <input
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">شعار الأيقونة (مثال: دُو)</label>
              <input
                value={brandMark}
                onChange={e => setBrandMark(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">شريط الإعلانات العلوي</label>
              <input
                value={announcement}
                onChange={e => setAnnouncement(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">الحد الأدنى للشحن المجاني</label>
              <input
                type="number"
                value={freeShippingMin}
                onChange={e => setFreeShippingMin(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">رقم الواتساب للدعم</label>
              <input
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">مدة حجز المنتج بالسلة (ساعات)</label>
              <input
                type="number"
                value={cartHoldHours}
                onChange={e => setCartHoldHours(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold outline-none focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-2xl bg-orange-500 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-95 transition-all"
          >
            حفظ التغييرات
          </button>
        </form>
      )}

      {/* New Product Modal */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-gray-900">إضافة منتج جديد</h2>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">اسم المنتج *</label>
                <input
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="مثال: فستان سهرة مخملي"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">السعر الحالي *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">السعر الأصلي (قبل الخصم)</label>
                  <input
                    type="number"
                    value={prodOriginalPrice}
                    onChange={e => setProdOriginalPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">القسم</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold outline-none"
                  >
                    {data.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">الكمية بالمخزون</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">وصف المنتج</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  placeholder="وصف تفصيلي للمنتج..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm font-bold outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="flashToggle"
                  checked={prodFlashDeal}
                  onChange={e => setProdFlashDeal(e.target.checked)}
                  className="rounded accent-orange-500 h-4 w-4"
                />
                <label htmlFor="flashToggle" className="text-xs font-bold text-gray-700">
                  إضافة كعرض برق ⚡
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow"
                >
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
