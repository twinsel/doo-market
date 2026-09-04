import React, { useState, useEffect } from 'react';
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
  Search,
  Edit3,
  Trash2,
  Plus,
  CheckCircle2,
  X,
  AlertTriangle,
  Map,
  Building,
  Home as HomeIcon,
  Briefcase,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { QrCodeCard } from '../components/QrCodeCard';
import { Order, Address } from '../types';
import { syncUserToSupabase, deleteUserFromSupabase } from '../services/supabaseService';

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
  const { currentUser, isAuthenticated, logout, data, login, deleteUser } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'support'>('orders');
  const [searchCode, setSearchCode] = useState('');

  // ----- Edit Profile State -----
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // ----- Delete Account State -----
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ----- Addresses State -----
  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const saved = localStorage.getItem(`doo_addresses_${currentUser?.id || 'guest'}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'addr-1',
        userId: currentUser?.id || 'u1',
        name: 'المنزل',
        city: 'الرياض',
        street: 'حي الياسمين، شارع أنس بن مالك',
        buildingNumber: '42',
        phone: currentUser?.phone || '0501234567',
        isDefault: true,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [isAddAddressOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState('المنزل');
  const [addrCity, setAddrCity] = useState('الرياض');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrBuilding, setAddrBuilding] = useState('');
  const [addrPhone, setAddrPhone] = useState(currentUser?.phone || '');
  const [addrNotes, setAddrNotes] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Sync Addresses to localStorage
  useEffect(() => {
    if (currentUser?.id) {
      try {
        localStorage.setItem(`doo_addresses_${currentUser.id}`, JSON.stringify(addresses));
      } catch (e) {
        console.error('Failed to save addresses:', e);
      }
    }
  }, [addresses, currentUser?.id]);

  const orders = data.orders || [];

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    navigate(`/track-order?code=${encodeURIComponent(searchCode.trim())}`);
  };

  // ----- Handlers -----
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      phone: editPhone.trim() || currentUser.phone
    };

    login(updatedUser);
    syncUserToSupabase(updatedUser);

    setEditSuccessMsg('تم تحديث بياناتك بنجاح! ✨');
    setTimeout(() => {
      setEditSuccessMsg('');
      setIsEditModalOpen(false);
    }, 1200);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!currentUser) return;
    setIsDeleting(true);

    const targetId = currentUser.id;
    const targetEmail = currentUser.email;

    try {
      // 1. Delete from Supabase DB
      await deleteUserFromSupabase(targetId);
      if (targetEmail) {
        await deleteUserFromSupabase(targetEmail);
      }

      // 2. Delete from ShopContext
      deleteUser(targetId);

      // 3. Clear all Local Storage items completely
      try {
        localStorage.clear();
      } catch {}

      setIsDeleting(false);
      setIsDeleteModalOpen(false);

      // 4. Force reload / redirect to auth register page freshly
      window.location.href = `${window.location.origin}/#/auth?tab=register`;
    } catch (e) {
      console.error('Delete account error:', e);
      setIsDeleting(false);
      try {
        localStorage.clear();
      } catch {}
      window.location.href = `${window.location.origin}/#/auth?tab=register`;
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !currentUser) return;

    let updatedList = [...addresses];

    if (addrIsDefault) {
      updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
    }

    if (editingAddressId) {
      updatedList = updatedList.map(a => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            name: addrName.trim() || 'عنوان للتوصيل',
            city: addrCity.trim(),
            street: addrStreet.trim(),
            buildingNumber: addrBuilding.trim(),
            phone: addrPhone.trim(),
            notes: addrNotes.trim(),
            isDefault: addrIsDefault
          };
        }
        return a;
      });
    } else {
      const newAddress: Address = {
        id: 'addr-' + Date.now(),
        userId: currentUser.id,
        name: addrName.trim() || 'عنوان للتوصيل',
        city: addrCity.trim(),
        street: addrStreet.trim(),
        buildingNumber: addrBuilding.trim(),
        phone: addrPhone.trim(),
        notes: addrNotes.trim(),
        isDefault: addrIsDefault || addresses.length === 0,
        createdAt: new Date().toISOString()
      };
      updatedList.unshift(newAddress);
    }

    setAddresses(updatedList);
    setIsAddressModalOpen(false);
    resetAddressForm();
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrName('المنزل');
    setAddrCity('الرياض');
    setAddrStreet('');
    setAddrBuilding('');
    setAddrPhone(currentUser?.phone || '');
    setAddrNotes('');
    setAddrIsDefault(false);
  };

  const isGuest = currentUser?.id?.startsWith('guest-') || false;

  if (!isAuthenticated || !currentUser || isGuest) {
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
      {/* ============================================================ */}
      {/* PROFILE HEADER BOX */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-2xl font-black text-white shadow-md shadow-orange-500/20 shrink-0">
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

        {/* Admin Portal Button */}
        {currentUser.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center gap-1.5 rounded-2xl bg-gray-900 px-4 py-2.5 text-xs font-black text-white shadow hover:bg-gray-800 transition-all"
          >
            <ShieldCheck size={16} />
            <span>لوحة الإدارة</span>
          </Link>
        )}
      </div>

      {/* ============================================================ */}
      {/* EDIT PROFILE MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Edit3 size={18} className="text-orange-500" />
                  تعديل البيانات الشخصية
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {editSuccessMsg && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{editSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1 text-right">
                  <label className="block text-xs font-bold text-gray-600">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1 text-right">
                  <label className="block text-xs font-bold text-gray-600">رقم الجوال</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1 text-right opacity-60">
                  <label className="block text-xs font-bold text-gray-500">البريد الإلكتروني (غير قابل للتعديل)</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email || ''}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-100 p-3 text-sm font-bold text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="rounded-2xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600"
                  >
                    حفظ التعديلات
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle size={32} />
              </div>

              <h3 className="text-lg font-black text-gray-900">حذف الحساب نهائياً</h3>
              <p className="text-xs text-gray-500 font-bold leading-relaxed">
                هل أنت متأكد من رغبتك في حذف حسابك نهائياً؟ سيتم مسح جميع بياناتك وعناوينك وطلباتك المخزنة ولا يمكن التراجع عن هذا الإجراء.
              </p>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteAccount}
                  className="flex-1 rounded-2xl bg-red-600 py-3 text-xs font-black text-white shadow-lg shadow-red-600/25 hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'جاري الحذف...' : 'نعم، احذف الحساب'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Account Action Buttons Row (Placed together right above Tabs Bar) */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
        {/* Edit Profile Button */}
        <button
          onClick={() => {
            setEditName(currentUser.name);
            setEditPhone(currentUser.phone || '');
            setIsEditModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-2xl border border-orange-200/80 bg-orange-50/80 px-4 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-100 transition-all shadow-sm"
          title="تعديل البيانات الشخصية"
        >
          <Edit3 size={15} />
          <span>تعديل البيانات</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <LogOut size={15} />
          <span>تسجيل الخروج</span>
        </button>

        {/* Delete Account Button */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex items-center gap-1.5 rounded-2xl border border-red-200/80 bg-red-50/80 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-all shadow-sm"
          title="حذف الحساب نهائياً"
        >
          <Trash2 size={15} />
          <span>حذف الحساب</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TABS ROW */}
      {/* ============================================================ */}
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
          <span>عناوين التوصيل ({addresses.length})</span>
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

      {/* ============================================================ */}
      {/* TAB CONTENTS */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* ADDRESSES & LOCATIONS TAB */}
      {/* ============================================================ */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" />
                عناوين التوصيل والمواقع المحفوظة
              </h2>
              <button
                type="button"
                onClick={() => {
                  resetAddressForm();
                  setIsAddressModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-2xl bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
              >
                <Plus size={16} />
                <span>إضافة موقع جديد 📍</span>
              </button>
            </div>

            {/* Address Cards List */}
            <div className="grid gap-3 sm:grid-cols-2">
              {addresses.map(addr => (
                <div
                  key={addr.id}
                  className={`relative flex flex-col justify-between rounded-2xl border-2 p-4 transition-all ${
                    addr.isDefault
                      ? 'border-orange-500 bg-orange-50/20 shadow-sm'
                      : 'border-gray-100 bg-gray-50/50 hover:border-gray-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                        {addr.name.includes('عمل') ? <Briefcase size={14} className="text-orange-500" /> : <HomeIcon size={14} className="text-orange-500" />}
                        {addr.name}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-black text-orange-600">
                          افتراضي
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-gray-700 leading-relaxed">
                      {addr.city} · {addr.street} {addr.buildingNumber ? `(مبنى ${addr.buildingNumber})` : ''}
                    </p>
                    {addr.phone && (
                      <p className="text-xs text-gray-400 font-bold" dir="ltr">
                        {addr.phone}
                      </p>
                    )}
                    {addr.notes && (
                      <p className="text-[11px] text-gray-500 font-medium italic">
                        ملاحظات: {addr.notes}
                      </p>
                    )}
                  </div>

                  {/* Address Card Actions */}
                  <div className="flex items-center justify-between border-t border-gray-100/80 pt-3 mt-3">
                    {!addr.isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1"
                      >
                        <Check size={12} />
                        <span>تعيين كافتراضي</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>محدد للتوصيل</span>
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(addr.id);
                          setAddrName(addr.name);
                          setAddrCity(addr.city);
                          setAddrStreet(addr.street);
                          setAddrBuilding(addr.buildingNumber || '');
                          setAddrPhone(addr.phone || '');
                          setAddrNotes(addr.notes || '');
                          setAddrIsDefault(addr.isDefault);
                          setIsAddressModalOpen(true);
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-orange-600"
                        title="تعديل العنوان"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs font-bold text-red-400 hover:text-red-600"
                        title="حذف العنوان"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADD / EDIT ADDRESS MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isAddAddressOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
                  {editingAddressId ? 'تعديل عنوان التوصيل' : 'إضافة موقع / عنوان جديد 📍'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-600">اسم الموقع (مثال: المنزل، العمل)</label>
                    <input
                      type="text"
                      required
                      value={addrName}
                      onChange={e => setAddrName(e.target.value)}
                      placeholder="المنزل"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-600">المدينة</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={e => setAddrCity(e.target.value)}
                      placeholder="الرياض، جدة، دمشق..."
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600">اسم الحي والشارع التفصيلي *</label>
                  <input
                    type="text"
                    required
                    value={addrStreet}
                    onChange={e => setAddrStreet(e.target.value)}
                    placeholder="حي الياسمين، شارع أنس بن مالك"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-600">رقم المبنى / الشقة (اختياري)</label>
                    <input
                      type="text"
                      value={addrBuilding}
                      onChange={e => setAddrBuilding(e.target.value)}
                      placeholder="مبنى 12، شقة 4"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-600">رقم جوال للتوصيل</label>
                    <input
                      type="tel"
                      value={addrPhone}
                      onChange={e => setAddrPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-600">ملاحظات سائق التوصيل (اختياري)</label>
                  <input
                    type="text"
                    value={addrNotes}
                    onChange={e => setAddrNotes(e.target.value)}
                    placeholder="بجانب المسجد، الاتصال قبل الوصول بـ 10 دقائق..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addrIsDefault}
                      onChange={e => setAddrIsDefault(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <span>تعيين هذا العنوان كعنوان توصيل افتراضي</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="rounded-2xl bg-gray-100 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600"
                  >
                    {editingAddressId ? 'تحديث العنوان' : 'حفظ العنوان 📍'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* SUPPORT & ASSISTANCE TAB */}
      {/* ============================================================ */}
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
