import React, { useState, useMemo } from 'react';
import { Layers, Star, Zap, Sparkles, TrendingUp, Search } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AdminCollectionsPage: React.FC = () => {
  const { data, updateProduct } = useShop();
  const [collectionType, setCollectionType] = useState<'featured' | 'new' | 'flash'>('featured');
  const [search, setSearch] = useState('');

  const products = data.products || [];

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(s)) ||
      p.id.toLowerCase().includes(s)
    );
  }, [products, search]);

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
            <Star size={14} className="text-orange-500" />
            <span className="text-[10px] font-black">{products.length} منتج إجمالي</span>
          </div>
        </div>

        {/* Right Side: Title & Icon */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="text-right">
            <h1 className="text-lg font-black text-white flex items-center justify-end gap-3">
              إدارة المجموعات
              <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                <Layers className="text-orange-500" size={20} />
              </div>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">تخصيص منتجات الصفحة الرئيسية</p>
          </div>
        </div>
      </div>

      {/* Collection Switcher */}
      <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5">
        {[
          { id: 'featured', label: 'منتجات مميزة ⭐', icon: Star },
          { id: 'new', label: 'وصل حديثاً ✨', icon: Sparkles },
          { id: 'flash', label: 'عروض البرق ⚡', icon: Zap }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCollectionType(tab.id as any)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[10px] font-black transition-all ${
              collectionType === tab.id
                ? 'bg-slate-900 text-white shadow-xl'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredProducts.map(prod => {
          const isIncluded =
            collectionType === 'featured'
              ? prod.featured
              : collectionType === 'new'
              ? prod.isNew
              : prod.flashDeal;

          return (
            <div
              key={prod.id}
              className={`flex items-center justify-between rounded-[1.5rem] bg-white p-3.5 shadow-sm ring-1 transition-all ${isIncluded ? 'ring-emerald-200 bg-emerald-50/10' : 'ring-black/5'}`}
            >
              <div className="flex items-center gap-3">
                <img src={prod.images[0]} className="h-12 w-12 rounded-xl object-cover bg-slate-50 border border-slate-100" alt="" />
                <div className="text-right">
                  <div className="font-black text-xs text-slate-900 line-clamp-1">{prod.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{prod.price} {data.settings.currencySymbol}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (collectionType === 'featured') {
                    updateProduct(prod.id, { featured: !prod.featured });
                  } else if (collectionType === 'new') {
                    updateProduct(prod.id, { isNew: !prod.isNew });
                  } else {
                    updateProduct(prod.id, { flashDeal: !prod.flashDeal });
                  }
                }}
                className={`rounded-full px-3 py-1 text-[10px] font-black transition-all border ${
                  isIncluded
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {isIncluded ? 'مدرج بالقسم' : 'غير مدرج'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
