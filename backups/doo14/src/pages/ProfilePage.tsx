import React, { useState, useEffect, useMemo } from 'react';
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
  Check,
  Camera,
  Upload,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { QrCodeCard } from '../components/QrCodeCard';
import { ProfileEditModal } from '../components/profile/ProfileEditModal';
import { ProfileDeleteModal } from '../components/profile/ProfileDeleteModal';
import { ProfileAddressModal } from '../components/profile/ProfileAddressModal';
import { Order, Address } from '../types';
import { syncUserToSupabase, deleteUserFromSupabase, deleteOwnAccount } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

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
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320;
        const MAX_HEIGHT = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setEditAvatar(compressedDataUrl);
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

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

  // Filter orders strictly for the current logged-in user
  const orders = useMemo(() => {
    if (!currentUser) return [];
    const name = currentUser.name?.trim().toLowerCase();
    const phone = currentUser.phone?.replace(/\D/g, '');

    return (data.orders || []).filter(o => {
      if (!o.customer) return false;
      const cName = o.customer.name?.trim().toLowerCase();
      const cPhone = o.customer.phone?.replace(/\D/g, '');

      const nameMatch = name && cName && cName === name;
      const phoneMatch = phone && cPhone && (cPhone.includes(phone) || phone.includes(cPhone));

      return nameMatch || phoneMatch;
    });
  }, [data.orders, currentUser]);

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    navigate(`/track-order?code=${encodeURIComponent(searchCode.trim())}`);
  };

  // ----- Handlers -----
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSavingProfile) return;

    setIsSavingProfile(true);

    const newName = editName.trim() || currentUser.name;
    const cleanPhone = editPhone.trim() || null;
    const newAvatar = editAvatar || undefined;

    const updatedUser = {
      ...currentUser,
      name: newName,
      phone: cleanPhone || '',
      avatar: newAvatar
    };

    // 1. Instant local UI update (0.001s)
    login(updatedUser);
    setEditSuccessMsg('تم تحديث البيانات والصورة الشخصية بنجاح! ✨');

    // 2. Background async save to Supabase DB
    try {
      const { error } = await supabase.from('users').update({
        name: newName,
        phone: cleanPhone,
        avatar: editAvatar || null
      }).eq('id', currentUser.id);

      if (error) {
        if (error.code === '23505') {
          alert('رقم الجوال هذا مستخدم من قبل حساب آخر بالفعل');
          setIsSavingProfile(false);
          return;
        }
        console.warn('DB profile update warning:', error.message);
      }

      await syncUserToSupabase(updatedUser).catch(() => {});
    } catch (err) {
      console.warn('Profile save async error:', err);
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => {
        setEditSuccessMsg('');
        setIsEditModalOpen(false);
      }, 800);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!currentUser) return;
    setIsDeleting(true);

    const targetId = currentUser.id;
    const targetEmail = currentUser.email;

    try {
      // 1. Direct RPC calls to Supabase delete_own_account and delete_user_completely
      if (targetEmail) {
        try { await supabase.rpc('delete_user_completely', { p_email: targetEmail.toLowerCase() }); } catch {}
      }
      try { await supabase.rpc('delete_own_account'); } catch {}

      // 2. Delete own account via master API and broadcast
      await deleteOwnAccount(targetId, targetEmail).catch(() => {});

      // 3. Delete user data from Supabase DB tables
      await deleteUserFromSupabase(targetId, targetEmail).catch(() => {});

      // 4. Clear user from ShopContext
      deleteUser(targetId, targetEmail);

      // 5. Wipe localStorage and sessionStorage completely
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}

      // 6. Sign out from Supabase Auth session
      await supabase.auth.signOut().catch(() => {});

      setIsDeleting(false);
      setIsDeleteModalOpen(false);

      // 7. Force redirect to register tab cleanly
      window.location.href = `${window.location.origin}/#/auth?tab=register`;
    } catch (e) {
      console.error('Delete account fallback:', e);
      setIsDeleting(false);
      try {
        localStorage.clear();
        sessionStorage.clear();
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
          <div className="relative group">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-2xl font-black text-white shadow-md shadow-orange-500/20 shrink-0 overflow-hidden ring-2 ring-orange-500/20">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} className="h-full w-full object-cover" alt={currentUser.name} />
              ) : (
                currentUser.name.charAt(0)
              )}
            </div>
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone || '');
                setEditAvatar(currentUser.avatar || '');
                setIsEditModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-colors"
              title="تعديل الصورة الشخصية"
            >
              <Camera size={12} />
            </button>
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
            className="flex items-center gap-1.5 rounded-2xl bg-gray-900 px-3.5 py-2 text-xs font-black text-white shadow hover:bg-gray-800 transition-all"
          >
            <ShieldCheck size={15} />
            <span>لوحة الإدارة</span>
          </Link>
        )}
      </div>

      {/* ============================================================ */}
      {/* EDIT PROFILE MODAL */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={currentUser}
        editName={editName}
        setEditName={setEditName}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editAvatar={editAvatar}
        setEditAvatar={setEditAvatar}
        editSuccessMsg={editSuccessMsg}
        isSavingProfile={isSavingProfile}
        handleSaveProfile={handleSaveProfile}
        handleImageUpload={handleImageUpload}
        presetAvatars={presetAvatars}
      />

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <ProfileDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        isDeleting={isDeleting}
        onConfirmDelete={handleConfirmDeleteAccount}
      />

      {/* Clean Tracking Search Input Bar (No Outer Frame, Matching 'طلباتي' Size) */}
      <form onSubmit={handleSearchOrder} className="relative flex items-center w-full">
        <input
          value={searchCode}
          onChange={e => setSearchCode(e.target.value)}
          placeholder="رقم الطلب (مثال: DM8421) أو رقم الهاتف"
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pe-28 ps-11 text-xs font-bold text-gray-900 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
        />
        <Search size={18} className="absolute start-4 text-gray-400" />
        <button
          type="submit"
          className="absolute end-1.5 flex items-center justify-center rounded-xl bg-orange-500 px-6 py-2 text-xs font-black text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 active:scale-95 transition-all"
        >
          تتبع
        </button>
      </form>

      {/* Account Action Buttons Row (Equal 3-column width & matching 'طلباتي' size) */}
      <div className="flex w-full items-center justify-between gap-2.5">
        {/* Edit Profile Button */}
        <button
          onClick={() => {
            setEditName(currentUser.name);
            setEditPhone(currentUser.phone || '');
            setIsEditModalOpen(true);
          }}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-orange-200/80 bg-orange-50/80 py-3 px-3 text-xs font-black text-orange-600 hover:bg-orange-100 transition-all shadow-sm active:scale-95"
          title="تعديل البيانات الشخصية"
        >
          <Edit3 size={16} />
          <span>تعديل البيانات</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 px-3 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>

        {/* Delete Account Button */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-red-50/80 py-3 px-3 text-xs font-black text-red-600 hover:bg-red-100 transition-all shadow-sm active:scale-95"
          title="حذف الحساب نهائياً"
        >
          <Trash2 size={16} />
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
            orders.map((order: Order) => (
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
                  {order.items.map((it: any, i: number) => (
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

      {/* ADD / EDIT ADDRESS MODAL */}
      <ProfileAddressModal
        isOpen={isAddAddressOpen}
        onClose={() => setIsAddressModalOpen(false)}
        editingAddressId={editingAddressId}
        addrName={addrName}
        setAddrName={setAddrName}
        addrCity={addrCity}
        setAddrCity={setAddrCity}
        addrStreet={addrStreet}
        setAddrStreet={setAddrStreet}
        addrBuilding={addrBuilding}
        setAddrBuilding={setAddrBuilding}
        addrPhone={addrPhone}
        setAddrPhone={setAddrPhone}
        addrNotes={addrNotes}
        setAddrNotes={setAddrNotes}
        addrIsDefault={addrIsDefault}
        setAddrIsDefault={setAddrIsDefault}
        handleSaveAddress={handleSaveAddress}
      />

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
