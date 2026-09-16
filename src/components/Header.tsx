import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  Search, 
  Menu, 
  X, 
  ShoppingBag, 
  Clock, 
  ChevronLeft, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Phone,
  Bell,
  User
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const BrandLogoBadge: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const { data } = useShop();
  const mark = (data.settings.brandMark || data.settings.siteName || 'دُو').trim();
  const text = mark.length > 4 ? mark.slice(0, 4) : mark || 'دُو';
  
  const sizeClass = size === 'lg' 
    ? 'h-14 w-14 text-lg rounded-2xl' 
    : size === 'sm' 
    ? 'h-8 w-8 text-xs rounded-lg' 
    : 'h-9 w-9 text-sm rounded-xl';

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 font-black text-white shadow-md shadow-orange-200/40 ${sizeClass} ${className}`}
      title={data.settings.siteName}
    >
      <span className="leading-none tracking-tight">{text}</span>
    </div>
  );
};

export const Header: React.FC = () => {
  const { cartCount, data, searchProducts, isAuthenticated, currentUser } = useShop();
  const location = useLocation();

  const isGuest = currentUser?.id?.startsWith('guest-') || false;
  const isRealMember = isAuthenticated && !isGuest;
  const isAdmin = isRealMember && (currentUser?.role === 'admin' || currentUser?.email?.includes('admin'));
  const isAuthOrProfilePage = location.pathname === '/profile' || location.pathname === '/auth';

  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(2);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const cartControls = useAnimation();
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const notificationsList = [
    { id: 'n1', title: 'عروض برق خاصة ⚡', desc: 'تم خصم حتى 50% على تشكيلة فاخرة جديدة اليوم!', time: 'قبل 10 دقائق' },
    { id: 'n2', title: 'كود خصم ترحيبي 🎁', desc: 'استخدم الكود DOO10 عند الدفع للحصول على خصم إضافي', time: 'قبل ساعة' },
    { id: 'n3', title: 'شحن مجاني متوفر 🚚', desc: 'شحن مجاني كلياً عند الشراء بقيمة أعلى من ' + (data.settings.freeShippingMin || 200) + ' ر.س', time: 'اليوم' },
  ];

  const activeCategories = data.categories
    .filter(c => c.active)
    .sort((a, b) => a.order - b.order);

  const searchResults = searchQuery.trim().length >= 1 ? searchProducts(searchQuery) : [];
  const topProducts = searchResults.slice(0, 5);
  const matchingCategories = searchQuery.trim().length >= 2
    ? data.categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  useEffect(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (cartCount > 0) {
      cartControls.start({
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, 0],
        transition: { duration: 0.4 }
      });
    }
  }, [cartCount, cartControls]);

  const handleSearchSubmit = (query: string) => {
    const q = query.trim();
    if (!q) return;

    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch {}

    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchQuery(q);
    setIsSearchOpen(false);
    setIsDrawerOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, topProducts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && topProducts[selectedIndex]) {
        e.preventDefault();
        navigate(`/product/${topProducts[selectedIndex].id}`);
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return (
    <header className="sticky top-0 z-[100] bg-white shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Top Announcement Bar */}
      {data.settings.showAnnouncement && data.settings.announcement && (
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 px-3 py-1.5 text-center text-[11px] font-bold text-white tracking-wide shadow-inner">
          <p className="line-clamp-1">{data.settings.announcement}</p>
        </div>
      )}

      {/* Backdrop overlay when search is open */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[110px] z-[-1] bg-black/20 backdrop-blur-[2px] lg:top-[140px]"
            onClick={() => setIsSearchOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Navbar Row */}
      <div className="border-b border-orange-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
          {/* Mobile Menu Drawer Toggle */}
          <button
            type="button"
            className="rounded-lg p-2 text-gray-700 hover:bg-orange-50 lg:hidden"
            onClick={() => setIsDrawerOpen(prev => !prev)}
            aria-label="القائمة"
          >
            {isDrawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo Brand */}
          <Link to={isRealMember ? '/home' : '/auth'} className="flex shrink-0 items-center gap-2">
            {data.settings.showBrandMark !== false && <BrandLogoBadge />}
            <div className="flex flex-col">
              <div className="text-sm font-black leading-tight text-gray-900 sm:text-base sm:leading-none">
                {data.settings.siteName}
              </div>
              <div className="text-[9px] text-gray-400 sm:text-[10px]">
                {data.settings.siteTagline}
              </div>
            </div>
          </Link>

          {/* Desktop Search Bar with Autocomplete dropdown */}
          <div ref={desktopSearchRef} className="relative mx-auto hidden max-w-xl flex-1 md:block">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSearchSubmit(searchQuery);
              }}
              className="relative w-full"
            >
              <div className="group relative">
                <input
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="ابحث عن منتج أو قسم..."
                  className="w-full rounded-2xl border-2 border-orange-100 bg-orange-50/30 py-2.5 pe-24 ps-11 text-sm font-medium outline-none transition-all focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
                <Search
                  size={18}
                  className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500"
                />
                <div className="absolute end-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-95"
                  >
                    بحث
                  </button>
                </div>
              </div>
            </form>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {isSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute inset-x-0 top-full mt-3 overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
                >
                  <div className="max-h-[450px] overflow-y-auto p-3">
                    {/* Recent Searches */}
                    {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 px-2 flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                            عمليات البحث الأخيرة
                          </span>
                          <button
                            onClick={clearRecentSearches}
                            className="text-[10px] font-bold text-orange-600 hover:underline"
                          >
                            مسح الكل
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 px-1">
                          {recentSearches.map(term => (
                            <button
                              key={term}
                              onClick={() => handleSearchSubmit(term)}
                              className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all"
                            >
                              <Clock size={12} className="text-gray-400" />
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Categories */}
                    {matchingCategories.length > 0 && (
                      <div className="mb-4 border-b border-gray-50 pb-3">
                        <div className="mb-2 px-2 text-[11px] font-black uppercase tracking-wider text-gray-400">
                          الأقسام المطابقة
                        </div>
                        <div className="grid grid-cols-2 gap-2 px-1">
                          {matchingCategories.map(cat => (
                            <Link
                              key={cat.id}
                              to={`/category/${cat.id}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-2 rounded-xl p-2 hover:bg-orange-50 group"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <Layers size={14} />
                              </div>
                              <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600">
                                {cat.name}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Products */}
                    {topProducts.length > 0 ? (
                      <div>
                        <div className="mb-2 px-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-400">
                          <span>المنتجات المقترحة</span>
                          <span>{searchResults.length} نتيجة</span>
                        </div>
                        <div className="space-y-1 px-1">
                          {topProducts.map((prod, idx) => (
                            <button
                              key={prod.id}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              onClick={() => {
                                navigate(`/product/${prod.id}`);
                                setIsSearchOpen(false);
                                setSearchQuery('');
                              }}
                              className={`group flex w-full items-center gap-3 rounded-2xl p-2.5 text-start transition-all ${
                                selectedIndex === idx
                                  ? 'bg-orange-50 ring-1 ring-orange-100'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                <img src={prod.images[0]} className="h-full w-full object-cover" alt="" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <div
                                  className={`truncate text-sm font-bold transition-colors ${
                                    selectedIndex === idx ? 'text-orange-600' : 'text-gray-900'
                                  }`}
                                >
                                  {prod.name}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-orange-600">
                                    {prod.price} {data.settings.currencySymbol}
                                  </span>
                                  {prod.originalPrice > prod.price && (
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {prod.originalPrice} {data.settings.currencySymbol}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`rounded-full p-1.5 transition-all ${
                                  selectedIndex === idx
                                    ? 'bg-orange-500 text-white translate-x-0 opacity-100'
                                    : 'text-gray-300 translate-x-2 opacity-0'
                                }`}
                              >
                                <ChevronLeft size={16} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : searchQuery.trim().length >= 1 ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="mb-3 rounded-full bg-gray-50 p-4">
                          <Search size={32} className="text-gray-300" />
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          لم نجد أي نتائج لـ «{searchQuery}»
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          جرب البحث بكلمات أخرى أو تصفح الأقسام
                        </div>
                      </div>
                    ) : recentSearches.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Sparkles size={32} className="mb-3 text-orange-200" />
                        <div className="text-sm font-bold text-gray-900">اكتشف أحدث المنتجات</div>
                        <div className="mt-1 text-xs text-gray-400">ابدأ الكتابة للبحث عما تريد</div>
                      </div>
                    ) : null}
                  </div>

                  {searchQuery.trim().length > 0 && topProducts.length > 0 && (
                    <button
                      onClick={() => handleSearchSubmit(searchQuery)}
                      className="flex w-full items-center justify-center gap-2 border-t border-gray-50 bg-gray-50/50 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      عرض كافة النتائج ({searchResults.length})
                      <ArrowRight size={14} className="rotate-180" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Action Icons Right Side */}
          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            {isRealMember ? (
              <>
                {/* WhatsApp Support Direct Button */}
                <a
                  href={`https://wa.me/${data.settings.whatsapp || '963954475933'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="relative block rounded-full p-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-90"
                  title="تواصل مع المتجر"
                >
                  <Phone size={22} />
                </a>

                {/* Notifications Button with Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(prev => !prev);
                      if (unreadNotifCount > 0) setUnreadNotifCount(0);
                    }}
                    className="relative block rounded-full p-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-90"
                    aria-label="التنبيهات"
                    title="التنبيهات الإشعارات"
                  >
                    <Bell size={22} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute end-1.5 top-1.5 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {isNotifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute end-0 mt-2 w-80 rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-black/5 z-50 text-right space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                            <Bell size={14} className="text-orange-500" />
                            الإشعارات والتنبيهات
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsNotifOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {notificationsList.map(n => (
                            <div key={n.id} className="rounded-2xl bg-gray-50 p-3 hover:bg-orange-50/50 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-black text-slate-900">{n.title}</span>
                                <span className="text-[9px] font-bold text-gray-400">{n.time}</span>
                              </div>
                              <p className="text-[11px] font-bold text-gray-600 leading-tight">{n.desc}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Shopping Cart Icon with Badge */}
                <motion.div animate={cartControls}>
                  <Link
                    to="/cart"
                    id="cart-icon-target"
                    className="relative block rounded-full p-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-90"
                    aria-label="السلة"
                  >
                    <ShoppingBag size={22} />
                    {cartCount > 0 && (
                      <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </motion.div>

                {/* Profile Icon / Custom Avatar */}
                <Link
                  to="/profile"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-90 border border-gray-200/80 shadow-sm"
                  aria-label="حسابي"
                  title="صفحة حسابي الشخصي"
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} className="h-full w-full object-cover" alt={currentUser.name} />
                  ) : (
                    <User size={20} />
                  )}
                </Link>
              </>
            ) : isGuest && !isAuthOrProfilePage ? (
              /* Auth Buttons ONLY when browsing store pages as Guest */
              <div className="flex items-center gap-1.5 ms-1">
                <Link
                  to="/auth?tab=login"
                  className="rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/auth?tab=register"
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-3.5 py-1.5 text-xs font-black text-white shadow-sm hover:opacity-95 transition-all"
                >
                  اشترك
                </Link>
              </div>
            ) : null}

            {/* Admin Portal Button */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800 sm:flex transition-colors"
                title="لوحة التحكم"
              >
                <ShieldCheck size={14} />
                لوحة التحكم
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div ref={mobileSearchRef} className="relative px-3 pb-3 md:hidden">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSearchSubmit(searchQuery);
            }}
          >
            <div className="relative group">
              <input
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="ابحث في المتجر..."
                className="w-full rounded-2xl border border-orange-100 bg-orange-50/40 py-2.5 pe-10 ps-10 text-sm font-medium outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/5 transition-all"
              />
              <Search
                size={16}
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute end-10 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute end-3.5 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-600 active:scale-90 transition-all"
                title="رجوع"
              >
                <ArrowRight size={18} className="rotate-180" />
              </button>
            </div>
          </form>

          {/* Mobile Autocomplete Dropdown */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute inset-x-3 top-full z-[999] mt-2 max-h-[70vh] overflow-y-auto rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-black/5"
              >
                {searchQuery.trim().length === 0 && recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-[10px] font-black uppercase text-gray-400">البحث الأخير</span>
                      <button onClick={clearRecentSearches} className="text-[10px] font-bold text-orange-600">
                        مسح
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map(term => (
                        <button
                          key={term}
                          onClick={() => handleSearchSubmit(term)}
                          className="flex items-center gap-1.5 rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 active:bg-orange-100"
                        >
                          <Clock size={12} className="text-gray-400" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {topProducts.length > 0 ? (
                  <div className="p-1">
                    <div className="mb-2 px-2 text-[10px] font-black uppercase text-gray-400">أفضل النتائج</div>
                    <div className="space-y-1">
                      {topProducts.map(prod => (
                        <button
                          key={prod.id}
                          onClick={() => {
                            navigate(`/product/${prod.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl p-2 text-start active:bg-orange-50"
                        >
                          <img
                            src={prod.images[0]}
                            className="h-11 w-11 rounded-xl object-cover border border-gray-50"
                            alt=""
                          />
                          <div className="flex-1 overflow-hidden">
                            <div className="truncate text-sm font-bold text-gray-900">{prod.name}</div>
                            <div className="text-xs font-black text-orange-600">
                              {prod.price} {data.settings.currencySymbol}
                            </div>
                          </div>
                          <ChevronLeft size={14} className="text-gray-300" />
                        </button>
                      ))}
                    </div>
                    {searchResults.length > 5 && (
                      <button
                        onClick={() => handleSearchSubmit(searchQuery)}
                        className="mt-2 w-full rounded-xl bg-gray-50 py-2.5 text-xs font-bold text-gray-600"
                      >
                        عرض كل النتائج ({searchResults.length})
                      </button>
                    )}
                  </div>
                ) : searchQuery.trim().length >= 1 ? (
                  <div className="p-8 text-center text-sm text-gray-400 font-medium">
                    لا توجد نتائج لـ «{searchQuery}»
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Category Nav Bar */}
        <nav className="hidden border-t border-orange-50 lg:block">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 no-scrollbar">
            <Link
              to="/categories"
              className="shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-200"
            >
              كل الأقسام
            </Link>
            <Link
              to="/deals"
              className="shrink-0 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              ⚡ عروض البرق
            </Link>
            {activeCategories.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isDrawerOpen && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 top-[110px] z-[-1] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-orange-100 bg-white shadow-2xl lg:hidden"
            >
              <div className="flex flex-col gap-1 p-4">
                <Link
                  to="/categories"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3 font-bold text-orange-600"
                >
                  <span>كل الأقسام</span>
                  <ChevronLeft size={18} />
                </Link>
                <Link
                  to="/deals"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 font-bold text-red-600"
                >
                  <span>⚡ عروض البرق</span>
                  <ChevronLeft size={18} />
                </Link>
                <div className="mt-2 space-y-1">
                  {activeCategories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                      <span>{cat.name}</span>
                      <ChevronLeft size={14} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3.5 font-bold text-white shadow-lg active:scale-95 transition-transform"
                  >
                    <ShieldCheck size={18} />
                    لوحة التحكم
                  </Link>
                )}
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </header>
  );
};
