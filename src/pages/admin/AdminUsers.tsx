import React, { useState, useMemo } from 'react';
import {
  Users,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  Heart,
  TrendingUp,
  Shield,
  Crown,
  Zap,
  X,
  Wallet,
  Clock,
  ExternalLink,
  Package,
  History,
  CheckCircle2,
  LayoutGrid,
  List,
  Search,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ============================================================
// 👤  نافذة تفاصيل المستخدم الاحترافية
// ============================================================
const UserDetailModal: React.FC<{
  user: any;
  onClose: () => void;
  onDeleteUser: (user: any) => void;
  initialTab: 'cart' | 'wishlist' | 'orders';
}> = ({ user, onClose, onDeleteUser, initialTab }) => {
  const { getProduct, data } = useShop();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  const cartTotal = user.cart.reduce((sum: number, item: any) => {
    const prod = getProduct(item.productId);
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const userOrders = (data.orders || []).filter(o =>
    o.customer.name === user.name || (user.phone && o.customer.phone === user.phone)
  );

  const tabs = [
    { id: 'cart', label: 'السلة', icon: ShoppingCart, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'wishlist', label: 'المفضلة', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
    { id: 'orders', label: 'الطلبات', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      dir="rtl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 shrink-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

          {/* Action Header Buttons */}
          <div className="absolute left-6 top-6 flex items-center gap-2 z-50">
            <button
              type="button"
              onClick={() => {
                onClose();
                onDeleteUser(user);
              }}
              className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-2 text-xs font-black text-red-300 hover:bg-red-600 hover:text-white transition-all shadow-md"
              title="حذف المستخدم وجميع بياناته"
            >
              <Trash2 size={15} />
              <span>حذف الحساب والبيانات</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl overflow-hidden border-4 border-white/20 shadow-2xl">
                {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" alt="" /> : user.name.charAt(0)}
              </div>
              <div className={`absolute -bottom-1 -left-1 h-6 w-6 rounded-full border-4 border-white shadow-sm ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                {user.isOnline && <div className="h-full w-full rounded-full bg-emerald-500 animate-ping opacity-75" />}
              </div>
            </div>

            <div className="space-y-1.5 text-right text-white">
              <h2 className="text-3xl font-black flex items-center gap-3">
                {user.name}
                {user.role === 'admin' && <Crown size={24} className="text-amber-500" />}
              </h2>
              <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
                <span className="flex items-center gap-1.5"><Phone size={14} /> {user.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                <span className="flex items-center gap-1.5"><Calendar size={14} /> عضو منذ: {user.joinedAt}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-black transition-all ${
                  isActive ? tab.color : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabLine"
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-t-full ${tab.bg.replace('50', '500')}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'cart' && (
              <motion.div
                key="cart-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400">إجمالي قيمة السلة</p>
                      <p className="text-2xl font-black text-slate-900">{cartTotal.toLocaleString()} <span className="text-sm text-orange-500">ر.س</span></p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-400">عدد المنتجات</p>
                    <p className="text-xl font-black text-slate-900">{user.cart.length} قطع</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {user.cart.length > 0 ? (
                    user.cart.map((item: any, idx: number) => {
                      const product = getProduct(item.productId);
                      if (!product) return null;
                      return (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl border border-slate-100 hover:border-orange-200 transition-all bg-white group">
                          <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-inner ring-1 ring-black/5 shrink-0">
                            <img src={product.images[0]} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          </div>
                          <div className="flex-1 text-right">
                            <h4 className="font-black text-sm text-slate-900">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-600">الكمية: {item.quantity}</span>
                              {item.selectedColor && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">
                                  <span>اللون:</span>
                                  <div className="w-2.5 h-2.5 rounded-full border border-slate-200" style={{ backgroundColor: item.selectedColor }} />
                                </div>
                              )}
                              {item.selectedSize && (
                                <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500">المقاس: {item.selectedSize}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                             <span className="text-sm font-black text-slate-900">{product.price.toLocaleString()} ر.س</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 text-slate-300 font-black">السلة فارغة حالياً 🛒</div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div
                key="wishlist-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {user.wishlist.length > 0 ? (
                  user.wishlist.map((id: string) => {
                    const product = getProduct(id);
                    if (!product) return null;
                    return (
                      <div key={id} className="flex items-center gap-4 p-4 rounded-3xl border border-pink-100 bg-white hover:border-pink-300 transition-all group">
                        <img src={product.images[0]} className="h-16 w-16 rounded-2xl object-cover ring-1 ring-black/5" alt="" />
                        <div className="flex-1 text-right">
                          <h4 className="font-black text-sm text-slate-900 truncate">{product.name}</h4>
                          <p className="text-xs font-black text-pink-600 mt-1">{product.price} ر.س</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-400">
                          <Heart size={16} fill="currentColor" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-20 text-slate-300 font-black">لم يتم إضافة منتجات للمفضلة بعد ❤️</div>
                )}
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {userOrders.length > 0 ? (
                  userOrders.map((order: any) => (
                    <div key={order.id} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-400">طلب رقم #{order.id}</p>
                            <p className="text-sm font-black text-slate-900">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-base font-black text-emerald-600">{order.total.toLocaleString()} ر.س</span>
                          <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-slate-100 text-slate-500">{order.items.length} منتجات</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100/50 pt-4">
                        <div className="flex items-center gap-2 text-xs font-black text-emerald-500">
                          <CheckCircle2 size={14} />
                          {order.status === 'delivered' ? 'تم التوصيل' : 'قيد المعالجة'}
                        </div>
                        <button
                          onClick={() => {
                            onClose();
                            navigate(`/admin/orders?id=${order.id}`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-black text-orange-600 hover:gap-2 transition-all"
                        >
                          عرض الطلب <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <History size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black">لا يوجد طلبات سابقة لهذا العميل</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================
// 🏠  بطاقة المستخدم الحالية
// ============================================================
const UserCard: React.FC<{
  user: any;
  index: number;
  onOpenDetail: (user: any, tab: 'cart' | 'wishlist' | 'orders') => void;
  onDeleteUser: (user: any) => void;
}> = ({ user, index, onOpenDetail, onDeleteUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -6 }}
    className="relative rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4 hover:shadow-xl hover:ring-orange-200 transition-all duration-300 group"
  >
    {/* Status Badge & Delete Button */}
    <div className="absolute top-4 left-4 flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteUser(user);
        }}
        className="h-8 w-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm"
        title="حذف الحساب والبيانات نهائياً"
      >
        <Trash2 size={15} />
      </button>

      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
        <div className={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
        <span className="text-[10px] font-black text-slate-500">{user.isOnline ? 'متصل' : 'أوفلاين'}</span>
      </div>
    </div>

    {/* User Info */}
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 overflow-hidden shadow-inner ring-1 ring-black/5">
          {user.avatar ? (
            <img src={user.avatar} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-500 text-white font-black text-xl">
               {user.name.charAt(0)}
            </div>
          )}
        </div>
        {user.role === 'admin' && (
          <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white z-10">
            <Shield size={10} className="text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 text-right">
        <h3 className="font-black text-base text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
          {user.name}
          {user.badges?.includes('المدير المؤسس') && (
            <Crown size={14} className="text-amber-500" />
          )}
        </h3>
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black mt-1 ${
          user.role === 'admin'
            ? 'bg-purple-50 text-purple-700 border border-purple-100'
            : 'bg-blue-50 text-blue-700 border border-blue-100'
        }`}>
          {user.role === 'admin' ? 'مدير نظام' : 'مشتري موثق'}
        </span>
      </div>
    </div>

    {/* Contact Info */}
    <div className="space-y-2 text-xs text-slate-600 font-bold border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-normal">{user.phone}</span>
        <span className="flex items-center gap-1.5 text-slate-400 font-normal">
          <Phone size={12} />
          الهاتف
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-normal truncate max-w-[150px]">{user.email}</span>
        <span className="flex items-center gap-1.5 text-slate-400 font-normal">
          <Mail size={12} />
          البريد
        </span>
      </div>
    </div>

    {/* Stats */}
    <div className="flex items-center gap-2 pt-2">
      <button onClick={() => onOpenDetail(user, 'cart')} className="flex-1 rounded-xl bg-orange-50 p-2.5 text-center border border-orange-100/50 hover:bg-orange-100 transition-colors">
        <ShoppingCart size={14} className="mx-auto text-orange-400 mb-0.5" />
        <p className="font-black text-slate-900 text-sm">{user.cart.length}</p>
      </button>
      <button onClick={() => onOpenDetail(user, 'wishlist')} className="flex-1 rounded-xl bg-pink-50 p-2.5 text-center border border-pink-100/50 hover:bg-pink-100 transition-colors">
        <Heart size={14} className="mx-auto text-pink-400 mb-0.5" />
        <p className="font-black text-slate-900 text-sm">{user.wishlist.length}</p>
      </button>
      <button onClick={() => onOpenDetail(user, 'orders')} className="flex-1 rounded-xl bg-emerald-50 p-2.5 text-center border border-emerald-100/50 hover:bg-emerald-100 transition-colors">
        <TrendingUp size={14} className="mx-auto text-emerald-400 mb-0.5" />
        <p className="font-black text-slate-900 text-sm">{user.ordersCount}</p>
      </button>
    </div>
  </motion.div>
);

const UserRow: React.FC<{
  user: any;
  onOpenDetail: (user: any, tab: 'cart' | 'wishlist' | 'orders') => void;
  onDeleteUser: (user: any) => void;
}> = ({ user, onOpenDetail, onDeleteUser }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="p-6 text-right">
      <div className="flex items-center gap-3 justify-start">
        <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden">
          {user.avatar ? <img src={user.avatar} className="h-full w-full object-cover" alt="" /> : <div className="h-full w-full flex items-center justify-center bg-orange-100 text-orange-600">{user.name.charAt(0)}</div>}
        </div>
        <div>
          <div className="font-black text-slate-900">{user.name}</div>
          <div className="text-[10px] text-slate-400">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="p-6 text-right">
      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
        {user.role === 'admin' ? 'مدير' : 'عميل'}
      </span>
    </td>
    <td className="p-6 text-right font-black text-slate-500 text-xs">
       {user.ordersCount} طلبات · {user.cart.length} سلة
    </td>
    <td className="p-6 text-right">
      <div className="flex items-center gap-1.5 justify-end">
        <div className={`h-2 w-2 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <span className="text-[10px] font-bold text-slate-400">{user.isOnline ? 'نشط' : 'أوفلاين'}</span>
      </div>
    </td>
    <td className="p-6">
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => onOpenDetail(user, 'cart')} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><ExternalLink size={18}/></button>
        <button
          onClick={() => onDeleteUser(user)}
          className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
          title="حذف الحساب والبيانات نهائياً"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </td>
  </tr>
);

export const AdminUsersPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [initialTab, setInitialTab] = useState<'cart' | 'wishlist' | 'orders'>('cart');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const { registeredUsers, currentUser, cart, wishlist, data, deleteUser, clearAllUsers } = useShop();

  const allUsers = useMemo(() => {
    const combined: any[] = [];
    const addedKeys = new Set<string>();

    const listToProcess = [...(registeredUsers || [])];
    if (currentUser && !listToProcess.some(u => u.id === currentUser.id || (u.email && u.email === currentUser.email))) {
      listToProcess.unshift(currentUser);
    }

    listToProcess.forEach((uItem: any) => {
      const u = uItem || {};
      const key = (u.email || u.id || '').toLowerCase();

      if (key && !addedKeys.has(key)) {
        addedKeys.add(key);
        const isSelf = (currentUser?.email && currentUser.email.toLowerCase() === (u.email || '').toLowerCase()) || currentUser?.id === u.id;
        const userOrders = (data.orders || []).filter(o =>
          (o.customer?.name && o.customer.name.trim() === u.name?.trim()) ||
          (o.customer?.phone && u.phone && o.customer.phone === u.phone)
        );

        const lastActiveTime = u.last_login_at || u.lastLoginAt || u.updated_at || u.created_at;
        const isRecentlyActive = lastActiveTime ? (Date.now() - new Date(lastActiveTime).getTime()) < 60 * 60 * 1000 : false;
        const userIsOnline = isSelf || isRecentlyActive || u.isOnline === true;

        combined.push({
          id: u.id || 'usr-' + Math.random(),
          name: u.name || 'مشترك',
          email: u.email || '',
          phone: u.phone || '',
          role: u.role || 'buyer',
          joinedAt: u.joinedAt || 'اليوم',
          isOnline: userIsOnline,
          avatar: u.avatar || undefined,
          cart: isSelf ? cart : (u.cart || []),
          wishlist: isSelf ? wishlist : (u.wishlist || []),
          ordersCount: userOrders.length || u.ordersCount || 0,
          totalSpent: userOrders.reduce((sum, o) => sum + (o.total || 0), 0) || u.totalSpent || 0,
          badges: u.role === 'admin' ? ['المدير المؤسس'] : ['مشترك جديد 🆕', 'مشتري موثق']
        });
      }
    });

    return combined;
  }, [registeredUsers, currentUser, cart, wishlist, data.orders]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return allUsers;
    const s = search.toLowerCase();
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.phone.includes(s)
    );
  }, [search, allUsers]);

  const handleOpenDetail = (user: any, tab: 'cart' | 'wishlist' | 'orders') => {
    setSelectedUser(user);
    setInitialTab(tab);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    deleteUser(userToDelete.id || userToDelete.email || userToDelete.phone);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header - التصميم الموحد الجديد بدقة مطلقة */}
      <div className="relative h-20 overflow-hidden rounded-[2rem] bg-[#0f172a] px-8 shadow-2xl flex items-center justify-between border border-white/5">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Right Side: Icon & Title */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner shrink-0">
            <Users className="text-orange-500" size={24} />
          </div>
          <div className="text-right">
            <h1 className="text-lg font-black text-white">إدارة المستخدمين والحسابات</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">التحكم بالحسابات المسجلة وحذف المستخدمين نهائياً</p>
          </div>
        </div>

        {/* Left Side: Actions (Stats, Toggle, Search) */}
        <div className="relative z-10 flex items-center gap-4">
          {/* Purge All Storage Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من مسح وتطهير جميع الحسابات والجلسات السابقة من الذاكرة والبدء بالنظيف؟')) {
                clearAllUsers();
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-red-500/20 hover:bg-red-600 px-3 py-1.5 text-[10px] font-black text-red-300 hover:text-white border border-red-500/30 shrink-0 transition-all"
            title="تطهير ومسح كافة الحسابات والجلسات والبدء بالنظيف"
          >
            <Trash2 size={13} />
            <span>تطهير الذاكرة والحسابات 🧹</span>
          </button>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10 shrink-0">
            <span className="text-[10px] font-black text-slate-300">الكل {allUsers.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-emerald-500/20 shrink-0">
            <Zap size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400">{allUsers.filter(u => u.isOnline).length}</span>
          </div>

          {/* View Mode Toggle - Pill Toggle */}
          <div className="flex bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0 h-10 items-center">
             <button
               onClick={() => setViewMode('grid')}
               className={`h-8 w-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                 viewMode === 'grid'
                   ? 'bg-white text-slate-900 shadow-xl'
                   : 'text-white/60 hover:text-white'
               }`}
             >
               <LayoutGrid size={18}/>
             </button>
             <button
               onClick={() => setViewMode('table')}
               className={`h-8 w-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                 viewMode === 'table'
                   ? 'bg-white text-slate-900 shadow-xl'
                   : 'text-white/60 hover:text-white'
               }`}
             >
               <List size={18}/>
             </button>
          </div>

          {/* Search Bar - Pill Style */}
          <div className="relative group hidden sm:block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث عن مستخدم..."
              className="h-10 pr-10 pl-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] placeholder:text-slate-500 focus:bg-slate-800 focus:border-blue-500/50 outline-none transition-all w-56 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Users Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u: any, index: number) => (
            <UserCard
              key={u.id}
              user={u}
              index={index}
              onOpenDetail={handleOpenDetail}
              onDeleteUser={(target) => setUserToDelete(target)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-right text-sm font-bold">
            <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
              <tr>
                <th className="p-6 font-black uppercase text-[10px]">المستخدم</th>
                <th className="p-6 font-black uppercase text-[10px]">الدور</th>
                <th className="p-6 font-black uppercase text-[10px]">الإحصائيات</th>
                <th className="p-6 font-black uppercase text-[10px]">الحالة</th>
                <th className="p-6 font-black uppercase text-[10px]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u: any, index: number) => (
                <UserRow
                  key={u.id}
                  user={u}
                  onOpenDetail={handleOpenDetail}
                  onDeleteUser={(target) => setUserToDelete(target)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            initialTab={initialTab}
            onClose={() => setSelectedUser(null)}
            onDeleteUser={(target) => setUserToDelete(target)}
          />
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl text-center space-y-5 border border-slate-100"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 text-red-600 shadow-inner">
                <AlertTriangle size={38} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">حذف الحساب ومسح البيانات</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  هل أنت متأكد من تنفيذ عملية حذف حساب <span className="text-red-600 font-black">{userToDelete.name}</span> نهائياً؟
                </p>
                <div className="my-3 rounded-2xl bg-red-50 p-3 text-right text-[11px] font-bold text-red-700 border border-red-100 space-y-1">
                  <p className="font-black text-red-800">⚠️ ما الذي سيحدث عند الحذف:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-red-600">
                    <li>إلغاء جلسة دخوله وإجباره فوراً على التسجيل من جديد.</li>
                    <li>مسح كافة طلباته السابقة وسلة تسوقه ومفضلته.</li>
                    <li>تطهير ذاكرة الويب من بريده الإلكتروني ورقم هاتفه.</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-2xl bg-red-600 hover:bg-red-500 py-3.5 text-sm font-black text-white shadow-xl shadow-red-600/30 transition-all active:scale-95"
                >
                  نعم، احذف كلياً
                </button>
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 rounded-2xl bg-slate-100 hover:bg-slate-200 py-3.5 text-sm font-black text-slate-700 transition-all active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
