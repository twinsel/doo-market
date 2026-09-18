import React, { useState, useMemo } from 'react';
import { Zap, Clock, Search, Timer, CheckCircle2, History, TrendingDown, DollarSign } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { motion } from 'framer-motion';
import { Product } from '../../types';

// ============================================================
// ⚡  بطاقة عرض البرق المطورة - نمط بطاقة الأقسام
// ============================================================

const FlashDealCard: React.FC<{
  product: Product;
  currencySymbol: string;
  onToggle: (id: string, current: boolean) => void;
  onExtend: (id: string, hours: number) => void;
}> = ({ product, currencySymbol, onToggle, onExtend }) => {
  const isFlash = Boolean(product.flashDeal);
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[2.5rem] shadow-sm ring-1 transition-all duration-300 overflow-hidden ${
        isFlash
          ? 'ring-blue-200 hover:ring-blue-300 hover:shadow-xl'
          : 'ring-black/5 bg-slate-50/50 opacity-70'
      }`}
    >
      {/* ====== HEADER ====== */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-100">
              <img
                src={product.images[0] || '/images/placeholder.jpg'}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            {isFlash && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                LIVE
              </span>
            )}
            <span className={`absolute -bottom-1 -left-1 h-5 w-5 rounded-full border-4 border-white shadow-sm ${isFlash ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          </div>

          {/* Info */}
          <div className="flex-1 text-right min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  isFlash ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {isFlash ? 'نشط الآن' : 'غير مفعل'}
                </span>
              </div>
            </div>

            <h3 className="font-black text-base text-slate-900 mt-1 line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-end">
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                خصم {discount}%
              </span>
              <span className="text-[9px] font-black text-slate-400">
                📦 المخزون: {product.stock}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====== BODY ====== */}
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/30">
          <div className="flex-1 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">سعر العرض الحالي</p>
            <div className="flex items-center gap-2 mt-1 justify-end">
               <span className="text-xl font-black text-slate-900">{product.price.toLocaleString()} {currencySymbol}</span>
               <span className="text-[10px] text-slate-400 line-through">{product.originalPrice.toLocaleString()}</span>
            </div>
          </div>
          {isFlash && (
            <div className="shrink-0 border-r border-slate-200 pr-4 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">الحالة</p>
              <p className="text-[10px] font-black text-emerald-600 mt-1 flex items-center gap-1"><Timer size={10}/> نشط</p>
            </div>
          )}
        </div>

        {isFlash && (
           <div className="flex items-center justify-between p-2 px-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-slate-500">تمديد العرض:</span>
              <div className="flex gap-2">
                 <button onClick={() => onExtend(product.id, 4)} className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-[10px] font-black transition-all border border-slate-100">+4س</button>
                 <button onClick={() => onExtend(product.id, 8)} className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-[10px] font-black transition-all border border-slate-100">+8س</button>
                 <button onClick={() => onExtend(product.id, 24)} className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-[10px] font-black transition-all border border-slate-100">+24س</button>
              </div>
           </div>
        )}
      </div>

      {/* ====== FOOTER ====== */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30" dir="rtl">
        <button
          onClick={() => onToggle(product.id, isFlash)}
          className={`w-full h-10 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
            isFlash
            ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600'
            : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
          }`}
        >
          {isFlash ? <Zap size={14} /> : <Zap size={14} />}
          {isFlash ? 'إيقاف العرض فوراً' : 'تفعيل العرض البرق'}
        </button>
      </div>
    </motion.div>
  );
};

export const AdminFlashDealsPage: React.FC = () => {
  const { data, updateProduct } = useShop();
  const [search, setSearch] = useState('');

  const products = data.products || [];
  const currencySymbol = data.settings.currencySymbol || 'ر.س';

  const filtered = useMemo(() => {
    return products.filter(
      p => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleToggleFlash = (id: string, current: boolean) => {
    const next = !current;
    updateProduct(id, {
      flashDeal: next,
      flashEndsAt: next ? new Date(Date.now() + 8 * 3600 * 1000).toISOString() : undefined
    });
  };

  const handleExtend = (id: string, hours: number) => {
    updateProduct(id, {
      flashDeal: true,
      flashEndsAt: new Date(Date.now() + hours * 3600 * 1000).toISOString()
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Row */}
      <div className="relative h-20 overflow-hidden rounded-3xl bg-slate-900 px-6 shadow-xl flex items-center justify-between">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

        {/* Left Side: Actions & Search */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative group hidden sm:block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث سريع..."
              className="h-9 pr-9 pl-4 rounded-full bg-white/5 border border-white/10 text-white text-[10px] placeholder:text-slate-500 focus:bg-white focus:text-slate-900 outline-none transition-all w-40 font-bold"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10 text-white">
            <Clock size={14} className="text-orange-500" />
            <span className="text-[10px] font-black">{products.filter(p => p.flashDeal).length} عروض نشطة</span>
          </div>
        </div>

        {/* Right Side: Title & Icon */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="text-right">
            <h1 className="text-lg font-black text-white flex items-center justify-end gap-3">
              عروض البرق
              <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <Zap className="text-orange-500" size={20} />
              </div>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">تفعيل وتمديد العروض المؤقتة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(prod => (
          <FlashDealCard
            key={prod.id}
            product={prod}
            currencySymbol={currencySymbol}
            onToggle={handleToggleFlash}
            onExtend={handleExtend}
          />
        ))}
      </div>
    </div>
  );
};
